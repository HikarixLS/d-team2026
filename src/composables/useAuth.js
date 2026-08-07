import { ref } from 'vue';
import { useToast } from './useToast.js';

const savedLoggedIn = localStorage.getItem('socatruc_is_logged_in') === 'true';
const savedRole = localStorage.getItem('socatruc_user_role') || 'member';
const savedMemberId = localStorage.getItem('socatruc_member_id') || '';

const isLoggedIn = ref(savedLoggedIn);
const loginRole = ref('member');
const loginForm = ref({ memberId: '', password: '' });
const currentUserRole = ref(savedRole);
const loggedInMemberId = ref(savedMemberId);
const adminAccounts = ref([]);

export function useAuth(membersRef) {
    const { showToast } = useToast();

    const getMembersList = () => {
        if (!membersRef) return [];
        if (typeof membersRef === 'function') return membersRef() || [];
        if (membersRef.value && Array.isArray(membersRef.value)) return membersRef.value;
        if (Array.isArray(membersRef)) return membersRef;
        return [];
    };

    const handleLogin = () => {
        const rawId = loginForm.value.memberId.trim();
        const pwd = loginForm.value.password.trim();

        if (!rawId) {
            return showToast('Vui lòng nhập MSSV!', 'error');
        }

        if (rawId.length > 8) {
            return showToast('Mã số sinh viên chỉ được phép tối đa 8 ký tự!', 'error');
        }

        const upperId = rawId.toUpperCase();
        const cleanId = rawId.toLowerCase();
        const isSuperAdmin = cleanId === 'admin';

        const currentMembers = getMembersList();

        // 1. Check if members list is empty
        if (!isSuperAdmin && currentMembers.length === 0) {
            return showToast('Danh sách thành viên Cloud đang được nạp, vui lòng thử lại sau giây lát...', 'warning');
        }

        // Deep property scan to find member in Cloud members list
        const cloudMember = currentMembers.find(m => {
            if (!m || typeof m !== 'object') return false;
            // 1. Direct key match
            const keys = [m.id, m.mssv, m.maSV, m.studentId, m.code, m.memberId, m.docId];
            if (keys.some(k => k && k.toString().trim().toUpperCase() === upperId)) return true;

            // 2. Scan all primitive values in object
            for (const key in m) {
                if (m[key] && typeof m[key] !== 'object' && m[key].toString().trim().toUpperCase() === upperId) {
                    return true;
                }
            }
            return false;
        });

        // 2. Strict Cloud Member existence check: Only allow MSSV present in Cloud
        if (!cloudMember && !isSuperAdmin) {
            return showToast(`Mã số sinh viên ${upperId} không tồn tại trong danh sách thành viên Cloud!`, 'error');
        }

        // Canonical Member ID (e.g. 025H0180 / 42300016 / C2300023)
        const canonicalId = cloudMember ? (cloudMember.id || cloudMember.mssv || upperId) : upperId;

        if (loginRole.value === 'admin') {
            if (!pwd) {
                return showToast('Vui lòng nhập mật khẩu Admin!', 'error');
            }

            const last4 = upperId.length >= 4 ? upperId.slice(-4) : upperId.padStart(4, '0');
            const formulaPassword = `DVP${last4}BDH`;
            const cloudPassword = cloudMember?.password;

            const isPasswordCorrect = (pwd === formulaPassword) || (cloudPassword && pwd === cloudPassword) || (isSuperAdmin && (pwd === 'DVPADMINBDH' || pwd === formulaPassword));

            // Check if member has Admin role in Cloud members list OR is super admin
            const isCloudAdminRole = cloudMember && (
                cloudMember.role === 'admin' || 
                cloudMember.department === 'Ban Điều hành' ||
                (cloudMember.department && cloudMember.department.toLowerCase().includes('điều hành')) ||
                (cloudMember.department && cloudMember.department.toLowerCase().includes('bđh'))
            );

            const isAuthorizedAdmin = isSuperAdmin || Boolean(isCloudAdminRole);

            if (!isAuthorizedAdmin) {
                const memberName = cloudMember ? ` (${cloudMember.name})` : '';
                return showToast(`Tài khoản MSSV ${canonicalId}${memberName} không có quyền Quản Trị Viên!`, 'error');
            }

            if (!isPasswordCorrect) {
                return showToast(`Mật khẩu Admin không đúng!`, 'error');
            }

            // Successfully authenticated Admin!
            isLoggedIn.value = true;
            currentUserRole.value = 'admin';
            loggedInMemberId.value = canonicalId;

            localStorage.setItem('socatruc_is_logged_in', 'true');
            localStorage.setItem('socatruc_user_role', 'admin');
            localStorage.setItem('socatruc_member_id', canonicalId);

            const getDisplayName = (m, id) => {
                if (isSuperAdmin) return 'Super Admin';
                const realName = m ? (m.name || m.fullName || m.hoTen || m.ho_ten || m.full_name || m.ten || m.Name || m.HoTen || m.FullName) : null;
                return realName || id;
            };

            const displayName = getDisplayName(cloudMember, canonicalId);
            showToast(`Đăng nhập Quản Trị Viên thành công! 👑 (${displayName})`);
        } else {
            // Member login:
            isLoggedIn.value = true;
            currentUserRole.value = 'member';
            loggedInMemberId.value = canonicalId;

            localStorage.setItem('socatruc_is_logged_in', 'true');
            localStorage.setItem('socatruc_user_role', 'member');
            localStorage.setItem('socatruc_member_id', canonicalId);

            const getDisplayName = (m, id) => {
                const realName = m ? (m.name || m.fullName || m.hoTen || m.ho_ten || m.full_name || m.ten || m.Name || m.HoTen || m.FullName) : null;
                return realName || id;
            };

            const displayName = getDisplayName(cloudMember, canonicalId);
            showToast(`Đăng nhập Thành Viên thành công! 🎉 (${displayName})`);
        }
    };

    const logout = () => {
        isLoggedIn.value = false;
        currentUserRole.value = 'member';
        loggedInMemberId.value = '';
        loginForm.value.memberId = '';
        loginForm.value.password = '';

        localStorage.removeItem('socatruc_is_logged_in');
        localStorage.removeItem('socatruc_user_role');
        localStorage.removeItem('socatruc_member_id');

        showToast('Đã đăng xuất khỏi hệ thống!');
    };

    return {
        isLoggedIn,
        loginRole,
        loginForm,
        currentUserRole,
        loggedInMemberId,
        adminAccounts,
        handleLogin,
        logout
    };
}
