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

export function useCloud(membersRef, shiftsRef, registrationsRef, leaveRequestsRef, adminAccounts, activitiesRef, activityCheckInsRef, semestersRef, departmentsRef) {
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
        await initCloudRealtime();
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
            await initCloudRealtime();
        } catch (err) {
            showToast('Lỗi cú pháp JSON cấu hình: ' + err.message, 'error');
        }
    };

    const initCloudRealtime = async () => {
        const saved = localStorage.getItem('firebase_config');
        const config = saved ? JSON.parse(saved) : DEFAULT_FIREBASE_CONFIG;
        if (!config || !config.apiKey) {
            hasFirebaseConfig.value = false;
            isCloudConnected.value = false;
            return;
        }

        const app = window.initFirebaseApp ? window.initFirebaseApp(config) : null;
        const { collection, onSnapshot, signInAnonymously, doc, setDoc } = window.FirebaseSDK;
        const db = window.firebaseDb;

        if (unsubMembers) unsubMembers();
        if (unsubShifts) unsubShifts();
        if (unsubRegistrations) unsubRegistrations();
        if (unsubLeaveRequests) unsubLeaveRequests();
        if (unsubAdmins) unsubAdmins();
        if (unsubActivities) unsubActivities();
        if (unsubCheckIns) unsubCheckIns();
        if (unsubSemesters) unsubSemesters();
        if (unsubDepartments) unsubDepartments();

        if (!db) return;

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
        };

        try {
            // Clean up leftover documents in old 'admins' collection if present
            if (window.FirebaseSDK.getDocs && window.FirebaseSDK.deleteDoc) {
                const { getDocs, deleteDoc } = window.FirebaseSDK;
                getDocs(collection(db, 'admins')).then(snap => {
                    snap.forEach(docSnap => deleteDoc(docSnap.ref).catch(() => {}));
                }).catch(() => {});
            }
        } catch (e) {}

        try {
            const membersRefCol = collection(db, 'members');
            unsubMembers = onSnapshot(membersRefCol, (snapshot) => {
                const list = [];
                snapshot.forEach((docSnap) => {
                    const data = docSnap.data();
                    const rawId = data.id || data.mssv || data.maSV || data.studentId || data.code || data.memberId || docSnap.id;
                    const canonicalId = String(rawId).trim().toUpperCase();
                    list.push({
                        ...data,
                        id: canonicalId,
                        docId: docSnap.id
                    });
                });
                if (membersRef) {
                    membersRef.value = list;
                    try {
                        localStorage.setItem('local_members', JSON.stringify(list));
                    } catch (e) {}
                }
                isCloudConnected.value = true;
            }, handleSnapshotError);

            const shiftsRefCol = collection(db, 'shifts');
            unsubShifts = onSnapshot(shiftsRefCol, (snapshot) => {
                const list = [];
                snapshot.forEach((docSnap) => list.push(docSnap.data()));
                list.sort((a, b) => new Date(b.date) - new Date(a.date));
                if (shiftsRef) shiftsRef.value = list;
                isCloudConnected.value = true;
            }, handleSnapshotError);

            const regsRefCol = collection(db, 'registrations');
            unsubRegistrations = onSnapshot(regsRefCol, (snapshot) => {
                const list = [];
                snapshot.forEach((docSnap) => list.push(docSnap.data()));
                list.sort((a, b) => new Date(b.date) - new Date(a.date));
                if (registrationsRef) registrationsRef.value = list;
                isCloudConnected.value = true;
            }, handleSnapshotError);

            const leaveRefCol = collection(db, 'leave_requests');
            unsubLeaveRequests = onSnapshot(leaveRefCol, (snapshot) => {
                const list = [];
                snapshot.forEach((docSnap) => list.push(docSnap.data()));
                list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                if (leaveRequestsRef) leaveRequestsRef.value = list;
                isCloudConnected.value = true;
            }, handleSnapshotError);

            const adminsRefCol = collection(db, 'admin_accounts');
            unsubAdmins = onSnapshot(adminsRefCol, (snapshot) => {
                const list = [];
                snapshot.forEach((docSnap) => list.push(docSnap.data()));
                if (list.length > 0 && adminAccounts) adminAccounts.value = list;
            }, (err) => { /* ignore if admin_accounts collection absent */ });

            const actRefCol = collection(db, 'activities');
            unsubActivities = onSnapshot(actRefCol, (snapshot) => {
                const list = [];
                snapshot.forEach((docSnap) => list.push(docSnap.data()));
                list.sort((a, b) => new Date(b.date) - new Date(a.date));
                if (activitiesRef) activitiesRef.value = list;
                isCloudConnected.value = true;
            }, handleSnapshotError);

            const chkRefCol = collection(db, 'activity_checkins');
            unsubCheckIns = onSnapshot(chkRefCol, (snapshot) => {
                const list = [];
                snapshot.forEach((docSnap) => list.push(docSnap.data()));
                list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                if (activityCheckInsRef) activityCheckInsRef.value = list;
                isCloudConnected.value = true;
            }, handleSnapshotError);

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
        } catch (e) {
            console.warn("Lỗi kết nối Cloud:", e);
            isCloudConnected.value = false;
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
        initCloudRealtime
    };
}
