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

const defaultSemesters = [
    'Học kỳ 1 (2026-2027)',
    'Học kỳ 2 (2026-2027)',
    'Học kỳ 3 (2026-2027)',
    'Học kỳ Hè (2026-2027)'
];

const savedActivities = localStorage.getItem('local_activities');
const savedCheckIns = localStorage.getItem('local_activity_checkins');
const savedSemesters = localStorage.getItem('local_semesters');
const savedActRegs = localStorage.getItem('local_activity_registrations');

const activities = ref(savedActivities ? JSON.parse(savedActivities) : defaultActivities);
const activityCheckIns = ref(savedCheckIns ? JSON.parse(savedCheckIns) : defaultCheckIns);
const semesters = ref(savedSemesters ? JSON.parse(savedSemesters) : defaultSemesters);
const activityRegistrations = ref(savedActRegs ? JSON.parse(savedActRegs) : []);

export function useActivities(membersRef, loggedInMemberIdRef, currentUserRoleRef) {
    const { showToast } = useToast();

    const toPlainObject = (obj) => JSON.parse(JSON.stringify(obj));

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length < 3) return dateStr;
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    };

    const persistLocal = () => {
        localStorage.setItem('local_activities', JSON.stringify(activities.value));
        localStorage.setItem('local_activity_checkins', JSON.stringify(activityCheckIns.value));
        localStorage.setItem('local_semesters', JSON.stringify(semesters.value));
        localStorage.setItem('local_activity_registrations', JSON.stringify(activityRegistrations.value));
    };

    const addSemester = (semName) => {
        if (!semName || !semName.trim()) return showToast('Vui lòng nhập tên học kỳ!', 'error');
        const name = semName.trim();
        if (semesters.value.includes(name)) return showToast('Học kỳ này đã tồn tại!', 'warning');
        semesters.value.push(name);
        persistLocal();
        showToast(`Đã thêm học kỳ "${name}" thành công! 🎉`);
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

    const syncActivityRegToCloud = async (regObj) => {
        if (window.FirebaseSDK && window.firebaseDb) {
            try {
                const { doc, setDoc } = window.FirebaseSDK;
                const docRef = doc(window.firebaseDb, 'activity_registrations', regObj.id);
                await setDoc(docRef, toPlainObject(regObj));
            } catch (err) {
                console.warn('Không thể đồng bộ Đăng ký hoạt động lên Cloud:', err);
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

    const toggleTrainingPointsSubmitted = async (actId) => {
        const act = activities.value.find(a => a.id === actId);
        if (!act) return;
        act.submittedTrainingPoints = !act.submittedTrainingPoints;
        persistLocal();
        await syncActivityToCloud(act);
        showToast(act.submittedTrainingPoints
            ? `Đã đánh dấu HOÀN THÀNH gửi điểm rèn luyện cho "${act.name}"! 🟢`
            : `Đã bỏ đánh dấu gửi điểm rèn luyện cho "${act.name}". ⚪`
        );
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

        const startDate = formData.date;
        const endDate = formData.endDate && formData.endDate >= startDate ? formData.endDate : startDate;

        const newAct = {
            id: 'act_' + Date.now(),
            name: formData.name.trim(),
            date: startDate,
            endDate: endDate,
            semester: formData.semester.trim(),
            location: formData.location ? formData.location.trim() : 'Trường ĐH',
            description: formData.description ? formData.description.trim() : '',
            submittedTrainingPoints: Boolean(formData.submittedTrainingPoints),
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
        activityRegistrations.value = activityRegistrations.value.filter(r => r.activityId !== actId);

        persistLocal();
        await deleteActivityFromCloud(actId);

        showToast(`Đã xóa hoạt động "${actName}"!`);
    };

    const getTodayStr = () => {
        const d = new Date();
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const registerActivityShift = async ({ activityId, date, shiftType, notes }) => {
        const memberId = loggedInMemberIdRef ? loggedInMemberIdRef.value : '';
        if (!memberId) return showToast('Vui lòng đăng nhập để đăng ký!', 'error');
        if (!activityId || !date || !shiftType) return showToast('Vui lòng chọn ngày và ca trực!', 'error');

        const todayStr = getTodayStr();
        if (date < todayStr) {
            return showToast('⚠️ Không thể đăng ký ca hoạt động cho ngày trong quá khứ!', 'error');
        }

        const isDup = activityRegistrations.value.some(
            r => r.activityId === activityId && r.memberId.toLowerCase() === memberId.toLowerCase() && r.date === date && r.shiftType === shiftType
        );
        if (isDup) {
            return showToast(`Bạn đã đăng ký ${shiftType} ngày ${formatDate(date)} cho hoạt động này rồi!`, 'warning');
        }

        const memberObj = membersRef?.value?.find(m => m.id === memberId);
        const memberName = memberObj ? memberObj.name : memberId;

        const newReg = {
            id: 'actreg_' + Date.now(),
            activityId,
            memberId,
            memberName,
            date,
            shiftType,
            notes: notes ? notes.trim() : '',
            createdAt: new Date().toISOString()
        };

        activityRegistrations.value.unshift(newReg);
        persistLocal();
        await syncActivityRegToCloud(newReg);
        showToast(`Đăng ký tham gia ${shiftType} ngày ${formatDate(date)} thành công! 🎉`);
    };

    const deleteActivityRegistration = async (regId) => {
        activityRegistrations.value = activityRegistrations.value.filter(r => r.id !== regId);
        persistLocal();
        if (window.FirebaseSDK && window.firebaseDb) {
            try {
                const { doc, deleteDoc } = window.FirebaseSDK;
                await deleteDoc(doc(window.firebaseDb, 'activity_registrations', regId));
            } catch (err) { }
        }
        showToast('Đã hủy lịch đăng ký ca hoạt động!');
    };

    // Helper: generate array of date strings between start and end
    const getActivityDates = (act) => {
        if (!act || !act.date) return [];
        const dates = [];
        const parts = act.date.split('-');
        const endParts = (act.endDate || act.date).split('-');

        const start = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        const end = new Date(Number(endParts[0]), Number(endParts[1]) - 1, Number(endParts[2]));

        const curr = new Date(start);
        while (curr <= end) {
            const yyyy = curr.getFullYear();
            const mm = String(curr.getMonth() + 1).padStart(2, '0');
            const dd = String(curr.getDate()).padStart(2, '0');
            dates.push(`${yyyy}-${mm}-${dd}`);
            curr.setDate(curr.getDate() + 1);
        }
        return dates;
    };

    // Check-in Activity with strict date permission & Admin check-in on behalf
    const checkInActivity = async (activityId, targetMemberId = null) => {
        const memberId = targetMemberId || (loggedInMemberIdRef ? loggedInMemberIdRef.value : '');
        const isAdminOperation = Boolean(targetMemberId) || (currentUserRoleRef && (currentUserRoleRef.value === 'admin' || currentUserRoleRef === 'admin'));

        if (!memberId) {
            return showToast('Chưa chọn thành viên hoặc chưa đăng nhập MSSV!', 'error');
        }

        const act = activities.value.find(a => a.id === activityId);
        if (!act) return showToast('Không tìm thấy hoạt động!', 'error');

        const todayDate = getTodayStr();

        // Tighten check-in rules for regular members: ONLY allowed on dates of activity
        if (!isAdminOperation) {
            const actDates = getActivityDates(act);
            if (!actDates.includes(todayDate)) {
                if (act.date > todayDate) {
                    return showToast(`Chưa đến ngày diễn ra (${formatDate(act.date)}). Không thể điểm danh trước!`, 'warning');
                } else {
                    const existing = activityCheckIns.value.find(
                        c => c.activityId === activityId && c.memberId.toLowerCase() === memberId.toLowerCase()
                    );
                    if (!existing || existing.status !== 'present') {
                        return showToast(`Hoạt động ngày ${formatDate(act.date)} đã quá hạn! Nhờ Quản trị viên điểm danh bù.`, 'error');
                    }
                }
            }
        }

        const memberObj = membersRef?.value?.find(m => m.id === memberId);
        const memberName = memberObj ? memberObj.name : memberId;

        const existing = activityCheckIns.value.find(
            c => c.activityId === activityId && c.memberId.toLowerCase() === memberId.toLowerCase()
        );

        if (existing) {
            if (existing.status === 'present' && !isAdminOperation) {
                return showToast('Bạn đã điểm danh hoạt động này rồi!', 'warning');
            }
            existing.status = 'present';
            existing.timestamp = new Date().toISOString();
            existing.leaveReason = '';
            if (isAdminOperation) existing.adminCheckedIn = true;
            persistLocal();
            await syncCheckInToCloud(existing);
            return showToast(isAdminOperation 
                ? `Quản trị viên đã điểm danh hộ/bù cho "${memberName}" [${memberId}]! 👑`
                : `Đã chuyển trạng thái sang: Điểm Danh thành công cho "${memberName}"! ✅`
            );
        }

        const newChk = {
            id: 'chk_' + Date.now(),
            activityId,
            memberId,
            memberName,
            timestamp: new Date().toISOString(),
            status: 'present',
            leaveReason: '',
            adminCheckedIn: isAdminOperation
        };

        activityCheckIns.value.unshift(newChk);
        persistLocal();
        await syncCheckInToCloud(newChk);

        showToast(isAdminOperation 
            ? `Quản trị viên đã điểm danh hộ/bù thành công cho "${memberName}"! 👑`
            : `Điểm danh hoạt động thành công! 🎉 (${memberName})`
        );
    };

    const requestLeaveActivity = async (activityId, leaveReason) => {
        const memberId = loggedInMemberIdRef ? loggedInMemberIdRef.value : '';
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
        const memberId = loggedInMemberIdRef ? loggedInMemberIdRef.value : '';
        if (!memberId) return null;
        return activityCheckIns.value.find(
            c => c.activityId === activityId && c.memberId.toLowerCase() === memberId.toLowerCase()
        ) || null;
    };

    const getActivityStats = (activityId) => {
        const checkIns = activityCheckIns.value.filter(c => c.activityId === activityId);
        const presentList = checkIns.filter(c => c.status === 'present');
        const leaveList = checkIns.filter(c => c.status === 'leave');
        const regsList = activityRegistrations.value.filter(r => r.activityId === activityId);

        return {
            totalCheckIns: presentList.length,
            totalLeaves: leaveList.length,
            totalRegistrations: regsList.length,
            presentList,
            leaveList,
            regsList,
            allRecords: checkIns
        };
    };

    return {
        activities,
        activityCheckIns,
        semesters,
        activityRegistrations,
        addSemester,
        toggleTrainingPointsSubmitted,
        createActivity,
        deleteActivity,
        registerActivityShift,
        deleteActivityRegistration,
        getActivityDates,
        checkInActivity,
        requestLeaveActivity,
        getUserCheckInRecord,
        getActivityStats,
        persistLocal
    };
}
