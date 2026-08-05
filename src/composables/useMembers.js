import { ref, computed } from 'vue';
import { useToast } from './useToast.js';

const initialMembers = [
    { id: 'C2300023', name: 'Lý Gia Huy', department: 'Ban Điều hành', dob: '2003-05-15', role: 'admin', targetShifts: 10 },
    { id: '42300016', name: 'Đỗ Khánh Duy', department: 'Ban Điều hành', dob: '2003-08-20', role: 'admin', targetShifts: 10 },
    { id: 'D2400032', name: 'Huỳnh Thị Mộng Ngân', department: 'Ban Điều hành', dob: '2004-02-10', role: 'admin', targetShifts: 10 },
    { id: '20210001', name: 'Nguyễn Văn An', department: 'Ban Hành chính', dob: '2001-01-01', role: 'member', targetShifts: 10 },
    { id: '20210002', name: 'Trần Thị Bình', department: 'Ban Nhân sự', dob: '2001-02-02', role: 'member', targetShifts: 10 },
    { id: '20210003', name: 'Lê Hoàng Cường', department: 'Ban Truyền thông', dob: '2001-03-03', role: 'member', targetShifts: 10 }
];

const localMembersSaved = localStorage.getItem('local_members');
const members = ref(localMembersSaved ? JSON.parse(localMembersSaved) : initialMembers);

const memberFilterSearch = ref('');
const memberFilterDept = ref('all');
const memberFilterTarget = ref('all');

const showMemberModal = ref(false);
const editingMember = ref(null);
const memberForm = ref({ id: '', name: '', department: '', dob: '', role: 'member', targetShifts: 10 });
const showBatchModal = ref(false);
const batchText = ref('');
const deleteModal = ref({ show: false, title: '', message: '', action: null });

export function useMembers(currentUserRoleRef, loggedInMemberIdRef, shiftsRef, registrationsRef, selectedMonthRef) {
    const { showToast } = useToast();

    const toPlainObject = (obj) => JSON.parse(JSON.stringify(obj));

    const resetMemberFilters = () => {
        memberFilterSearch.value = '';
        memberFilterDept.value = 'all';
        memberFilterTarget.value = 'all';
    };

    const getDeptColorClass = (dept) => {
        switch (dept) {
            case 'Ban Điều hành': return 'bg-purple-100 text-purple-800 border-purple-300';
            case 'Ban Hành chính': return 'bg-sky-100 text-sky-800 border-sky-300';
            case 'Ban Nhân sự': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
            case 'Ban Truyền thông': return 'bg-amber-100 text-amber-800 border-amber-300';
            default: return 'bg-slate-100 text-slate-700 border-slate-300';
        }
    };

    const filteredMembersList = computed(() => {
        let list = members.value;

        if (currentUserRoleRef && currentUserRoleRef.value === 'member' && loggedInMemberIdRef && loggedInMemberIdRef.value) {
            list = list.filter(m => m.id === loggedInMemberIdRef.value);
        }

        if (memberFilterSearch.value.trim()) {
            const kw = memberFilterSearch.value.trim().toLowerCase();
            list = list.filter(m => String(m.name).toLowerCase().includes(kw) || String(m.id).toLowerCase().includes(kw));
        }

        if (memberFilterDept.value !== 'all') {
            list = list.filter(m => m.department === memberFilterDept.value);
        }

        if (memberFilterTarget.value !== 'all') {
            list = list.filter(m => {
                const actualCnt = shiftsRef && selectedMonthRef ? shiftsRef.value.filter(s => s.memberId === m.id && s.date && s.date.substring(0, 7) === selectedMonthRef.value).length : 0;
                return memberFilterTarget.value === 'pass' ? actualCnt >= 10 : actualCnt < 10;
            });
        }

        return list.map(m => {
            const actualCnt = shiftsRef && selectedMonthRef ? shiftsRef.value.filter(s => s.memberId === m.id && s.date && s.date.substring(0, 7) === selectedMonthRef.value).length : 0;
            const regCnt = registrationsRef && selectedMonthRef ? registrationsRef.value.filter(r => r.memberId === m.id && r.date && r.date.substring(0, 7) === selectedMonthRef.value).length : 0;
            return {
                ...m,
                actualCount: actualCnt,
                regCount: regCnt,
                progressPercent: Math.min(100, Math.round((actualCnt / 10) * 100))
            };
        });
    });

    const openMemberModal = (m = null) => {
        if (currentUserRoleRef.value !== 'admin') return showToast('Chỉ Admin mới có quyền quản lý thành viên!', 'error');
        if (m) {
            editingMember.value = m;
            memberForm.value = { ...m, role: m.role || 'member', targetShifts: 10 };
        } else {
            editingMember.value = null;
            memberForm.value = { id: '', name: '', department: 'Ban Điều hành', dob: '', role: 'member', targetShifts: 10 };
        }
        showMemberModal.value = true;
    };

    const saveMember = async () => {
        if (currentUserRoleRef.value !== 'admin') return showToast('Chỉ Admin mới có quyền thực hiện!', 'error');
        if (!memberForm.value.id || !memberForm.value.id.trim()) return showToast('Vui lòng nhập MSSV (ID)!', 'error');
        if (!memberForm.value.name || !memberForm.value.name.trim()) return showToast('Vui lòng nhập Họ tên!', 'error');

        const mId = memberForm.value.id.trim();
        const mData = toPlainObject({
            id: mId,
            name: memberForm.value.name.trim(),
            department: memberForm.value.department || 'Ban Điều hành',
            dob: memberForm.value.dob || '',
            role: memberForm.value.role || 'member',
            targetShifts: 10
        });

        const idx = members.value.findIndex(m => m.id === mId);
        if (idx !== -1) members.value[idx] = mData;
        else members.value.push(mData);

        if (window.firebaseDb && window.FirebaseSDK) {
            try {
                const { collection, doc, setDoc } = window.FirebaseSDK;
                const refDoc = doc(collection(window.firebaseDb, 'members'), mId);
                await setDoc(refDoc, mData);
                showToast(`Đã lưu thành viên [${mData.role === 'admin' ? '👑 Admin' : '👤 User'}] & Đồng bộ Cloud!`);
            } catch (err) {
                showToast('Đã lưu thông tin thành viên!');
            }
        } else {
            showToast('Đã lưu thông tin thành viên!');
        }
        showMemberModal.value = false;
    };

    const confirmDeleteMember = (m) => {
        deleteModal.value = {
            show: true,
            title: 'Xóa Thành Viên?',
            message: `Bạn có chắc muốn xóa thành viên ${m.name} [MSSV: ${m.id}]?`,
            action: async () => {
                members.value = members.value.filter(i => i.id !== m.id);
                if (window.firebaseDb && window.FirebaseSDK) {
                    try {
                        const { collection, doc, deleteDoc: delDoc } = window.FirebaseSDK;
                        await delDoc(doc(collection(window.firebaseDb, 'members'), m.id));
                    } catch (e) { console.error("Lỗi xóa Cloud:", e); }
                }
                showToast('Đã xóa thành viên!');
            }
        };
    };

    const openBatchModal = () => {
        if (currentUserRoleRef.value !== 'admin') return showToast('Chỉ Admin mới có quyền!', 'error');
        batchText.value = '';
        showBatchModal.value = true;
    };

    const saveBatchMembers = async () => {
        if (currentUserRoleRef.value !== 'admin') return showToast('Chỉ Admin mới có quyền!', 'error');
        if (!batchText.value || !batchText.value.trim()) return showToast('Vui lòng dán danh sách!', 'error');
        const lines = batchText.value.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        let count = 0;

        for (const line of lines) {
            const parts = line.split(/[\t,;|]/).map(p => p.trim());
            if (parts.length >= 2) {
                const mId = parts[0];
                const mName = parts[1];
                const mDept = parts[2] || 'Ban Điều hành';
                const mData = { id: mId, name: mName, department: mDept, role: 'member', targetShifts: 10 };

                const idx = members.value.findIndex(m => m.id === mId);
                if (idx !== -1) members.value[idx] = mData;
                else members.value.push(mData);

                if (window.firebaseDb && window.FirebaseSDK) {
                    try {
                        const { collection, doc, setDoc } = window.FirebaseSDK;
                        await setDoc(doc(collection(window.firebaseDb, 'members'), mId), mData);
                    } catch (e) { }
                }
                count++;
            }
        }

        showToast(`Đã nhập thành công ${count} thành viên!`);
        showBatchModal.value = false;
    };

    const pushAllMembersToCloud = async () => {
        if (!window.firebaseDb || !window.FirebaseSDK) return showToast('Chưa kết nối Cloud Firestore!', 'error');
        try {
            const { collection, doc, setDoc } = window.FirebaseSDK;
            for (const m of members.value) {
                await setDoc(doc(collection(window.firebaseDb, 'members'), m.id), toPlainObject(m), { merge: true });
            }
            showToast(`Đã đồng bộ toàn bộ ${members.value.length} thành viên lên Cloud!`);
        } catch (e) {
            showToast('Lỗi đồng bộ danh sách lên Cloud: ' + e.message, 'error');
        }
    };

    return {
        members,
        memberFilterSearch,
        memberFilterDept,
        memberFilterTarget,
        resetMemberFilters,
        getDeptColorClass,
        filteredMembersList,
        showMemberModal,
        editingMember,
        memberForm,
        openMemberModal,
        saveMember,
        confirmDeleteMember,
        showBatchModal,
        batchText,
        openBatchModal,
        saveBatchMembers,
        pushAllMembersToCloud,
        deleteModal
    };
}
