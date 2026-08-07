import { ref, computed } from 'vue';
import { useToast } from './useToast.js';

// Purge old stale local members cache so data always loads 100% fresh from Cloud Firestore
try {
    localStorage.removeItem('local_members');
} catch (e) {}

const members = ref([]);
const departments = ref([]);

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

    const syncDepartmentsToCloud = async () => {
        if (window.FirebaseSDK && window.firebaseDb) {
            try {
                const { doc, setDoc } = window.FirebaseSDK;
                const docRef = doc(window.firebaseDb, 'app_config', 'departments');
                await setDoc(docRef, { list: departments.value });
            } catch (err) {
                console.warn('Không thể đồng bộ Ban lên Cloud:', err);
            }
        }
    };

    const addDepartment = async (deptName) => {
        if (!deptName || !deptName.trim()) return showToast('Vui lòng nhập tên Ban mới!', 'error');
        const name = deptName.trim();
        if (departments.value.includes(name)) return showToast('Ban này đã tồn tại!', 'warning');
        departments.value.push(name);
        await syncDepartmentsToCloud();
        showToast(`Đã thêm Ban "${name}" lên Cloud thành công! 🎉`);
    };

    const getAdminPassword = (mId) => {
        if (!mId) return 'DVP1234BDH';
        const cleanId = mId.toString().trim();
        const last4 = cleanId.length >= 4 ? cleanId.slice(-4) : cleanId.padStart(4, '0');
        return `DVP${last4}BDH`;
    };

    const toPlainObject = (obj) => JSON.parse(JSON.stringify(obj));

    const getRole = () => {
        if (!currentUserRoleRef) return 'admin';
        return typeof currentUserRoleRef === 'string' ? currentUserRoleRef : (currentUserRoleRef.value || 'admin');
    };

    const resetMemberFilters = () => {
        memberFilterSearch.value = '';
        memberFilterDept.value = 'all';
        memberFilterTarget.value = 'all';
    };

    const getDeptColorClass = (dept) => {
        switch (dept) {
            case 'Ban Điều hành': return 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800';
            case 'Ban Hành chính': return 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800';
            case 'Ban Nhân sự': return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800';
            case 'Ban Truyền thông': return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800';
            default: return 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
        }
    };

    const filteredMembersList = computed(() => {
        let list = members.value;
        const currentRole = getRole();

        if (currentRole === 'member' && loggedInMemberIdRef && loggedInMemberIdRef.value) {
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
                const actualCnt = shiftsRef && selectedMonthRef && selectedMonthRef.value ? shiftsRef.value.filter(s => s.memberId === m.id && s.date && s.date.substring(0, 7) === selectedMonthRef.value).length : 0;
                return memberFilterTarget.value === 'pass' ? actualCnt >= 10 : actualCnt < 10;
            });
        }

        return list.map(m => {
            const actualCnt = shiftsRef && selectedMonthRef && selectedMonthRef.value ? shiftsRef.value.filter(s => s.memberId === m.id && s.date && s.date.substring(0, 7) === selectedMonthRef.value).length : 0;
            const regCnt = registrationsRef && selectedMonthRef && selectedMonthRef.value ? registrationsRef.value.filter(r => r.memberId === m.id && r.date && r.date.substring(0, 7) === selectedMonthRef.value).length : 0;
            return {
                ...m,
                actualCount: actualCnt,
                regCount: regCnt,
                progressPercent: Math.min(100, Math.round((actualCnt / 10) * 100))
            };
        });
    });

    const openMemberModal = (m = null) => {
        const role = getRole();
        if (role !== 'admin') return showToast('Chỉ Quản trị viên mới có quyền quản lý thành viên!', 'error');
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
        const role = getRole();
        if (role !== 'admin') return showToast('Chỉ Quản trị viên mới có quyền thực hiện!', 'error');
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

        localStorage.setItem('local_members', JSON.stringify(members.value));

        if (window.firebaseDb && window.FirebaseSDK) {
            try {
                const { collection, doc, setDoc, deleteDoc } = window.FirebaseSDK;
                const refDoc = doc(collection(window.firebaseDb, 'members'), mId);
                await setDoc(refDoc, mData, { merge: true });

                const adminRefDoc = doc(collection(window.firebaseDb, 'admin_accounts'), mId);
                if (mData.role === 'admin') {
                    const adminPwd = getAdminPassword(mId);
                    await setDoc(adminRefDoc, {
                        id: mId,
                        name: mData.name,
                        department: mData.department || 'Ban Điều hành',
                        role: 'admin',
                        targetShifts: 10,
                        password: adminPwd
                    }, { merge: true });
                    showToast(`Đã cấp quyền Quản Trị Viên (Mật khẩu: ${adminPwd}) & Đồng bộ Cloud! 🎉`);
                } else {
                    try {
                        await deleteDoc(adminRefDoc);
                    } catch (e) { }
                    showToast(`Đã chuyển thành User thường & Đồng bộ Cloud! 🎉`);
                }
            } catch (err) {
                console.error("Lỗi đồng bộ Cloud:", err);
                showToast(`Lỗi đồng bộ: ${err.message || 'Không xác định'}`, 'error');
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
                localStorage.setItem('local_members', JSON.stringify(members.value));
                if (window.firebaseDb && window.FirebaseSDK) {
                    try {
                        const { collection, doc, deleteDoc: delDoc } = window.FirebaseSDK;
                        await delDoc(doc(collection(window.firebaseDb, 'members'), m.id));
                        try {
                            await delDoc(doc(collection(window.firebaseDb, 'admin_accounts'), m.id));
                        } catch (e) { }
                    } catch (e) { console.error("Lỗi xóa Cloud:", e); }
                }
                showToast('Đã xóa thành viên!');
            }
        };
    };

    const openBatchModal = () => {
        const role = getRole();
        if (role !== 'admin') return showToast('Chỉ Quản trị viên mới có quyền!', 'error');
        batchText.value = '';
        showBatchModal.value = true;
    };

    const saveBatchMembers = async () => {
        const role = getRole();
        if (role !== 'admin') return showToast('Chỉ Quản trị viên mới có quyền!', 'error');
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
                        await setDoc(doc(collection(window.firebaseDb, 'members'), mId), mData, { merge: true });
                    } catch (e) { }
                }
                count++;
            }
        }

        localStorage.setItem('local_members', JSON.stringify(members.value));
        showToast(`Đã nhập thành công ${count} thành viên!`);
        showBatchModal.value = false;
    };

    const pushAllMembersToCloud = async () => {
        if (!window.firebaseDb || !window.FirebaseSDK) return showToast('Chưa kết nối Cloud Firestore!', 'error');
        try {
            const { collection, doc, setDoc, deleteDoc } = window.FirebaseSDK;
            for (const m of members.value) {
                await setDoc(doc(collection(window.firebaseDb, 'members'), m.id), toPlainObject(m), { merge: true });
                const adminRefDoc = doc(collection(window.firebaseDb, 'admin_accounts'), m.id);
                if (m.role === 'admin') {
                    const adminPwd = getAdminPassword(m.id);
                    await setDoc(adminRefDoc, {
                        id: m.id,
                        name: m.name,
                        department: m.department || 'Ban Điều hành',
                        role: 'admin',
                        targetShifts: 10,
                        password: adminPwd
                    }, { merge: true });
                } else {
                    try { await deleteDoc(adminRefDoc); } catch (e) {}
                }
            }
            showToast(`Đã đồng bộ toàn bộ ${members.value.length} thành viên (kèm mật khẩu DVP...BDH cho Admin) lên Cloud!`);
        } catch (e) {
            showToast('Lỗi đồng bộ danh sách lên Cloud: ' + e.message, 'error');
        }
    };

    return {
        members,
        departments,
        addDepartment,
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
