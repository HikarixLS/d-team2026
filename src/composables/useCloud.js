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

export function useCloud(membersRef, shiftsRef, registrationsRef, leaveRequestsRef, adminAccounts, activitiesRef, activityCheckInsRef) {
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
            showToast("Đã lưu cấu hình Firebase Cloud!");
            showConfigModal.value = false;
            await initCloudRealtime();
        } catch (err) {
            showToast("Mã cấu hình không hợp lệ! " + err.message, "error");
        }
    };

    const initCloudRealtime = async () => {
        if (!window.FirebaseSDK) return;
        const { collection, onSnapshot, signInAnonymously } = window.FirebaseSDK;
        const db = window.firebaseDb;

        if (unsubMembers) unsubMembers();
        if (unsubShifts) unsubShifts();
        if (unsubRegistrations) unsubRegistrations();
        if (unsubLeaveRequests) unsubLeaveRequests();
        if (unsubAdmins) unsubAdmins();
        if (unsubActivities) unsubActivities();
        if (unsubCheckIns) unsubCheckIns();

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
            const membersRefCol = collection(db, 'members');
            unsubMembers = onSnapshot(membersRefCol, (snapshot) => {
                const list = [];
                snapshot.forEach((docSnap) => list.push(docSnap.data()));
                if (list.length > 0 && membersRef) membersRef.value = list;
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
