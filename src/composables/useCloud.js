import { ref, computed } from 'vue';
import { useToast } from './useToast.js';

const isCloudConnected = ref(false);
const hasFirebaseConfig = ref(true);
const showConfigModal = ref(false);
const configInput = ref('');

const DEFAULT_FIREBASE_CONFIG = {
    apiKey: "AIzaSyB8jLfFekVckhfzP0WtRp3j0lkk9K7-2dU",
    authDomain: "sctdt-a6bf9.firebaseapp.com",
    projectId: "sctdt-a6bf9",
    storageBucket: "sctdt-a6bf9.firebasestorage.app",
    messagingSenderId: "714742650479",
    appId: "1:714742650479:web:682395660baa0cf6ebdf9a"
};

let unsubMembers = null;
let unsubShifts = null;
let unsubRegistrations = null;
let unsubLeaveRequests = null;
let unsubAdmins = null;
let unsubActivities = null;
let unsubCheckIns = null;
let unsubSemesters = null;
let unsubDepartments = null;
let unsubShiftSettings = null;
let unsubActivityRegistrations = null;
let isInitializingCloud = false;
let hasInitializedListeners = false;

export function useCloud(membersRef, shiftsRef, registrationsRef, leaveRequestsRef, adminAccounts, activitiesRef, activityCheckInsRef, semestersRef, departmentsRef, shiftSettingsRef, activityRegistrationsRef) {
    const { showToast } = useToast();

    const cloudStatusText = computed(() => isCloudConnected.value ? '🟢 Cloud' : (hasFirebaseConfig.value ? '🟡 Đang kết nối...' : '🔴 Local Mode'));

    const openConfigModal = () => {
        const saved = localStorage.getItem('firebase_config');
        configInput.value = saved || JSON.stringify(DEFAULT_FIREBASE_CONFIG, null, 2);
        showConfigModal.value = true;
    };

    const resetConfigToDefault = async () => {
        configInput.value = JSON.stringify(DEFAULT_FIREBASE_CONFIG, null, 2);
        localStorage.setItem('firebase_config', JSON.stringify(DEFAULT_FIREBASE_CONFIG));
        showToast('⚡ Đã tự động nạp & lưu cấu hình mặc định!');
        showConfigModal.value = false;
        await initCloudRealtime(true);
    };

    const saveFirebaseConfig = async () => {
        try {
            let text = configInput.value.trim();
            const cfg = JSON.parse(text);
            if (!cfg.apiKey || !cfg.projectId) throw new Error("Cấu hình thiếu apiKey hoặc projectId");
            localStorage.setItem('firebase_config', JSON.stringify(cfg));
            hasFirebaseConfig.value = true;
            showToast('Đã lưu cấu hình Firebase Cloud thành công! 🚀');
            showConfigModal.value = false;
            await initCloudRealtime(true);
        } catch (err) {
            showToast('Lỗi cú pháp JSON cấu hình: ' + err.message, 'error');
        }
    };

    let hasWarnedQuota = false;

    // Lấy ngày đầu tiên của tháng trước (cửa sổ 60 ngày gần nhất) để tối ưu lượt đọc Firestore
    const getActiveWindowMinDate = () => {
        const now = new Date();
        const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const y = prevMonth.getFullYear();
        const m = String(prevMonth.getMonth() + 1).padStart(2, '0');
        return `${y}-${m}-01`;
    };

    const initCloudRealtime = async (force = false) => {
        if (isInitializingCloud) return;
        // Nếu đã khởi tạo listener và không ép buộc (force), giữ nguyên kết nối để Firebase SDK tự duy trì token stream, tránh re-read toàn bộ CSDL
        if (hasInitializedListeners && !force) return;

        isInitializingCloud = true;
        const saved = localStorage.getItem('firebase_config');
        const config = saved ? JSON.parse(saved) : DEFAULT_FIREBASE_CONFIG;
        if (!config || !config.apiKey) {
            hasFirebaseConfig.value = false;
            isCloudConnected.value = false;
            isInitializingCloud = false;
            return;
        }

        const app = window.initFirebaseApp ? window.initFirebaseApp(config) : null;
        const { collection, onSnapshot, signInAnonymously, doc, setDoc, query, where, getDocs } = window.FirebaseSDK;
        const db = window.firebaseDb;

        // Chỉ hủy listener khi người dùng chủ động yêu cầu đổi cấu hình hoặc nạp lại (force)
        if (force) {
            if (unsubMembers) { unsubMembers(); unsubMembers = null; }
            if (unsubShifts) { unsubShifts(); unsubShifts = null; }
            if (unsubRegistrations) { unsubRegistrations(); unsubRegistrations = null; }
            if (unsubLeaveRequests) { unsubLeaveRequests(); unsubLeaveRequests = null; }
            if (unsubAdmins) { unsubAdmins(); unsubAdmins = null; }
            if (unsubActivities) { unsubActivities(); unsubActivities = null; }
            if (unsubCheckIns) { unsubCheckIns(); unsubCheckIns = null; }
            if (unsubSemesters) { unsubSemesters(); unsubSemesters = null; }
            if (unsubDepartments) { unsubDepartments(); unsubDepartments = null; }
            if (unsubShiftSettings) { unsubShiftSettings(); unsubShiftSettings = null; }
            if (unsubActivityRegistrations) { unsubActivityRegistrations(); unsubActivityRegistrations = null; }
            hasInitializedListeners = false;
        }

        if (!db) {
            isInitializingCloud = false;
            return;
        }

        if (window.firebaseAuth && signInAnonymously) {
            try {
                await signInAnonymously(window.firebaseAuth);
            } catch (e) {
                // Ignore auth fallback if rules allow public access
            }
        }

        const handleSnapshotError = (err) => {
            console.warn("Firestore listener state:", err.code || err.message);
            isCloudConnected.value = false;
            isInitializingCloud = false;
            if (err && (err.code === 'resource-exhausted' || (err.message && err.message.includes('Quota exceeded')))) {
                if (!hasWarnedQuota) {
                    hasWarnedQuota = true;
                    showToast('⚠️ Firestore tạm đạt giới hạn đọc hôm nay (Free Quota). App đang dùng dữ liệu lưu tạm offline!', 'warning');
                }
            }
        };

        const extractNameFromData = (data, canonicalId) => {
            if (!data || typeof data !== 'object') return canonicalId;

            const nameKeys = [
                'name', 'fullName', 'hoTen', 'ho_ten', 'full_name', 'ten',
                'Name', 'HoTen', 'FullName', 'HoVaTen', 'ho_va_ten',
                'tenSV', 'ten_sv', 'TenSV', 'StudentName', 'student_name',
                'user_name', 'display_name', 'label'
            ];

            for (const key of nameKeys) {
                if (data[key] && typeof data[key] === 'string' && data[key].trim()) {
                    const val = data[key].trim();
                    if (val.toUpperCase() !== canonicalId && !val.startsWith('Thành viên [')) {
                        return val;
                    }
                }
            }

            const excludeKeys = new Set(['id', 'mssv', 'maSV', 'studentId', 'code', 'memberId', 'role', 'department', 'dob', 'createdAt', 'targetShifts', 'password']);

            for (const key in data) {
                if (!excludeKeys.has(key) && data[key] && typeof data[key] === 'string' && data[key].trim()) {
                    const val = data[key].trim();
                    if (val.toUpperCase() !== canonicalId && !val.startsWith('Thành viên [')) {
                        return val;
                    }
                }
            }

            return canonicalId;
        };

        try {
            const minDate = getActiveWindowMinDate();

            // 1. Members: Lắng nghe danh sách thành viên & cache localStorage
            const membersRefCol = collection(db, 'members');
            unsubMembers = onSnapshot(membersRefCol, (snapshot) => {
                const map = new Map();
                snapshot.forEach((docSnap) => {
                    const data = docSnap.data();
                    const rawId = data.id || data.mssv || data.maSV || data.studentId || data.code || data.memberId || docSnap.id;
                    const canonicalId = String(rawId).trim().toUpperCase();
                    const name = extractNameFromData(data, canonicalId);

                    const memberObj = {
                        ...data,
                        id: canonicalId,
                        name: name,
                        docId: docSnap.id
                    };

                    if (map.has(canonicalId)) {
                        const existing = map.get(canonicalId);
                        if (existing.name === canonicalId && name !== canonicalId) {
                            map.set(canonicalId, memberObj);
                        }
                    } else {
                        map.set(canonicalId, memberObj);
                    }
                });
                const list = Array.from(map.values());
                if (membersRef) {
                    membersRef.value = list;
                    try {
                        localStorage.setItem('local_members', JSON.stringify(list));
                    } catch (e) {}
                }
                isCloudConnected.value = true;
            }, handleSnapshotError);

            // 2. Shifts: Giới hạn đọc từ ngày 01 của tháng trước đến nay (giảm 85%+ lượt đọc)
            const shiftsRefCol = collection(db, 'shifts');
            const shiftsQuery = (query && where) ? query(shiftsRefCol, where('date', '>=', minDate)) : shiftsRefCol;
            unsubShifts = onSnapshot(shiftsQuery, (snapshot) => {
                const incoming = [];
                snapshot.forEach((docSnap) => incoming.push(docSnap.data()));

                // Merge ca trực từ server với các ca trực cũ hơn đã có trong bộ nhớ / localStorage
                const existing = Array.isArray(shiftsRef.value) ? shiftsRef.value : [];
                const older = existing.filter(s => s && s.date && s.date < minDate);
                const map = new Map();
                older.forEach(s => map.set(s.id || `${s.date}_${s.shiftType}_${s.memberId}`, s));
                incoming.forEach(s => map.set(s.id || `${s.date}_${s.shiftType}_${s.memberId}`, s));
                const merged = Array.from(map.values()).sort((a, b) => new Date(b.date) - new Date(a.date));

                if (shiftsRef) shiftsRef.value = merged;
                try { localStorage.setItem('local_shifts', JSON.stringify(merged)); } catch (e) {}
                isCloudConnected.value = true;
            }, handleSnapshotError);

            // 3. Registrations: Giới hạn đọc từ ngày 01 của tháng trước đến nay
            const regsRefCol = collection(db, 'registrations');
            const regsQuery = (query && where) ? query(regsRefCol, where('date', '>=', minDate)) : regsRefCol;
            unsubRegistrations = onSnapshot(regsQuery, (snapshot) => {
                const incoming = [];
                snapshot.forEach((docSnap) => incoming.push(docSnap.data()));

                const existing = Array.isArray(registrationsRef.value) ? registrationsRef.value : [];
                const older = existing.filter(r => r && r.date && r.date < minDate);
                const map = new Map();
                older.forEach(r => map.set(r.id || `${r.date}_${r.shiftType}_${r.memberId}`, r));
                incoming.forEach(r => map.set(r.id || `${r.date}_${r.shiftType}_${r.memberId}`, r));
                const merged = Array.from(map.values()).sort((a, b) => new Date(b.date) - new Date(a.date));

                if (registrationsRef) registrationsRef.value = merged;
                try { localStorage.setItem('local_registrations', JSON.stringify(merged)); } catch (e) {}
                isCloudConnected.value = true;
            }, handleSnapshotError);

            // 4. Leave Requests: Giới hạn theo ngày gần đây
            const leaveRefCol = collection(db, 'leave_requests');
            const leaveQuery = (query && where) ? query(leaveRefCol, where('date', '>=', minDate)) : leaveRefCol;
            unsubLeaveRequests = onSnapshot(leaveQuery, (snapshot) => {
                const incoming = [];
                snapshot.forEach((docSnap) => incoming.push(docSnap.data()));

                const existing = Array.isArray(leaveRequestsRef.value) ? leaveRequestsRef.value : [];
                const older = existing.filter(l => l && l.date && l.date < minDate);
                const map = new Map();
                older.forEach(l => map.set(l.id, l));
                incoming.forEach(l => map.set(l.id, l));
                const merged = Array.from(map.values()).sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));

                if (leaveRequestsRef) leaveRequestsRef.value = merged;
                try { localStorage.setItem('local_leave_requests', JSON.stringify(merged)); } catch (e) {}
                isCloudConnected.value = true;
            }, handleSnapshotError);

            // 5. Admin Accounts: Dùng getDocs đọc 1 lần duy nhất khi khởi tạo, không duy trì listener real-time tốn reads
            const adminsRefCol = collection(db, 'admin_accounts');
            if (getDocs) {
                getDocs(adminsRefCol).then((snapshot) => {
                    const list = [];
                    snapshot.forEach((docSnap) => {
                        const admData = docSnap.data();
                        list.push(admData);
                        const rawId = admData.id || admData.mssv || docSnap.id;
                        const canonicalId = String(rawId).trim().toUpperCase();
                        const admName = admData.name || admData.fullName || admData.hoTen;

                        if (admName && admName !== canonicalId && !admName.startsWith('Thành viên [')) {
                            if (membersRef && Array.isArray(membersRef.value)) {
                                const foundIndex = membersRef.value.findIndex(m => m && String(m.id || m.mssv).trim().toUpperCase() === canonicalId);
                                if (foundIndex !== -1) {
                                    membersRef.value[foundIndex].name = admName;
                                    membersRef.value[foundIndex].department = admData.department || membersRef.value[foundIndex].department || 'Ban Điều hành';
                                    membersRef.value[foundIndex].role = 'admin';
                                } else {
                                    membersRef.value.push({
                                        id: canonicalId,
                                        mssv: canonicalId,
                                        name: admName,
                                        department: admData.department || 'Ban Điều hành',
                                        role: 'admin',
                                        targetShifts: 10
                                    });
                                }
                            }
                        }
                    });
                    if (list.length > 0 && adminAccounts) adminAccounts.value = list;
                }).catch(() => {});
            }

            // 6. Activities: Giới hạn theo ngày cửa sổ hiện tại
            const actRefCol = collection(db, 'activities');
            const actQuery = (query && where) ? query(actRefCol, where('date', '>=', minDate)) : actRefCol;
            unsubActivities = onSnapshot(actQuery, (snapshot) => {
                const incoming = [];
                snapshot.forEach((docSnap) => incoming.push(docSnap.data()));

                const existing = Array.isArray(activitiesRef.value) ? activitiesRef.value : [];
                const older = existing.filter(a => a && a.date && a.date < minDate);
                const map = new Map();
                older.forEach(a => map.set(a.id, a));
                incoming.forEach(a => map.set(a.id, a));
                const merged = Array.from(map.values()).sort((a, b) => new Date(b.date) - new Date(a.date));

                if (activitiesRef) activitiesRef.value = merged;
                try { localStorage.setItem('local_activities', JSON.stringify(merged)); } catch (e) {}
                isCloudConnected.value = true;
            }, handleSnapshotError);

            // 7. Activity CheckIns
            const chkRefCol = collection(db, 'activity_checkins');
            unsubCheckIns = onSnapshot(chkRefCol, (snapshot) => {
                const list = [];
                snapshot.forEach((docSnap) => list.push(docSnap.data()));
                list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                if (activityCheckInsRef) activityCheckInsRef.value = list;
                try { localStorage.setItem('local_activity_checkins', JSON.stringify(list)); } catch (e) {}
                isCloudConnected.value = true;
            }, handleSnapshotError);

            // 8. Activity Registrations: Giới hạn theo ngày cửa sổ hiện tại
            const actRegRefCol = collection(db, 'activity_registrations');
            const actRegQuery = (query && where) ? query(actRegRefCol, where('date', '>=', minDate)) : actRegRefCol;
            unsubActivityRegistrations = onSnapshot(actRegQuery, (snapshot) => {
                const incoming = [];
                snapshot.forEach((docSnap) => incoming.push(docSnap.data()));

                const existing = Array.isArray(activityRegistrationsRef.value) ? activityRegistrationsRef.value : [];
                const older = existing.filter(r => r && r.date && r.date < minDate);
                const map = new Map();
                older.forEach(r => map.set(r.id, r));
                incoming.forEach(r => map.set(r.id, r));
                const merged = Array.from(map.values()).sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));

                if (activityRegistrationsRef) activityRegistrationsRef.value = merged;
                try { localStorage.setItem('local_activity_registrations', JSON.stringify(merged)); } catch (e) {}
                isCloudConnected.value = true;
            }, handleSnapshotError);

            // 9. App Config: Semesters
            const semRefDoc = doc(db, 'app_config', 'semesters');
            unsubSemesters = onSnapshot(semRefDoc, (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.data();
                    if (data && Array.isArray(data.list) && semestersRef) {
                        semestersRef.value = data.list;
                    }
                } else {
                    if (semestersRef && semestersRef.value && semestersRef.value.length > 0) {
                        setDoc(semRefDoc, { list: semestersRef.value }).catch(() => {});
                    }
                }
            }, (err) => {});

            // 10. App Config: Departments
            const deptRefDoc = doc(db, 'app_config', 'departments');
            unsubDepartments = onSnapshot(deptRefDoc, (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.data();
                    if (data && Array.isArray(data.list) && departmentsRef) {
                        departmentsRef.value = data.list;
                    }
                } else {
                    if (departmentsRef && departmentsRef.value && departmentsRef.value.length > 0) {
                        setDoc(deptRefDoc, { list: departmentsRef.value }).catch(() => {});
                    }
                }
            }, (err) => {});

            // 11. App Config: Shift Settings
            const shiftSettingsDoc = doc(db, 'app_config', 'shift_settings');
            unsubShiftSettings = onSnapshot(shiftSettingsDoc, (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.data();
                    if (data && shiftSettingsRef) {
                        shiftSettingsRef.value = {
                            isRegistrationOpen: data.isRegistrationOpen !== false,
                            maxPerShift: typeof data.maxPerShift === 'number' ? data.maxPerShift : 0,
                            maxPerDay: typeof data.maxPerDay === 'number' ? data.maxPerDay : 0,
                            shiftTypes: Array.isArray(data.shiftTypes) && data.shiftTypes.length > 0 ? data.shiftTypes : shiftSettingsRef.value.shiftTypes
                        };
                        localStorage.setItem('shift_settings', JSON.stringify(shiftSettingsRef.value));
                    }
                } else {
                    if (shiftSettingsRef && shiftSettingsRef.value) {
                        setDoc(shiftSettingsDoc, shiftSettingsRef.value).catch(() => {});
                    }
                }
            }, (err) => {});

            hasInitializedListeners = true;
            isInitializingCloud = false;
        } catch (e) {
            console.warn("Lỗi kết nối Cloud:", e);
            isCloudConnected.value = false;
            isInitializingCloud = false;
        }
    };

    // Tải dữ liệu các tháng lưu trữ cũ hơn khi người dùng chọn trong bộ lọc tháng (On-Demand Fetching)
    const fetchArchiveMonthShifts = async (monthStr) => {
        if (!monthStr || !window.firebaseDb || !window.FirebaseSDK) return;
        const { collection, query, where, getDocs } = window.FirebaseSDK;
        if (!query || !where || !getDocs) return;

        // Nếu tháng đang nằm trong cửa sổ active (tháng này hoặc tháng trước), active listener đã quản lý
        const minDate = getActiveWindowMinDate();
        if (monthStr >= minDate.substring(0, 7)) return;

        // Nếu đã có dữ liệu của tháng này trong cache, không cần đọc server lại
        const hasShiftsLocally = shiftsRef && Array.isArray(shiftsRef.value) && shiftsRef.value.some(s => s && s.date && s.date.startsWith(monthStr));
        if (hasShiftsLocally) return;

        try {
            const start = `${monthStr}-01`;
            const end = `${monthStr}-31`;
            const [snapS, snapR] = await Promise.all([
                getDocs(query(collection(window.firebaseDb, 'shifts'), where('date', '>=', start), where('date', '<=', end))),
                getDocs(query(collection(window.firebaseDb, 'registrations'), where('date', '>=', start), where('date', '<=', end)))
            ]);

            const newShifts = [];
            snapS.forEach(d => newShifts.push(d.data()));
            const newRegs = [];
            snapR.forEach(d => newRegs.push(d.data()));

            if (newShifts.length > 0 && shiftsRef) {
                const map = new Map();
                shiftsRef.value.forEach(s => map.set(s.id || `${s.date}_${s.shiftType}_${s.memberId}`, s));
                newShifts.forEach(s => map.set(s.id || `${s.date}_${s.shiftType}_${s.memberId}`, s));
                shiftsRef.value = Array.from(map.values()).sort((a, b) => new Date(b.date) - new Date(a.date));
                try { localStorage.setItem('local_shifts', JSON.stringify(shiftsRef.value)); } catch (e) {}
            }
            if (newRegs.length > 0 && registrationsRef) {
                const map = new Map();
                registrationsRef.value.forEach(r => map.set(r.id || `${r.date}_${r.shiftType}_${r.memberId}`, r));
                newRegs.forEach(r => map.set(r.id || `${r.date}_${r.shiftType}_${r.memberId}`, r));
                registrationsRef.value = Array.from(map.values()).sort((a, b) => new Date(b.date) - new Date(a.date));
                try { localStorage.setItem('local_registrations', JSON.stringify(registrationsRef.value)); } catch (e) {}
            }
        } catch (e) {
            console.warn("Lỗi tải ca trực lưu trữ cho tháng " + monthStr, e);
        }
    };

    return {
        isCloudConnected,
        hasFirebaseConfig,
        showConfigModal,
        configInput,
        cloudStatusText,
        openConfigModal,
        resetConfigToDefault,
        saveFirebaseConfig,
        initCloudRealtime,
        fetchArchiveMonthShifts
    };
}
