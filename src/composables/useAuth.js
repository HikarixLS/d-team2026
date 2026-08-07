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

        // Find member in Cloud members list (Case-Insensitive & space trimmed)
        const cloudMember = membersRef?.value?.find(
            m => m.id && m.id.toString().trim().toUpperCase() === upperId
        );

        // Canonical Member ID (e.g. 42300016 / C2300023)
        const canonicalId = cloudMember ? cloudMember.id : upperId;

        if (loginRole.value === 'admin') {
            if (!pwd) {
                return showToast('Vui lòng nhập mật khẩu Admin!', 'error');
            }

            // Check if member has Admin role in Cloud members list OR is super admin
            const isCloudAdminRole = cloudMember && (
                cloudMember.role === 'admin' || 
                cloudMember.department === 'Ban Điều hành' ||
                (cloudMember.department && cloudMember.department.toLowerCase().includes('điều hành')) ||
                (cloudMember.department && cloudMember.department.toLowerCase().includes('bđh'))
            );

            const isAuthorizedAdmin = isSuperAdmin || Boolean(isCloudAdminRole);

            if (!isAuthorizedAdmin) {
                return showToast(`Tài khoản MSSV ${canonicalId} (${cloudMember ? cloudMember.name : ''}) không có quyền Admin!`, 'error');
            }

            // Verify Admin Password: strictly check formula (DVP + 4 last digits + BDH) or explicit custom cloud password
            const last4 = upperId.length >= 4 ? upperId.slice(-4) : upperId.padStart(4, '0');
            const formulaPassword = `DVP${last4}BDH`;
            const cloudPassword = cloudMember?.password;

            const isPasswordCorrect = (pwd === formulaPassword) || (cloudPassword && pwd === cloudPassword) || (isSuperAdmin && (pwd === 'DVPADMINBDH' || pwd === formulaPassword));

            if (!isPasswordCorrect) {
                return showToast(`Mật khẩu Admin không đúng! (Mật khẩu đúng: ${formulaPassword})`, 'error');
            }

            // Successfully authenticated Admin!
            isLoggedIn.value = true;
            currentUserRole.value = 'admin';
            loggedInMemberId.value = canonicalId;

            localStorage.setItem('socatruc_is_logged_in', 'true');
            localStorage.setItem('socatruc_user_role', 'admin');
            localStorage.setItem('socatruc_member_id', canonicalId);

            const displayName = cloudMember ? cloudMember.name : (isSuperAdmin ? 'Super Admin' : canonicalId);
            showToast(`Đăng nhập Quản Trị Viên thành công! 👑 (${displayName})`);
        } else {
            // Member login authorization rule:
            // Must be in Cloud members list OR super admin
            const isAuthorizedMember = Boolean(cloudMember) || isSuperAdmin;

            if (!isAuthorizedMember) {
                return showToast(`MSSV ${upperId} chưa được Admin thêm vào hệ thống! Vui lòng liên hệ Admin.`, 'error');
            }

            isLoggedIn.value = true;
            currentUserRole.value = 'member';
            loggedInMemberId.value = canonicalId;

            localStorage.setItem('socatruc_is_logged_in', 'true');
            localStorage.setItem('socatruc_user_role', 'member');
            localStorage.setItem('socatruc_member_id', canonicalId);

            const displayName = cloudMember ? cloudMember.name : (isSuperAdmin ? 'Super Admin' : canonicalId);
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
