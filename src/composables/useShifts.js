import { ref, computed, watch } from 'vue';
import { useToast } from './useToast.js';

const shifts = ref([]);
const registrations = ref([]);
const leaveRequests = ref([]);

export function useShifts(membersRef, currentUserRoleRef, loggedInMemberIdRef, deleteModalRef) {
    const { showToast } = useToast();

    const getTodayStr = () => {
        const d = new Date();
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const getMonthStr = () => {
        const d = new Date();
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        return `${yyyy}-${mm}`;
    };

    const selectedMonth = ref(getMonthStr());
    const selectedWeek = ref('all');
    const todayDate = computed(() => getTodayStr());

    const toPlainObject = (obj) => JSON.parse(JSON.stringify(obj));

    const findMemberObj = (id) => {
        if (!membersRef || !membersRef.value || !id) return null;
        const target = String(id).trim().toUpperCase();
        const matches = membersRef.value.filter(m => {
            if (!m || typeof m !== 'object') return false;
            for (const key in m) {
                const val = m[key];
                if (val !== undefined && val !== null && typeof val !== 'object') {
                    if (String(val).trim().toUpperCase() === target) {
                        return true;
                    }
                }
            }
            return false;
        });

        if (!matches.length) return null;

        const matchWithRealName = matches.find(m => {
            for (const key in m) {
                if (m[key] && typeof m[key] === 'string' && m[key].trim()) {
                    const val = m[key].trim();
                    if (val.toUpperCase() !== target && !val.startsWith('Thành viên [')) {
                        return true;
                    }
                }
            }
            return false;
        });

        return matchWithRealName || matches[0];
    };

    const getMemberName = (id) => {
        if (!id) return '';
        const target = String(id).trim().toUpperCase();
        const found = findMemberObj(id);
        if (!found) return target;

        const nameKeys = [
            'name', 'fullName', 'hoTen', 'ho_ten', 'full_name', 'ten',
            'Name', 'HoTen', 'FullName', 'HoVaTen', 'ho_va_ten',
            'tenSV', 'ten_sv', 'TenSV', 'StudentName', 'student_name',
            'user_name', 'display_name', 'label'
        ];

        for (const key of nameKeys) {
            if (found[key] && typeof found[key] === 'string' && found[key].trim()) {
                const val = found[key].trim();
                if (val.toUpperCase() !== target && !val.startsWith('Thành viên [')) {
                    return val;
                }
            }
        }

        const excludeKeys = new Set(['id', 'mssv', 'maSV', 'studentId', 'code', 'memberId', 'role', 'department', 'dob', 'createdAt', 'targetShifts', 'password', 'docId']);

        for (const key in found) {
            if (!excludeKeys.has(key) && found[key] && typeof found[key] === 'string' && found[key].trim()) {
                const val = found[key].trim();
                if (val.toUpperCase() !== target && !val.startsWith('Thành viên [')) {
                    return val;
                }
            }
        }

        return target;
    };

    const getMemberDept = (id) => {
        if (!id) return '—';
        const found = findMemberObj(id);
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
        date: getTodayStr(),
        shiftType: 'Ca 1',
        pageNo: '',
        sttNo: '',
        status: 'Đúng giờ',
        notes: ''
    });

    const resetShiftForm = () => {
        shiftForm.value = {
            memberId: activeMember.value ? activeMember.value.id : '',
            date: getTodayStr(),
            shiftType: 'Ca 1',
            pageNo: '',
            sttNo: '',
            status: 'Đúng giờ',
            notes: ''
        };
    };

    const saveShift = async () => {
        const { memberId, date, shiftType, pageNo, sttNo, status, notes } = shiftForm.value;
        if (!memberId) return showToast('Vui lòng chọn Thành Viên Trực!', 'error');
        if (!date) return showToast('Vui lòng chọn Ngày Trực!', 'error');

        // Rule 1: Must be TODAY DATE ONLY (cannot check-in early for tomorrow or late for past dates)
        if (date !== todayDate.value) {
            if (date < todayDate.value) {
                return showToast(`⚠️ Đã quá hạn điểm danh! Không được điểm danh trễ cho ngày đã qua (${formatDate(date)}).`, 'error');
            } else {
                return showToast(`⚠️ Chưa đến ngày trực! Không được điểm danh trước cho ngày tương lai (${formatDate(date)}).`, 'error');
            }
        }

        // Rule 2: Must be a shift that was REGISTERED IN ADVANCE by this member!
        const isRegistered = registrations.value.some(r =>
            r.memberId && r.memberId.toString().toLowerCase() === memberId.toString().toLowerCase() &&
            r.date === date &&
            r.shiftType === shiftType
        );

        if (!isRegistered) {
            const mName = getMemberName(memberId);
            return showToast(`⚠️ Thành viên ${mName} chưa đăng ký ${shiftType} ngày ${formatDate(date)}! Chỉ được điểm danh cho các ca đã đăng ký trước.`, 'error');
        }

        if (!pageNo || !sttNo) return showToast('Vui lòng nhập Trang số và STT sổ gốc!', 'error');

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
        date: getTodayStr(),
        shiftType: 'Ca 1',
        notes: ''
    });

    // Leave Form
    const leaveForm = ref({ memberId: '', selectedRegId: '', shiftDate: '', shiftType: '', department: '', reason: '' });

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

    const getShiftRegisteredCount = (shiftType, dateStr) => {
        if (!dateStr || !shiftType) return 0;
        return registrations.value.filter(r => r.date === dateStr && r.shiftType === shiftType).length;
    };

    const isShiftFullOnDate = (shiftType, dateStr) => {
        return getShiftRegisteredCount(shiftType, dateStr) >= 3;
    };

    const isShiftTakenOnDate = (shiftType, dateStr) => {
        return isShiftFullOnDate(shiftType, dateStr);
    };

    const getTakenShiftsCountForDate = (dateStr) => {
        if (!dateStr) return 0;
        const allTypes = ['Ca 1', 'Ca 2', 'Ca 3', 'Ca 4'];
        return allTypes.filter(st => isShiftFullOnDate(st, dateStr)).length;
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

        // Block registration for past dates
        if (rDate < todayDate.value) {
            return showToast('⚠️ Không thể đăng ký ca trực cho ngày trong quá khứ! Vui lòng chọn từ hôm nay trở đi.', 'error');
        }

        const isDuplicate = registrations.value.some(r => r.memberId === mId && r.date === rDate && r.shiftType === rShift);
        if (isDuplicate) return showToast(`⚠️ Thành viên đã đăng ký ${rShift} cho ngày ${formatDate(rDate)} rồi!`, 'error');

        if (isShiftFullOnDate(rShift, rDate)) {
            return showToast(`⚠️ Ca trực ${rShift} ngày ${formatDate(rDate)} đã kín (Đã đủ 3/3 người)! Vui lòng chọn ca khác.`, 'error');
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

        const targetRegId = l.regId || l.selectedRegId;
        if ((newStatus === 'Đã duyệt' || newStatus === 'Đồng ý') && targetRegId) {
            registrations.value = registrations.value.filter(r => r.id !== targetRegId);
            if (window.firebaseDb && window.FirebaseSDK) {
                try {
                    const { collection, doc, deleteDoc: delDoc } = window.FirebaseSDK;
                    await delDoc(doc(collection(window.firebaseDb, 'registrations'), targetRegId));
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

    const isDateInSelectedWeek = (dateStr) => {
        if (!dateStr) return false;
        if (!selectedWeek.value || selectedWeek.value === 'all') return true;
        const parts = dateStr.split('-');
        if (parts.length < 3) return true;
        const day = parseInt(parts[2], 10);
        if (selectedWeek.value === '1') return day >= 1 && day <= 8;
        if (selectedWeek.value === '2') return day >= 9 && day <= 18;
        if (selectedWeek.value === '3') return day >= 19 && day <= 25;
        if (selectedWeek.value === '4') return day >= 26;
        return true;
    };

    const isDateInSelectedMonth = (dateStr) => {
        if (!dateStr || !selectedMonth.value) return true;
        return dateStr.substring(0, 7) === selectedMonth.value;
    };

    // Filtered Registrations by Month and Week
    const filteredRegistrations = computed(() => {
        let list = registrations.value;
        if (selectedMonth.value) {
            list = list.filter(r => isDateInSelectedMonth(r.date));
        }
        if (selectedWeek.value && selectedWeek.value !== 'all') {
            list = list.filter(r => isDateInSelectedWeek(r.date));
        }
        return list;
    });

    // History & Filters
    const historyFilter = ref({ keyword: '', memberId: '', shiftType: '' });
    const searchedShifts = computed(() => {
        let list = shifts.value;
        if (currentUserRoleRef.value === 'member') {
            list = list.filter(s => s.memberId === loggedInMemberIdRef.value);
        }
        if (selectedMonth.value) {
            list = list.filter(s => isDateInSelectedMonth(s.date));
        }
        if (selectedWeek.value && selectedWeek.value !== 'all') {
            list = list.filter(s => isDateInSelectedWeek(s.date));
        }
        return list.filter(s => {
            if (historyFilter.value.memberId && s.memberId !== historyFilter.value.memberId) return false;
            if (historyFilter.value.shiftType && s.shiftType !== historyFilter.value.shiftType) return false;
            if (historyFilter.value.keyword) {
                const kw = historyFilter.value.keyword.toLowerCase();
                const mName = getMemberName(s.memberId).toLowerCase();
                const mId = String(s.memberId).toLowerCase();
                const page = String(s.pageNo || '');
                const stt = String(s.sttNo || '');
                if (!mName.includes(kw) && !mId.includes(kw) && !page.includes(kw) && !stt.includes(kw)) return false;
            }
            return true;
        });
    });

    const deleteRegistration = async (regId) => {
        if (currentUserRoleRef && (currentUserRoleRef.value === 'member' || currentUserRoleRef === 'member')) {
            return showToast('Thành viên không được xóa ca trực đã đăng ký! Quản trị viên sẽ xóa sau khi duyệt đơn xin nghỉ.', 'error');
        }
        registrations.value = registrations.value.filter(r => r.id !== regId);

        if (window.firebaseDb && window.FirebaseSDK) {
            try {
                const { collection, doc, deleteDoc: delDoc } = window.FirebaseSDK;
                await delDoc(doc(collection(window.firebaseDb, 'registrations'), regId));
            } catch (e) {
                console.warn('Lỗi xóa đăng ký ca trên Cloud:', e);
            }
        }
        showToast('Đã xóa lịch đăng ký ca thành công!');
    };

    const confirmDeleteRegistration = (regObj) => {
        if (!regObj) return;
        if (currentUserRoleRef && (currentUserRoleRef.value === 'member' || currentUserRoleRef === 'member')) {
            return showToast('Thành viên không được tự xóa ca trực đã đăng ký! Hãy gửi Đơn xin nghỉ phép để Quản trị viên duyệt.', 'error');
        }
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
    const formatDayMonth = (dateStr) => {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length < 3) return dateStr;
        return `${parseInt(parts[2], 10)}/${parseInt(parts[1], 10)}`;
    };

    const exportShiftScheduleMatrixExcel = (targetMonth = null, customRegs = null) => {
        if (!window.XLSX) {
            return showToast('Thư viện XLSX chưa sẵn sàng!', 'error');
        }

        const monthStr = targetMonth || selectedMonth.value || getMonthStr();
        const baseList = customRegs || registrations.value;
        const currentMembers = membersRef ? (typeof membersRef === 'function' ? membersRef() : (membersRef.value || membersRef)) : [];

        // Filter registrations for selected month and week if applicable
        let monthRegs = baseList.filter(r => r.date && r.date.substring(0, 7) === monthStr);
        if (selectedWeek.value && selectedWeek.value !== 'all') {
            const weekRegs = monthRegs.filter(r => isDateInSelectedWeek(r.date));
            if (weekRegs.length > 0) monthRegs = weekRegs;
        }
        if (monthRegs.length === 0 && baseList.length > 0) {
            monthRegs = [...baseList];
        }

        if (monthRegs.length === 0) {
            return showToast('Chưa có lịch đăng ký ca trực nào để xuất Excel!', 'warning');
        }

        // Discover unique sorted dates
        const dateSet = new Set();
        monthRegs.forEach(r => { if (r.date) dateSet.add(r.date); });
        const dateList = Array.from(dateSet).sort();

        const shiftTypes = ['Ca 1', 'Ca 2', 'Ca 3', 'Ca 4'];

        const rowsData = [];

        // Row 1: Headers
        const row1 = ["BUỔI", "STT"];
        dateList.forEach(d => {
            row1.push(formatDayMonth(d), "");
        });
        rowsData.push(row1);

        // Row 2: Sub-headers
        const row2 = ["", ""];
        dateList.forEach(() => {
            row2.push("MSSV", "HỌ VÀ TÊN");
        });
        rowsData.push(row2);

        // Map shift and date to list of students
        const shiftDateMap = {};
        shiftTypes.forEach(st => {
            shiftDateMap[st] = {};
            dateList.forEach(d => {
                shiftDateMap[st][d] = [];
            });
        });

        monthRegs.forEach(r => {
            const st = r.shiftType || 'Ca 1';
            const d = r.date;
            if (shiftDateMap[st] && shiftDateMap[st][d]) {
                const mId = String(r.memberId || '').trim().toUpperCase();
                const mObj = findMemberObj(mId) || (Array.isArray(currentMembers) ? currentMembers.find(m => String(m.id).toUpperCase() === mId) : null);
                const name = r.memberName || mObj?.name || getMemberName(mId);
                shiftDateMap[st][d].push({
                    mssv: mId,
                    name: name
                });
            }
        });

        const merges = [];

        // Date headers merges (Row 1: C1:D1, E1:F1...)
        for (let i = 0; i < dateList.length; i++) {
            const colStart = 2 + i * 2;
            merges.push({
                s: { r: 0, c: colStart },
                e: { r: 0, c: colStart + 1 }
            });
        }

        // Sections per Shift (CA 1, CA 2, CA 3, CA 4) dynamically adapted to actual participants
        shiftTypes.forEach(st => {
            let maxCount = 0;
            dateList.forEach(d => {
                if (shiftDateMap[st][d].length > maxCount) {
                    maxCount = shiftDateMap[st][d].length;
                }
            });

            // Dynamically fit row count to actual participants (only 1 row if empty)
            const rowCount = Math.max(1, maxCount);

            const startRowIndex = rowsData.length;

            for (let idx = 0; idx < rowCount; idx++) {
                const row = [st.toUpperCase(), idx + 1];
                dateList.forEach(d => {
                    const student = shiftDateMap[st][d][idx];
                    if (student) {
                        row.push(student.mssv, student.name);
                    } else {
                        row.push("", "");
                    }
                });
                rowsData.push(row);
            }

            // Vertical merge for BUỔI column (Col A) for this shift block
            merges.push({
                s: { r: startRowIndex, c: 0 },
                e: { r: startRowIndex + rowCount - 1, c: 0 }
            });
        });

        const ws = window.XLSX.utils.aoa_to_sheet(rowsData);
        ws['!merges'] = merges;

        // Set column widths matching template
        const cols = [
            { wch: 10 }, // BUỔI
            { wch: 6 }   // STT
        ];
        dateList.forEach(() => {
            cols.push({ wch: 14 }); // MSSV
            cols.push({ wch: 25 }); // HỌ VÀ TÊN
        });
        ws['!cols'] = cols;

        const wb = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(wb, ws, "Lịch Ca Làm");
        const fileName = `Lich_Ca_Lam_${monthStr}.xlsx`;
        window.XLSX.writeFile(wb, fileName);
        showToast(`Xuất file Excel Mẫu Lịch Ca Làm "${fileName}" thành công! 📊`);
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
        getShiftRegisteredCount,
        isShiftFullOnDate,
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
        filteredRegistrations,
        deleteRegistration,
        confirmDeleteRegistration,
        exportShiftScheduleMatrixExcel
    };
}
