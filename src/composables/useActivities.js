import { ref, computed } from 'vue';
import { useToast } from './useToast.js';
import { exportExcelFile } from '../utils/fileExport.js';

// Clean up legacy local storage cache so ghost entries never persist
try {
    localStorage.removeItem('local_activities');
    localStorage.removeItem('local_activity_checkins');
    localStorage.removeItem('local_activity_registrations');
} catch (e) {}

const activities = ref([]);
const activityCheckIns = ref([]);
const semesters = ref([]);
const activityRegistrations = ref([]);

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
        // Data is 100% Cloud-managed
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
        const startDate = act.date || act.startDate || getTodayStr();
        const endDate = act.endDate || startDate || getTodayStr();
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
            startDate,
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

    const formatCheckInTime = (dateObj) => {
        if (!dateObj) return '—';
        const d = new Date(dateObj);
        if (isNaN(d.getTime())) return String(dateObj);
        const hours = String(d.getHours()).padStart(2, '0');
        const mins = String(d.getMinutes()).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${hours}h${mins}, ${day}/${month}/${year}`;
    };

    const exportActivityExcel = async (act, stats, membersList = []) => {
        if (!window.XLSX) {
            return showToast('Thư viện XLSX chưa sẵn sàng!', 'error');
        }
        if (!act) return;

        const derived = computeActivityDerivedFields(act);
        const fileName = `${derived.codeId}-${(derived.endDate || '').replace(/-/g, '')} DS DIEM DANH ${act.name}.xlsx`;

        const checkIns = activityCheckIns.value.filter(c => c.activityId === act.id);
        const actRegs = activityRegistrations.value.filter(r => r.activityId === act.id);

        const rowsData = [];
        const headers = [
            "STT",
            "MSSV",
            "Họ và Tên",
            "Ban Hoạt Động",
            "Hoạt Động / Nội Dung",
            "Ngày Diễn Ra",
            "Thời Gian Điểm Danh",
            "Trạng Thái Điểm Danh",
            "Minh Chứng / Ghi Chú"
        ];
        rowsData.push(headers);

        const seenMembers = new Set();
        let stt = 1;

        // 1. Add all check-in & leave records
        checkIns.forEach(p => {
            const mssvStr = String(p.memberId).trim().toUpperCase();
            seenMembers.add(mssvStr);
            const mObj = (membersList || []).find(m => String(m.id).toUpperCase() === mssvStr);
            const memberName = p.memberName || mObj?.name || p.memberId;
            const memberDept = mObj?.department || '—';

            let timeStr = p.formattedTime || '';
            if (!timeStr && p.timestamp) {
                timeStr = formatCheckInTime(p.timestamp);
            }
            if (!timeStr) timeStr = '—';

            let statusStr = 'Đã điểm danh (Có mặt)';
            if (p.status === 'leave') {
                statusStr = 'Vắng có lý do (Xin nghỉ)';
            } else if (p.adminCheckedIn) {
                statusStr = 'Admin điểm danh hộ';
            }

            let proofStatus = p.leaveReason || '';
            if (!proofStatus) {
                proofStatus = p.proofImage ? (p.proofImage.startsWith('data:image') ? 'Đã đính kèm ảnh thẻ SV' : p.proofImage) : '—';
            }

            rowsData.push([
                stt++,
                mssvStr,
                memberName,
                memberDept,
                act.name || derived.contentVN,
                formatDate(act.date),
                timeStr,
                statusStr,
                proofStatus
            ]);
        });

        // 2. Add registered members who haven't checked in yet
        actRegs.forEach(r => {
            const mssvStr = String(r.memberId).trim().toUpperCase();
            if (!seenMembers.has(mssvStr)) {
                seenMembers.add(mssvStr);
                const mObj = (membersList || []).find(m => String(m.id).toUpperCase() === mssvStr);
                const memberName = r.memberName || mObj?.name || r.memberId;
                const memberDept = mObj?.department || '—';

                rowsData.push([
                    stt++,
                    mssvStr,
                    memberName,
                    memberDept,
                    act.name || derived.contentVN,
                    formatDate(r.date || act.date),
                    '—',
                    'Đã đăng ký ca (Chờ điểm danh)',
                    r.notes || '—'
                ]);
            }
        });

        if (rowsData.length === 1) {
            rowsData.push([
                1,
                "—",
                "Chưa có sinh viên điểm danh hoặc đăng ký",
                "—",
                act.name || derived.contentVN,
                formatDate(act.date),
                "—",
                "—",
                "—"
            ]);
        }

        const ws = window.XLSX.utils.aoa_to_sheet(rowsData);
        ws['!cols'] = [
            { wch: 6 },  // STT
            { wch: 14 }, // MSSV
            { wch: 25 }, // Họ và Tên
            { wch: 20 }, // Ban Hoạt Động
            { wch: 35 }, // Hoạt Động
            { wch: 15 }, // Ngày Diễn Ra
            { wch: 22 }, // Thời Gian Điểm Danh
            { wch: 24 }, // Trạng Thái Điểm Danh
            { wch: 25 }  // Minh Chứng / Ghi Chú
        ];

        const wb = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(wb, ws, "DS Điểm Danh");
        await exportExcelFile(wb, fileName, showToast);
    };

    const formatDayMonth = (dateStr) => {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length < 3) return dateStr;
        return `${parseInt(parts[2], 10)}/${parseInt(parts[1], 10)}`;
    };

    const getDateRangeArray = (startStr, endStr) => {
        if (!startStr) return [];
        const end = endStr || startStr;
        const result = [];
        let curr = new Date(startStr);
        const last = new Date(end);
        while (curr <= last) {
            const yyyy = curr.getFullYear();
            const mm = String(curr.getMonth() + 1).padStart(2, '0');
            const dd = String(curr.getDate()).padStart(2, '0');
            result.push(`${yyyy}-${mm}-${dd}`);
            curr.setDate(curr.getDate() + 1);
        }
        return result;
    };

    const exportActivityRegistrationMatrixExcel = async (act, membersList = []) => {
        if (!window.XLSX) {
            return showToast('Thư viện XLSX chưa sẵn sàng!', 'error');
        }

        const derived = computeActivityDerivedFields(act);
        const cleanEndDateStr = (derived.endDate || '').replace(/-/g, '');
        const fileName = `${derived.codeId}-${cleanEndDateStr} DS DANG KY ${act.name}.xlsx`;

        // 1. Gather all activity registrations for this activity
        const actRegs = activityRegistrations.value.filter(r => r.activityId === act.id);

        // 2. Discover dates
        const dateSet = new Set(getDateRangeArray(derived.startDate, derived.endDate));
        actRegs.forEach(r => {
            if (r.date) dateSet.add(r.date);
        });
        const dateList = Array.from(dateSet).sort();

        if (dateList.length === 0) {
            return showToast('Hoạt động này chưa có ngày diễn ra để xuất danh sách!', 'warning');
        }

        // 3. Dynamic Shift Types
        const dynamicTypesSet = new Set(['Ca 1', 'Ca 2', 'Ca 3', 'Ca 4']);
        actRegs.forEach(r => {
            if (r.shiftType) dynamicTypesSet.add(r.shiftType);
        });
        const shiftTypes = Array.from(dynamicTypesSet);

        // 4. Build Matrix Rows Data
        const rowsData = [];

        // Row 1: Headers (Col A: BUỔI, Col B: STT, Date Headers merged across Col C&D, E&F...)
        const row1 = ["BUỔI", "STT"];
        dateList.forEach(d => {
            row1.push(formatDayMonth(d), "");
        });
        rowsData.push(row1);

        // Row 2: Sub-headers ("MSSV", "HỌ VÀ TÊN" under each date)
        const row2 = ["", ""];
        dateList.forEach(() => {
            row2.push("MSSV", "HỌ VÀ TÊN");
        });
        rowsData.push(row2);

        // Group registrations by shiftType and date
        const shiftDateMap = {};
        shiftTypes.forEach(st => {
            shiftDateMap[st] = {};
            dateList.forEach(d => {
                shiftDateMap[st][d] = [];
            });
        });

        actRegs.forEach(r => {
            const st = r.shiftType || 'Ca 1';
            const d = r.date;
            if (shiftDateMap[st] && shiftDateMap[st][d]) {
                const mObj = membersList.find(m => String(m.id).toUpperCase() === String(r.memberId).toUpperCase());
                const name = r.memberName || mObj?.name || r.memberId;
                shiftDateMap[st][d].push({
                    mssv: String(r.memberId).trim().toUpperCase(),
                    name: name
                });
            }
        });

        const merges = [];

        // Date Header Merges (Row 1: C1:D1, E1:F1...)
        for (let i = 0; i < dateList.length; i++) {
            const colStart = 2 + i * 2;
            merges.push({
                s: { r: 0, c: colStart },
                e: { r: 0, c: colStart + 1 }
            });
        }

        // Generate Section Rows per Shift (Ca 1, Ca 2, Ca 3, Ca 4) dynamically adapted to actual participants
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

        // Set column widths matching Hỗ trợ nhập học.xlsx template
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
        window.XLSX.utils.book_append_sheet(wb, ws, "DS Đăng Ký Ca");
        await exportExcelFile(wb, fileName, showToast);
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
        if (!memberId) return showToast('Bạn chưa đăng nhập MSSV!', 'error');

        const memberObj = membersRef?.value?.find(m => m.id === memberId);
        const memberName = memberObj ? memberObj.name : memberId;

        const existing = activityRegistrations.value.find(
            r => r.activityId === activityId && r.memberId.toLowerCase() === memberId.toLowerCase() && r.date === date && r.shiftType === shiftType
        );

        if (existing) {
            return showToast('Bạn đã đăng ký ca này rồi!', 'warning');
        }

        const newReg = {
            id: 'actreg_' + Date.now(),
            activityId,
            memberId,
            memberName,
            date,
            shiftType,
            notes: notes || '',
            createdAt: new Date().toISOString()
        };

        activityRegistrations.value.push(newReg);
        persistLocal();
        await syncActivityRegToCloud(newReg);

        showToast(`Đăng ký thành công ca ${shiftType} ngày ${formatDate(date)}! 🎉`);
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

    const getActivityDates = (act) => {
        if (!act) return [];
        const start = act.date || act.startDate || getTodayStr();
        const end = act.endDate || act.date || start;
        if (start === end) return [start];

        const dates = [];
        const curr = new Date(start);
        const last = new Date(end);
        while (curr <= last) {
            const yyyy = curr.getFullYear();
            const mm = String(curr.getMonth() + 1).padStart(2, '0');
            const dd = String(curr.getDate()).padStart(2, '0');
            dates.push(`${yyyy}-${mm}-${dd}`);
            curr.setDate(curr.getDate() + 1);
        }
        return dates;
    };

    const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycbymKPkZlGwOwHSW1wiUoyNRKvsNnaevzPXZ-EvXHDa4Nauc5iAjjblCJet7Bg62quLE/exec';

    const uploadProofToGoogleDrive = async (base64Data, fileName, folderDateName, actName) => {
        if (!base64Data) return;
        const gasUrl = localStorage.getItem('google_drive_script_url') || window.__googleDriveScriptUrl || DEFAULT_GAS_URL;
        if (!gasUrl) {
            console.log('Google Drive Apps Script Web App chưa cấu hình (Ảnh đã lưu an toàn trên Firestore Cloud).');
            return;
        }

        try {
            const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
            const payload = {
                base64: cleanBase64,
                fileName: fileName || 'photo.jpg',
                folderName: folderDateName || 'HoatDong',
                folderId: '1zbUHwDzxXVfYK_kTIdQvVZXYJ2sVMBsd',
                mimeType: 'image/jpeg',
                actName: actName || ''
            };

            await fetch(gasUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8'
                },
                body: JSON.stringify(payload)
            });
            console.log('⚡ Đã gửi yêu cầu tự động tạo folder & lưu ảnh lên Google Drive!');
        } catch (err) {
            console.warn('Lỗi khi gửi ảnh tới Google Drive Web App:', err);
        }
    };

    // Check-in Activity with strict date permission, proof image, formatted timestamp & Admin check-in on behalf
    const checkInActivity = async (activityId, targetMemberId = null, proofImage = null, proofFileName = null, proofFolderDate = null) => {
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

        const formattedNow = formatCheckInTime(new Date());

        if (existing) {
            if (existing.status === 'present' && !isAdminOperation) {
                return showToast('Bạn đã điểm danh hoạt động này rồi!', 'warning');
            }
            existing.status = 'present';
            existing.timestamp = new Date().toISOString();
            existing.formattedTime = formattedNow;
            existing.leaveReason = '';
            if (proofImage) existing.proofImage = proofImage;
            if (proofFileName) existing.proofFileName = proofFileName;
            if (proofFolderDate) existing.proofFolderDate = proofFolderDate;
            if (isAdminOperation) existing.adminCheckedIn = true;
            persistLocal();
            await syncCheckInToCloud(existing);
            if (proofImage) {
                uploadProofToGoogleDrive(proofImage, proofFileName, proofFolderDate, act.name);
            }
            return showToast(isAdminOperation 
                ? `Quản trị viên đã điểm danh hộ/bù cho "${memberName}" [${memberId}]! 👑`
                : `Đã chuyển trạng thái sang: Điểm Danh thành công cho "${memberName}" lúc ${formattedNow}! ✅`
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
            proofImage: proofImage || '',
            proofFileName: proofFileName || '',
            proofFolderDate: proofFolderDate || '',
            adminCheckedIn: isAdminOperation
        };

        activityCheckIns.value.unshift(newChk);
        persistLocal();
        await syncCheckInToCloud(newChk);
        if (proofImage) {
            uploadProofToGoogleDrive(proofImage, proofFileName, proofFolderDate, act.name);
        }

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
        exportActivityRegistrationMatrixExcel,
        adminActivitySummaryStats,
        persistLocal
    };
}
