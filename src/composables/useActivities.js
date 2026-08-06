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
const savedActRegs = localStorage.getItem('local_activity_registrations');

const activities = ref(savedActivities ? JSON.parse(savedActivities) : defaultActivities);
const activityCheckIns = ref(savedCheckIns ? JSON.parse(savedCheckIns) : defaultCheckIns);
const semesters = ref(defaultSemesters);
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
        localStorage.setItem('local_activity_registrations', JSON.stringify(activityRegistrations.value));
    };

    const syncSemestersToCloud = async () => {
        if (window.FirebaseSDK && window.firebaseDb) {
            try {
                const { doc, setDoc } = window.FirebaseSDK;
                const docRef = doc(window.firebaseDb, 'app_config', 'semesters');
                await setDoc(docRef, { list: semesters.value });
            } catch (err) {
                console.warn('Không thể đồng bộ Học kỳ lên Cloud:', err);
            }
        }
    };

    const addSemester = async (semName) => {
        if (!semName || !semName.trim()) return showToast('Vui lòng nhập tên học kỳ!', 'error');
        const name = semName.trim();
        if (semesters.value.includes(name)) return showToast('Học kỳ này đã tồn tại!', 'warning');
        semesters.value.push(name);
        await syncSemestersToCloud();
        showToast(`Đã thêm học kỳ "${name}" lên Cloud thành công! 🎉`);
    };

    const deleteSemester = async (semName) => {
        if (!semName) return;
        if (semesters.value.length <= 1) {
            return showToast('Không thể xóa! Hệ thống phải giữ lại ít nhất 1 học kỳ.', 'warning');
        }
        semesters.value = semesters.value.filter(s => s !== semName);
        await syncSemestersToCloud();
        showToast(`Đã xóa học kỳ "${semName}" trên Cloud thành công!`);
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

    const addDaysToStr = (dateStr, numDays) => {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length < 3) return dateStr;
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        d.setDate(d.getDate() + numDays);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const getTodayStr = () => {
        const d = new Date();
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const getNextCodeId = () => {
        if (!activities.value.length) return 1;
        const maxCode = activities.value.reduce((max, a) => {
            const c = Number(a.codeId || a.code || 0);
            return c > max ? c : max;
        }, 0);
        return maxCode + 1;
    };

    const computeActivityDerivedFields = (act) => {
        if (!act) return {};
        const codeId = act.codeId || act.code || 1;
        const endDate = act.endDate || act.date || getTodayStr();
        const deadlineDate = act.deadlineDate || addDaysToStr(endDate, 3);
        const location = act.location || 'Trường ĐH';

        const contentVN = `Tham gia ${act.name} tại ${location}, ngày ${formatDate(endDate)}`;
        const contentEN = `Participating in ${act.name} at ${location}, on ${formatDate(endDate)}`;

        const submitDate = act.submitDate || '';
        const todayStr = getTodayStr();

        let progressStatus = 'Chưa gửi';
        let conclusionStatus = 'Chưa gửi';

        if (submitDate) {
            progressStatus = 'Đã xử lý';
            if (submitDate < deadlineDate) {
                conclusionStatus = 'Gửi sớm hạn';
            } else if (submitDate === deadlineDate) {
                conclusionStatus = 'Gửi đúng hạn';
            } else {
                conclusionStatus = 'Gửi trễ hạn';
            }
        } else {
            if (todayStr > deadlineDate) {
                progressStatus = 'Đã quá hạn';
            } else {
                progressStatus = 'Chưa gửi';
            }
            conclusionStatus = 'Chưa có';
        }

        const cleanEndDateStr = endDate.replace(/-/g, '');
        const excelFileName = `${codeId}-${cleanEndDateStr} DSSV ${act.name}.xlsx`;

        return {
            codeId,
            endDate,
            deadlineDate,
            location,
            contentVN,
            contentEN,
            submitDate,
            progressStatus,
            conclusionStatus,
            excelFileName
        };
    };

    const toggleTrainingPointsSubmitted = async (actId) => {
        const act = activities.value.find(a => a.id === actId);
        if (!act) return;
        act.submittedTrainingPoints = !act.submittedTrainingPoints;
        if (act.submittedTrainingPoints && !act.submitDate) {
            act.submitDate = getTodayStr();
        }
        persistLocal();
        await syncActivityToCloud(act);
        showToast(act.submittedTrainingPoints
            ? `Đã đánh dấu HOÀN THÀNH gửi điểm rèn luyện cho "${act.name}"! 🟢`
            : `Đã bỏ đánh dấu gửi điểm rèn luyện cho "${act.name}". ⚪`
        );
    };

    const updateActivitySubmitDate = async (actId, newSubmitDate) => {
        const act = activities.value.find(a => a.id === actId);
        if (!act) return;
        act.submitDate = newSubmitDate || '';
        if (newSubmitDate) act.submittedTrainingPoints = true;
        persistLocal();
        await syncActivityToCloud(act);
        showToast(`Đã cập nhật ngày gửi hồ sơ cho "${act.name}"! 📅`);
    };

    const createActivity = async (formData) => {
        if (!formData.name || !formData.name.trim()) {
            return showToast('Vui lòng nhập tên hoạt động!', 'error');
        }
        const endDate = formData.endDate || formData.date;
        if (!endDate) {
            return showToast('Vui lòng chọn thời gian kết thúc hoạt động!', 'error');
        }
        if (!formData.semester || !formData.semester.trim()) {
            return showToast('Vui lòng nhập/chọn học kỳ diễn ra!', 'error');
        }

        const startDate = formData.date || endDate;
        const codeId = getNextCodeId();
        const deadlineDate = addDaysToStr(endDate, 3);
        const location = formData.location ? formData.location.trim() : 'Trường ĐH';
        const submitDate = formData.submitDate ? formData.submitDate.trim() : '';

        const newAct = {
            id: 'act_' + Date.now(),
            codeId: codeId,
            code: codeId,
            name: formData.name.trim(),
            date: startDate,
            endDate: endDate,
            deadlineDate: deadlineDate,
            submitDate: submitDate,
            semester: formData.semester.trim(),
            location: location,
            description: formData.description ? formData.description.trim() : '',
            submittedTrainingPoints: Boolean(formData.submittedTrainingPoints) || Boolean(submitDate),
            createdAt: new Date().toISOString()
        };

        activities.value.unshift(newAct);
        persistLocal();
        await syncActivityToCloud(newAct);

        showToast(`Tạo thành công hoạt động Mã #${newAct.codeId} "${newAct.name}"! 🎉`);
        return true;
    };

    const exportActivityExcel = (act, stats, membersList = []) => {
        if (!window.XLSX) {
            return showToast('Thư viện Excel (XLSX) chưa sẵn sàng!', 'error');
        }
        if (!act) return;

        const derived = computeActivityDerivedFields(act);
        const fileName = derived.excelFileName;

        const presentList = stats?.presentList || [];
        const regsList = stats?.regsList || [];

        const memberMap = new Map();

        presentList.forEach(p => {
            const mObj = membersList.find(m => m.id === p.memberId);
            memberMap.set(p.memberId, {
                mssv: String(p.memberId).trim(),
                name: p.memberName || mObj?.name || p.memberId,
                department: mObj?.department || 'Thành viên',
                status: p.adminCheckedIn ? 'Admin Điểm danh hộ' : 'Đã điểm danh'
            });
        });

        regsList.forEach(r => {
            if (!memberMap.has(r.memberId)) {
                const mObj = membersList.find(m => m.id === r.memberId);
                memberMap.set(r.memberId, {
                    mssv: String(r.memberId).trim(),
                    name: r.memberName || mObj?.name || r.memberId,
                    department: mObj?.department || 'Thành viên',
                    status: 'Đã đăng ký ca'
                });
            }
        });

        const rowsData = [];
        const headers = [
            "STT",
            "MSSV",
            "Họ và Tên",
            "Ban Hoạt Động",
            "Tên Hoạt Động",
            "Nội dung",
            "Content",
            "Địa Điểm Tổ Chức",
            "Thời Gian Kết Thúc",
            "Hạn Gửi Hồ Sơ",
            "Ngày Gửi",
            "Tiến Độ",
            "Kết Luận",
            "Trạng Thái Ghi Nhận"
        ];
        rowsData.push(headers);

        let stt = 1;
        memberMap.forEach(item => {
            rowsData.push([
                stt++,
                item.mssv,
                item.name,
                item.department,
                act.name,
                derived.contentVN,
                derived.contentEN,
                derived.location,
                formatDate(derived.endDate),
                formatDate(derived.deadlineDate),
                derived.submitDate ? formatDate(derived.submitDate) : '—',
                derived.progressStatus,
                derived.conclusionStatus,
                item.status
            ]);
        });

        if (memberMap.size === 0) {
            rowsData.push([
                1,
                "—",
                "Chưa có sinh viên tham gia",
                "—",
                act.name,
                derived.contentVN,
                derived.contentEN,
                derived.location,
                formatDate(derived.endDate),
                formatDate(derived.deadlineDate),
                derived.submitDate ? formatDate(derived.submitDate) : '—',
                derived.progressStatus,
                derived.conclusionStatus,
                "—"
            ]);
        }

        const ws = window.XLSX.utils.aoa_to_sheet(rowsData);

        // Format column MSSV (Col B, index 1) as Text
        const range = window.XLSX.utils.decode_range(ws['!ref']);
        for (let R = range.s.r + 1; R <= range.e.r; ++R) {
            const cellAddress = window.XLSX.utils.encode_cell({ r: R, c: 1 });
            if (ws[cellAddress]) {
                ws[cellAddress].t = 's';
                ws[cellAddress].z = '@';
                ws[cellAddress].v = String(ws[cellAddress].v);
            }
        }

        const wb = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(wb, ws, "DSSV");
        window.XLSX.writeFile(wb, fileName);
        showToast(`Xuất file Excel "${fileName}" thành công! 📊`);
    };

    const adminActivitySummaryStats = computed(() => {
        const todayStr = getTodayStr();
        let totalExecuted = activities.value.length;
        let submittedOnTimeCount = 0;
        let overdueCount = 0;

        activities.value.forEach(act => {
            const derived = computeActivityDerivedFields(act);
            if (act.submittedTrainingPoints || (derived.submitDate && derived.submitDate <= derived.deadlineDate)) {
                submittedOnTimeCount++;
            } else if ((derived.submitDate && derived.submitDate > derived.deadlineDate) || (!derived.submitDate && todayStr > derived.deadlineDate)) {
                overdueCount++;
            }
        });

        return {
            totalExecuted,
            submittedOnTimeCount,
            overdueCount
        };
    });

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
        deleteSemester,
        toggleTrainingPointsSubmitted,
        updateActivitySubmitDate,
        createActivity,
        deleteActivity,
        registerActivityShift,
        deleteActivityRegistration,
        getActivityDates,
        checkInActivity,
        requestLeaveActivity,
        getUserCheckInRecord,
        getActivityStats,
        computeActivityDerivedFields,
        addDaysToStr,
        exportActivityExcel,
        adminActivitySummaryStats,
        persistLocal
    };
}
