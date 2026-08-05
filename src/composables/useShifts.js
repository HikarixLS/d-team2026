import { ref, computed } from 'vue';
import { useToast } from './useToast.js';

const initialShifts = [
    { id: 's_1', memberId: 'C2300023', date: '2026-08-01', shiftType: 'Ca 1', pageNo: 1, sttNo: 1, status: 'Đúng giờ', notes: '' },
    { id: 's_2', memberId: '42300016', date: '2026-08-02', shiftType: 'Ca 2', pageNo: 1, sttNo: 2, status: 'Đúng giờ', notes: '' }
];
const initialRegs = [
    { id: 'r_1', memberId: 'C2300023', date: '2026-08-10', shiftType: 'Ca 1', notes: 'Trực sáng' }
];

const localShiftsSaved = localStorage.getItem('local_shifts');
const localRegsSaved = localStorage.getItem('local_registrations');
const localLeavesSaved = localStorage.getItem('local_leave_requests');

const shifts = ref(localShiftsSaved ? JSON.parse(localShiftsSaved) : initialShifts);
const registrations = ref(localRegsSaved ? JSON.parse(localRegsSaved) : initialRegs);
const leaveRequests = ref(localLeavesSaved ? JSON.parse(localLeavesSaved) : []);

export function useShifts(membersRef, currentUserRoleRef, loggedInMemberIdRef, deleteModalRef) {
    const { showToast } = useToast();

    const selectedMonth = ref(new Date().toISOString().substring(0, 7));
    const selectedWeek = ref('all');
    const todayDate = computed(() => new Date().toISOString().split('T')[0]);

    const toPlainObject = (obj) => JSON.parse(JSON.stringify(obj));

    const getMemberName = (id) => {
        if (!membersRef) return id;
        const found = membersRef.value.find(m => m.id === id);
        return found ? found.name : id;
    };

    const getMemberDept = (id) => {
        if (!membersRef) return '—';
        const found = membersRef.value.find(m => m.id === id);
        return found ? (found.department || '—') : '—';
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length < 3) return dateStr;
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    };

    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        return parts[parts.length - 1].charAt(0).toUpperCase();
    };

    const getWeekNumFromDate = (dateStr) => {
        if (!dateStr) return 1;
        const day = parseInt(dateStr.split('-')[2], 10);
        if (day <= 8) return 1;
        if (day <= 18) return 2;
        if (day <= 25) return 3;
        return 4;
    };

    const getWeekNameFromDate = (dateStr) => {
        const w = getWeekNumFromDate(dateStr);
        if (w === 1) return 'Tuần 1 (Ngày 1 - 8)';
        if (w === 2) return 'Tuần 2 (Ngày 9 - 18)';
        if (w === 3) return 'Tuần 3 (Ngày 19 - 25)';
        return 'Tuần 4 (Ngày 26 - Cuối tháng)';
    };

    // Active Member Helper
    const activeMember = computed(() => {
        if (!membersRef) return null;
        if (currentUserRoleRef.value === 'admin') {
            return membersRef.value.find(m => m.id === loggedInMemberIdRef.value) || membersRef.value[0] || null;
        }
        return membersRef.value.find(m => m.id === loggedInMemberIdRef.value) || null;
    });

    // Form Entry
    const shiftForm = ref({
        memberId: '',
        date: new Date().toISOString().split('T')[0],
        shiftType: 'Ca 1',
        pageNo: '',
        sttNo: '',
        status: 'Đúng giờ',
        notes: ''
    });

    const resetShiftForm = () => {
        shiftForm.value = {
            memberId: activeMember.value ? activeMember.value.id : '',
            date: new Date().toISOString().split('T')[0],
            shiftType: 'Ca 1',
            pageNo: '',
            sttNo: '',
            status: 'Đúng giờ',
            notes: ''
        };
    };

    const saveShift = async () => {
        if (!shiftForm.value.memberId) return showToast('Vui lòng chọn Thành Viên Trực!', 'error');
        if (!shiftForm.value.date) return showToast('Vui lòng chọn Ngày Trực!', 'error');
        if (shiftForm.value.date > todayDate.value) {
            return showToast('⚠️ Không thể điểm danh / ghi nhận ca trực cho ngày tương lai! Chỉ được ghi nhận ca trực từ hôm nay trở về trước.', 'error');
        }
        if (!shiftForm.value.pageNo || !shiftForm.value.sttNo) return showToast('Vui lòng nhập Trang số và STT sổ gốc!', 'error');

        const newId = 's_' + Date.now();
        const shiftData = toPlainObject({
            id: newId,
            memberId: shiftForm.value.memberId,
            date: shiftForm.value.date,
            shiftType: shiftForm.value.shiftType,
            pageNo: Number(shiftForm.value.pageNo),
            sttNo: Number(shiftForm.value.sttNo),
            status: shiftForm.value.status,
            notes: shiftForm.value.notes || '',
            createdAt: new Date().toISOString()
        });

        if (window.firebaseDb && window.FirebaseSDK) {
            try {
                const { collection, doc, setDoc } = window.FirebaseSDK;
                await setDoc(doc(collection(window.firebaseDb, 'shifts'), newId), shiftData);
                showToast('Đã ghi nhận ca trực & Đồng bộ Cloud!');
                resetShiftForm();
            } catch (err) {
                shifts.value.unshift(shiftData);
                resetShiftForm();
            }
        } else {
            shifts.value.unshift(shiftData);
            showToast('Đã lưu ca trực!');
            resetShiftForm();
        }
    };

    // Registration Form
    const regForm = ref({
        memberId: loggedInMemberIdRef ? loggedInMemberIdRef.value : '',
        date: new Date().toISOString().split('T')[0],
        shiftType: 'Ca 1',
        notes: ''
    });

    watch(
        () => [loggedInMemberIdRef ? loggedInMemberIdRef.value : '', currentUserRoleRef ? currentUserRoleRef.value : ''],
        ([newId, role]) => {
            if (newId && (role !== 'admin' || !regForm.value.memberId)) {
                regForm.value.memberId = newId;
            }
            if (newId && !shiftForm.value.memberId) {
                shiftForm.value.memberId = newId;
            }
            if (newId && !leaveForm.value.memberId) {
                leaveForm.value.memberId = newId;
            }
        },
        { immediate: true }
    );

    const isShiftTakenOnDate = (shiftType, dateStr) => {
        if (!dateStr) return false;
        return registrations.value.some(r => r.date === dateStr && r.shiftType === shiftType);
    };

    const getTakenShiftsCountForDate = (dateStr) => {
        if (!dateStr) return 0;
        const dateRegs = registrations.value.filter(r => r.date === dateStr);
        return new Set(dateRegs.map(r => r.shiftType)).size;
    };

    const isRegDateFull = computed(() => {
        if (!regForm.value.date) return false;
        return getTakenShiftsCountForDate(regForm.value.date) >= 4;
    });

    const saveRegistration = async () => {
        // Enforce memberId for non-admin users or if empty
        if ((!currentUserRoleRef || currentUserRoleRef.value !== 'admin' || !regForm.value.memberId) && loggedInMemberIdRef && loggedInMemberIdRef.value) {
            regForm.value.memberId = loggedInMemberIdRef.value;
        }

        if (!regForm.value.memberId) return showToast('Vui lòng chọn Thành Viên Đăng Ký!', 'error');
        if (!regForm.value.date) return showToast('Vui lòng chọn Ngày Đăng Ký!', 'error');

        const mId = regForm.value.memberId;
        const rDate = regForm.value.date;
        const rShift = regForm.value.shiftType;

        const isDuplicate = registrations.value.some(r => r.memberId === mId && r.date === rDate && r.shiftType === rShift);
        if (isDuplicate) return showToast(`⚠️ Thành viên đã đăng ký ${rShift} cho ngày ${formatDate(rDate)} rồi!`, 'error');

        if (isShiftTakenOnDate(rShift, rDate)) {
            return showToast(`⚠️ Ca trực ${rShift} ngày ${formatDate(rDate)} đã kín (Full)! Vui lòng chọn ca khác.`, 'error');
        }

        const countForDay = registrations.value.filter(r => r.memberId === mId && r.date === rDate).length;
        if (countForDay >= 3) {
            return showToast(`⚠️ Thành viên đã đăng ký tối đa 3 ca trực trong ngày ${formatDate(rDate)}! Không thể đăng ký thêm.`, 'error');
        }

        const newId = 'r_' + Date.now();
        const regData = toPlainObject({
            id: newId,
            memberId: mId,
            date: rDate,
            shiftType: rShift,
            notes: regForm.value.notes || '',
            createdAt: new Date().toISOString()
        });

        if (window.firebaseDb && window.FirebaseSDK) {
            try {
                const { collection, doc, setDoc } = window.FirebaseSDK;
                await setDoc(doc(collection(window.firebaseDb, 'registrations'), newId), regData);
                showToast('Đã đăng ký ca trực thành công!');
                regForm.value.notes = '';
            } catch (e) {
                registrations.value.unshift(regData);
                showToast('Đã đăng ký ca trực!');
                regForm.value.notes = '';
            }
        } else {
            registrations.value.unshift(regData);
            showToast('Đã đăng ký ca trực!');
            regForm.value.notes = '';
        }
    };

    // Leave Form & Approvals
    const leaveForm = ref({ memberId: '', selectedRegId: '', shiftDate: '', shiftType: '', department: '', reason: '' });
    const leaveStatusFilter = ref('all');

    const availableRegisteredShifts = computed(() => {
        let mId = leaveForm.value.memberId || (activeMember.value ? activeMember.value.id : '');
        if (!mId) return [];
        return registrations.value.filter(r => r.memberId === mId && r.date >= todayDate.value);
    });

    const onLeaveMemberChange = () => {
        leaveForm.value.selectedRegId = '';
        leaveForm.value.shiftDate = '';
        leaveForm.value.shiftType = '';
        leaveForm.value.department = getMemberDept(leaveForm.value.memberId);
    };

    const onLeaveRegSelect = () => {
        const found = availableRegisteredShifts.value.find(r => r.id === leaveForm.value.selectedRegId);
        if (found) {
            leaveForm.value.shiftDate = found.date;
            leaveForm.value.shiftType = found.shiftType;
        } else {
            leaveForm.value.shiftDate = '';
            leaveForm.value.shiftType = '';
        }
    };

    const saveLeaveRequest = async () => {
        if (!leaveForm.value.memberId) return showToast('Vui lòng chọn Thành Viên!', 'error');
        if (!leaveForm.value.selectedRegId || !leaveForm.value.shiftDate) return showToast('Vui lòng chọn ca trực đã đăng ký để xin nghỉ!', 'error');
        if (!leaveForm.value.reason.trim()) return showToast('Vui lòng nhập Lý Do Xin Nghỉ!', 'error');

        const newId = 'l_' + Date.now();
        const leaveData = toPlainObject({
            id: newId,
            regId: leaveForm.value.selectedRegId,
            memberId: leaveForm.value.memberId,
            memberName: getMemberName(leaveForm.value.memberId),
            department: leaveForm.value.department || getMemberDept(leaveForm.value.memberId),
            shiftDate: leaveForm.value.shiftDate,
            shiftType: leaveForm.value.shiftType,
            reason: leaveForm.value.reason.trim(),
            status: 'Chờ duyệt',
            createdAt: new Date().toISOString()
        });

        if (window.firebaseDb && window.FirebaseSDK) {
            try {
                const { collection, doc, setDoc } = window.FirebaseSDK;
                await setDoc(doc(collection(window.firebaseDb, 'leave_requests'), newId), leaveData);
                showToast('Đã nộp đơn xin nghỉ phép! Đang chờ Admin duyệt.');
            } catch (e) {
                leaveRequests.value.unshift(leaveData);
                showToast('Đã nộp đơn xin nghỉ phép!');
            }
        } else {
            leaveRequests.value.unshift(leaveData);
            showToast('Đã nộp đơn xin nghỉ phép!');
        }

        leaveForm.value.selectedRegId = '';
        leaveForm.value.shiftDate = '';
        leaveForm.value.shiftType = '';
        leaveForm.value.reason = '';
    };

    const updateLeaveStatus = async (l, newStatus) => {
        if (currentUserRoleRef.value !== 'admin') return showToast('Chỉ Admin mới có quyền duyệt đơn!', 'error');
        l.status = newStatus;

        if (newStatus === 'Đã duyệt' && l.regId) {
            registrations.value = registrations.value.filter(r => r.id !== l.regId);
            if (window.firebaseDb && window.FirebaseSDK) {
                try {
                    const { collection, doc, deleteDoc: delDoc } = window.FirebaseSDK;
                    await delDoc(doc(collection(window.firebaseDb, 'registrations'), l.regId));
                } catch (e) { }
            }
        }

        if (window.firebaseDb && window.FirebaseSDK) {
            try {
                const { collection, doc, setDoc } = window.FirebaseSDK;
                await setDoc(doc(collection(window.firebaseDb, 'leave_requests'), l.id), toPlainObject(l), { merge: true });
                showToast(`Đã cập nhật trạng thái đơn: ${newStatus}!`);
            } catch (e) { }
        } else {
            showToast(`Đã cập nhật trạng thái đơn: ${newStatus}!`);
        }
    };

    const filteredLeaveRequests = computed(() => {
        let list = leaveRequests.value;
        if (currentUserRoleRef.value === 'member') {
            list = list.filter(l => l.memberId === loggedInMemberIdRef.value);
        }
        if (leaveStatusFilter.value !== 'all') {
            list = list.filter(l => l.status === leaveStatusFilter.value);
        }
        return list;
    });

    const pendingLeaveCount = computed(() => {
        return leaveRequests.value.filter(l => l.status === 'Chờ duyệt').length;
    });

    // History & Filters
    const historyFilter = ref({ keyword: '', memberId: '', shiftType: '' });
    const searchedShifts = computed(() => {
        let list = shifts.value;
        if (currentUserRoleRef.value === 'member') {
            list = list.filter(s => s.memberId === loggedInMemberIdRef.value);
        }
        return list.filter(s => {
            if (historyFilter.value.memberId && s.memberId !== historyFilter.value.memberId) return false;
            if (historyFilter.value.shiftType && s.shiftType !== historyFilter.value.shiftType) return false;
            if (historyFilter.value.keyword) {
                const kw = historyFilter.value.keyword.toLowerCase();
                const mName = getMemberName(s.memberId).toLowerCase();
                const mId = s.memberId.toLowerCase();
                const page = String(s.pageNo);
                const stt = String(s.sttNo);
                if (!mName.includes(kw) && !mId.includes(kw) && !page.includes(kw) && !stt.includes(kw)) return false;
            }
            return true;
        });
    });

    const deleteRegistration = async (regId) => {
        registrations.value = registrations.value.filter(r => r.id !== regId);
        localStorage.setItem('local_registrations', JSON.stringify(registrations.value));

        if (window.firebaseDb && window.FirebaseSDK) {
            try {
                const { collection, doc, deleteDoc: delDoc } = window.FirebaseSDK;
                await delDoc(doc(collection(window.firebaseDb, 'registrations'), regId));
            } catch (e) {
                console.warn('Lỗi xóa đăng ký ca trên Cloud:', e);
            }
        }
        showToast('Đã hủy lịch đăng ký ca thành công!');
    };

    const confirmDeleteRegistration = (regObj) => {
        if (!regObj) return;
        const regName = getMemberName(regObj.memberId);
        const shiftInfo = `${regObj.shiftType} ngày ${formatDate(regObj.date)}`;

        if (deleteModalRef && deleteModalRef.value) {
            deleteModalRef.value = {
                show: true,
                title: 'Hủy Lịch Đăng Ký?',
                message: `Bạn có chắc muốn hủy lịch đăng ký ${shiftInfo} của ${regName} [MSSV: ${regObj.memberId}]?`,
                action: async () => {
                    await deleteRegistration(regObj.id);
                }
            };
        } else {
            if (confirm(`Bạn có chắc muốn hủy lịch đăng ký ${shiftInfo} của ${regName}?`)) {
                deleteRegistration(regObj.id);
            }
        }
    };

    return {
        shifts,
        registrations,
        leaveRequests,
        selectedMonth,
        selectedWeek,
        todayDate,
        activeMember,
        getMemberName,
        getMemberDept,
        formatDate,
        getInitials,
        getWeekNumFromDate,
        getWeekNameFromDate,
        shiftForm,
        resetShiftForm,
        saveShift,
        regForm,
        saveRegistration,
        isShiftTakenOnDate,
        getTakenShiftsCountForDate,
        isRegDateFull,
        leaveForm,
        availableRegisteredShifts,
        onLeaveMemberChange,
        onLeaveRegSelect,
        saveLeaveRequest,
        leaveStatusFilter,
        filteredLeaveRequests,
        pendingLeaveCount,
        updateLeaveStatus,
        historyFilter,
        searchedShifts,
        deleteRegistration,
        confirmDeleteRegistration
    };
}
