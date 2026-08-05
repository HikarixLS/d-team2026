import { ref, computed } from 'vue';
import { useToast } from './useToast.js';

const defaultActivities = [
    {
        id: 'act_1',
        name: 'Tập huấn Kỹ năng Quản trò & Sinh hoạt tập thể',
        date: '2026-08-10',
        semester: 'Học kỳ 1 (2026-2027)',
        location: 'Hội trường A',
        description: 'Buổi tập huấn sinh hoạt tập thể dành cho toàn thể thành viên câu lạc bộ.',
        createdAt: '2026-08-01T08:00:00.000Z'
    },
    {
        id: 'act_2',
        name: 'Lễ Ra Quân Chiến Dịch Mùa Hè Xanh 2026',
        date: '2026-08-20',
        semester: 'Học kỳ 1 (2026-2027)',
        location: 'Sân trường Trung Tâm',
        description: 'Lễ ra quân cấp trường phát động tinh thần tình nguyện hè.',
        createdAt: '2026-08-02T09:30:00.000Z'
    }
];

const defaultCheckIns = [
    {
        id: 'chk_1',
        activityId: 'act_1',
        memberId: 'C2300023',
        memberName: 'Thành viên Mẫu',
        timestamp: '2026-08-05T08:15:00.000Z',
        status: 'present',
        leaveReason: ''
    }
];

const savedActivities = localStorage.getItem('local_activities');
const savedCheckIns = localStorage.getItem('local_activity_checkins');

const activities = ref(savedActivities ? JSON.parse(savedActivities) : defaultActivities);
const activityCheckIns = ref(savedCheckIns ? JSON.parse(savedCheckIns) : defaultCheckIns);

export function useActivities(membersRef, loggedInMemberIdRef) {
    const { showToast } = useToast();

    const toPlainObject = (obj) => JSON.parse(JSON.stringify(obj));

    const persistLocal = () => {
        localStorage.setItem('local_activities', JSON.stringify(activities.value));
        localStorage.setItem('local_activity_checkins', JSON.stringify(activityCheckIns.value));
    };

    const syncActivityToCloud = async (actObj) => {
        if (window.FirebaseSDK && window.firebaseDb) {
            try {
                const { doc, setDoc } = window.FirebaseSDK;
                const docRef = doc(window.firebaseDb, 'activities', actObj.id);
                await setDoc(docRef, toPlainObject(actObj));
            } catch (err) {
                console.warn('Không thể đồng bộ Hoạt động lên Cloud:', err);
            }
        }
    };

    const syncCheckInToCloud = async (chkObj) => {
        if (window.FirebaseSDK && window.firebaseDb) {
            try {
                const { doc, setDoc } = window.FirebaseSDK;
                const docRef = doc(window.firebaseDb, 'activity_checkins', chkObj.id);
                await setDoc(docRef, toPlainObject(chkObj));
            } catch (err) {
                console.warn('Không thể đồng bộ Điểm danh lên Cloud:', err);
            }
        }
    };

    const deleteActivityFromCloud = async (actId) => {
        if (window.FirebaseSDK && window.firebaseDb) {
            try {
                const { doc, deleteDoc } = window.FirebaseSDK;
                await deleteDoc(doc(window.firebaseDb, 'activities', actId));
            } catch (err) {
                console.warn('Không thể xóa hoạt động trên Cloud:', err);
            }
        }
    };

    const createActivity = async (formData) => {
        if (!formData.name || !formData.name.trim()) {
            return showToast('Vui lòng nhập tên hoạt động!', 'error');
        }
        if (!formData.date) {
            return showToast('Vui lòng chọn ngày diễn ra hoạt động!', 'error');
        }
        if (!formData.semester || !formData.semester.trim()) {
            return showToast('Vui lòng nhập/chọn học kỳ diễn ra!', 'error');
        }

        const newAct = {
            id: 'act_' + Date.now(),
            name: formData.name.trim(),
            date: formData.date,
            semester: formData.semester.trim(),
            location: formData.location ? formData.location.trim() : 'Trường ĐH',
            description: formData.description ? formData.description.trim() : '',
            createdAt: new Date().toISOString()
        };

        activities.value.unshift(newAct);
        persistLocal();
        await syncActivityToCloud(newAct);

        showToast(`Tạo thành công hoạt động "${newAct.name}"! 🎉`);
        return true;
    };

    const deleteActivity = async (actId) => {
        const act = activities.value.find(a => a.id === actId);
        const actName = act ? act.name : actId;

        activities.value = activities.value.filter(a => a.id !== actId);
        activityCheckIns.value = activityCheckIns.value.filter(c => c.activityId !== actId);

        persistLocal();
        await deleteActivityFromCloud(actId);

        showToast(`Đã xóa hoạt động "${actName}"!`);
    };

    const checkInActivity = async (activityId) => {
        const memberId = loggedInMemberIdRef.value;
        if (!memberId) {
            return showToast('Bạn chưa đăng nhập MSSV!', 'error');
        }

        const memberObj = membersRef?.value?.find(m => m.id === memberId);
        const memberName = memberObj ? memberObj.name : memberId;

        const existing = activityCheckIns.value.find(
            c => c.activityId === activityId && c.memberId.toLowerCase() === memberId.toLowerCase()
        );

        if (existing) {
            if (existing.status === 'present') {
                return showToast('Bạn đã điểm danh hoạt động này rồi!', 'warning');
            } else {
                existing.status = 'present';
                existing.timestamp = new Date().toISOString();
                existing.leaveReason = '';
                persistLocal();
                await syncCheckInToCloud(existing);
                return showToast(`Đã chuyển sang: Điểm Danh thành công cho "${memberName}"! ✅`);
            }
        }

        const newChk = {
            id: 'chk_' + Date.now(),
            activityId,
            memberId,
            memberName,
            timestamp: new Date().toISOString(),
            status: 'present',
            leaveReason: ''
        };

        activityCheckIns.value.unshift(newChk);
        persistLocal();
        await syncCheckInToCloud(newChk);

        showToast(`Điểm danh hoạt động thành công! 🎉 (${memberName})`);
    };

    const requestLeaveActivity = async (activityId, leaveReason) => {
        const memberId = loggedInMemberIdRef.value;
        if (!memberId) {
            return showToast('Bạn chưa đăng nhập MSSV!', 'error');
        }
        if (!leaveReason || !leaveReason.trim()) {
            return showToast('Vui lòng nhập lý do xin nghỉ!', 'error');
        }

        const memberObj = membersRef?.value?.find(m => m.id === memberId);
        const memberName = memberObj ? memberObj.name : memberId;

        const existing = activityCheckIns.value.find(
            c => c.activityId === activityId && c.memberId.toLowerCase() === memberId.toLowerCase()
        );

        if (existing) {
            existing.status = 'leave';
            existing.leaveReason = leaveReason.trim();
            existing.timestamp = new Date().toISOString();
            persistLocal();
            await syncCheckInToCloud(existing);
            return showToast('Cập nhật đơn xin nghỉ hoạt động thành công! 📝');
        }

        const newChk = {
            id: 'chk_' + Date.now(),
            activityId,
            memberId,
            memberName,
            timestamp: new Date().toISOString(),
            status: 'leave',
            leaveReason: leaveReason.trim()
        };

        activityCheckIns.value.unshift(newChk);
        persistLocal();
        await syncCheckInToCloud(newChk);

        showToast('Đã gửi đơn xin nghỉ hoạt động thành công! 📝');
    };

    const getUserCheckInRecord = (activityId) => {
        const memberId = loggedInMemberIdRef.value;
        if (!memberId) return null;
        return activityCheckIns.value.find(
            c => c.activityId === activityId && c.memberId.toLowerCase() === memberId.toLowerCase()
        ) || null;
    };

    const getActivityStats = (activityId) => {
        const checkIns = activityCheckIns.value.filter(c => c.activityId === activityId);
        const presentList = checkIns.filter(c => c.status === 'present');
        const leaveList = checkIns.filter(c => c.status === 'leave');

        return {
            totalCheckIns: presentList.length,
            totalLeaves: leaveList.length,
            presentList,
            leaveList,
            allRecords: checkIns
        };
    };

    return {
        activities,
        activityCheckIns,
        createActivity,
        deleteActivity,
        checkInActivity,
        requestLeaveActivity,
        getUserCheckInRecord,
        getActivityStats,
        persistLocal
    };
}
