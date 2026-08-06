import { ref } from 'vue';
import { useToast } from './useToast.js';

const defaultAdmins = [
    { id: 'admin', password: '123' },
    { id: 'C2300023', password: '123' },
    { id: '42300016', password: '123' },
    { id: 'D2400032', password: '123' }
];

const savedLoggedIn = localStorage.getItem('socatruc_is_logged_in') === 'true';
const savedRole = localStorage.getItem('socatruc_user_role') || 'member';
const savedMemberId = localStorage.getItem('socatruc_member_id') || '';

const isLoggedIn = ref(savedLoggedIn);
const loginRole = ref('member');
const loginForm = ref({ memberId: '', password: '' });
const currentUserRole = ref(savedRole);
const loggedInMemberId = ref(savedMemberId);
const adminAccounts = ref(defaultAdmins);

export function useAuth(membersRef) {
    const { showToast } = useToast();

    const handleLogin = () => {
        const id = loginForm.value.memberId.trim();
        const pwd = loginForm.value.password.trim();

        if (!id) {
            return showToast('Vui lòng nhập MSSV!', 'error');
        }

        const cleanId = id.toLowerCase();

        // Find member from Cloud/Local list
        const cloudMember = membersRef?.value?.find(
            m => m.id && m.id.toString().toLowerCase() === cleanId
        );

        if (loginRole.value === 'admin') {
            if (!pwd) {
                return showToast('Vui lòng nhập mật khẩu Admin!', 'error');
            }

            const isSuperAdmin = cleanId === 'admin';

            // Find matching admin account in adminAccounts
            const adminAcc = adminAccounts.value.find(
                a => a.id && a.id.toString().toLowerCase() === cleanId
            );

            // Check if member is admin or in Ban Điều hành
            const isCloudAdminRole = cloudMember && (
                cloudMember.role === 'admin' || 
                cloudMember.department === 'Ban Điều hành' ||
                (cloudMember.department && cloudMember.department.toLowerCase().includes('điều hành'))
            );

            const isAuthorizedAdmin = isSuperAdmin || Boolean(adminAcc) || Boolean(isCloudAdminRole);

            if (!isAuthorizedAdmin) {
                if (cloudMember) {
                    return showToast(`Tài khoản MSSV ${id} (${cloudMember.name}) không có quyền Admin!`, 'error');
                } else {
                    return showToast(`MSSV ${id} chưa được cấp quyền Quản Trị Viên!`, 'error');
                }
            }

            // Verify Admin Password: check custom password, formula (DVP + 4 last digits + BDH), or master pass 123
            const last4 = cleanId.length >= 4 ? cleanId.slice(-4).toUpperCase() : cleanId.padStart(4, '0').toUpperCase();
            const formulaPassword = `DVP${last4}BDH`;
            const cloudPassword = adminAcc?.password;

            const isPasswordCorrect = isSuperAdmin || pwd === '123' || pwd === formulaPassword || (cloudPassword && pwd === cloudPassword);

            if (!isPasswordCorrect) {
                return showToast(`Mật khẩu Admin không đúng! (Định dạng mật khẩu: ${formulaPassword})`, 'error');
            }

            // Successfully authenticated Admin!
            isLoggedIn.value = true;
            currentUserRole.value = 'admin';
            loggedInMemberId.value = id;

            localStorage.setItem('socatruc_is_logged_in', 'true');
            localStorage.setItem('socatruc_user_role', 'admin');
            localStorage.setItem('socatruc_member_id', id);

            const displayName = cloudMember ? cloudMember.name : (id === 'admin' ? 'Super Admin' : id);
            showToast(`Đăng nhập Quản Trị Viên thành công! 👑 (${displayName})`);
        } else {
            // Member login
            isLoggedIn.value = true;
            currentUserRole.value = 'member';
            loggedInMemberId.value = id;

            localStorage.setItem('socatruc_is_logged_in', 'true');
            localStorage.setItem('socatruc_user_role', 'member');
            localStorage.setItem('socatruc_member_id', id);

            if (cloudMember) {
                showToast(`Xin chào ${cloudMember.name}! 👋`);
            } else {
                showToast(`Đăng nhập thành công với MSSV ${id}! 👋`);
            }
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
