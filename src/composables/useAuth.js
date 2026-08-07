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

        // Deep property scan to find member in Cloud members list
        const cloudMember = membersRef?.value?.find(m => {
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

            // Check if member has Admin role in Cloud members list OR is super admin OR provided valid formula password
            const isCloudAdminRole = cloudMember && (
                cloudMember.role === 'admin' || 
                cloudMember.department === 'Ban Điều hành' ||
                (cloudMember.department && cloudMember.department.toLowerCase().includes('điều hành')) ||
                (cloudMember.department && cloudMember.department.toLowerCase().includes('bđh'))
            );

            const isAuthorizedAdmin = isSuperAdmin || Boolean(isCloudAdminRole) || isPasswordCorrect;

            if (!isAuthorizedAdmin) {
                return showToast(`Tài khoản MSSV ${canonicalId} (${cloudMember ? cloudMember.name : ''}) không có quyền Admin!`, 'error');
            }

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
            // Member login:
            // If member is not yet in cloud state, auto-register to Cloud Firestore so Admin can see them in list!
            if (!cloudMember && window.firebaseDb && window.FirebaseSDK) {
                try {
                    const { doc, setDoc } = window.FirebaseSDK;
                    const newMember = {
                        id: canonicalId,
                        mssv: canonicalId,
                        name: `Thành viên [${canonicalId}]`,
                        department: 'Ban Hành chính',
                        dob: '',
                        role: 'member',
                        targetShifts: 10,
                        createdAt: new Date().toISOString()
                    };
                    setDoc(doc(window.firebaseDb, 'members', canonicalId), newMember).catch(() => {});
                    if (membersRef && Array.isArray(membersRef.value)) {
                        membersRef.value.push(newMember);
                    }
                } catch (e) {}
            }

            isLoggedIn.value = true;
            currentUserRole.value = 'member';
            loggedInMemberId.value = canonicalId;

            localStorage.setItem('socatruc_is_logged_in', 'true');
            localStorage.setItem('socatruc_user_role', 'member');
            localStorage.setItem('socatruc_member_id', canonicalId);

            const displayName = cloudMember ? cloudMember.name : canonicalId;
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
