<template>
  <div class="flex-grow flex flex-col font-sans selection:bg-indigo-500 selection:text-white" :class="{ 'dark-mode': isDarkMode }">
    <!-- Toast Alert Component -->
    <Toast :toast="toast" />

    <!-- Fullscreen Login Gatekeeper Component -->
    <LoginGatekeeper v-if="!isLoggedIn"
                     v-model:loginRole="loginRole"
                     :loginForm="loginForm"
                     :isCloudConnected="isCloudConnected"
                     :hasFirebaseConfig="hasFirebaseConfig"
                     @login="handleLogin"
                     @retry-cloud="initCloudRealtime" />

    <!-- Master App Workspace Layout -->
    <div v-else class="flex-grow flex flex-col">
      <!-- App Header Component -->
      <AppHeader :isDarkMode="isDarkMode"
                 :currentUserRole="currentUserRole"
                 :loggedInMemberId="loggedInMemberId"
                 :isCloudConnected="isCloudConnected"
                 :hasFirebaseConfig="hasFirebaseConfig"
                 :cloudStatusText="cloudStatusText"
                 :userRoleBadgeText="userRoleBadgeText"
                 :showMobileMenu="showMobileMenu"
                 @toggle-theme="toggleTheme"
                 @open-config="openConfigModal"
                 @logout="logout"
                 @toggle-mobile-menu="showMobileMenu = !showMobileMenu" />

      <!-- App Navigation Component -->
      <AppNavigation :currentTab="currentTab" :tabs="tabs" @select-tab="currentTab = $event" />

      <!-- Main Content Tabs Body -->
      <main class="flex-grow max-w-7xl w-full mx-auto p-3 sm:p-6 pb-24 sm:pb-6 space-y-4">
        <!-- Global Filter Bar (Month & Week selection) -->
        <div v-if="['entry', 'register', 'dashboard', 'history'].includes(currentTab)"
             class="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 no-print">
          <div class="flex flex-wrap items-center gap-2 text-xs">
            <span class="font-bold text-slate-700 flex items-center gap-1.5">
              <i class="fa-solid fa-calendar-days text-indigo-600"></i> Tháng Báo Cáo:
            </span>
            <input type="month" v-model="selectedMonth"
                   class="border border-slate-300 rounded-xl px-3 py-1.5 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50">
          </div>

          <div class="flex items-center gap-1 text-xs overflow-x-auto">
            <button @click="selectedWeek = 'all'" class="px-3 py-1.5 rounded-xl font-bold transition cursor-pointer"
                    :class="selectedWeek === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'">Tất cả tuần</button>
            <button @click="selectedWeek = '1'" class="px-3 py-1.5 rounded-xl font-bold transition cursor-pointer"
                    :class="selectedWeek === '1' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'">Tuần 1 (1-8)</button>
            <button @click="selectedWeek = '2'" class="px-3 py-1.5 rounded-xl font-bold transition cursor-pointer"
                    :class="selectedWeek === '2' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'">Tuần 2 (9-18)</button>
            <button @click="selectedWeek = '3'" class="px-3 py-1.5 rounded-xl font-bold transition cursor-pointer"
                    :class="selectedWeek === '3' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'">Tuần 3 (19-25)</button>
            <button @click="selectedWeek = '4'" class="px-3 py-1.5 rounded-xl font-bold transition cursor-pointer"
                    :class="selectedWeek === '4' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'">Tuần 4 (26-Cuối)</button>
          </div>
        </div>

        <!-- Tab 1: Ghi ca -->
        <TabShiftEntry v-show="currentTab === 'entry'"
                       :shiftForm="shiftForm"
                       :members="members"
                       :currentUserRole="currentUserRole"
                       :todayDate="todayDate"
                       :shifts="shifts"
                       :getMemberName="getMemberName"
                       :formatDate="formatDate"
                       @save-shift="saveShift"
                       @reset-form="resetShiftForm"
                       @go-tab="currentTab = $event" />

        <!-- Tab 2: Đăng ký ca -->
        <TabShiftRegister v-show="currentTab === 'register'"
                          :regForm="regForm"
                          :members="members"
                          :currentUserRole="currentUserRole"
                          :loggedInMemberId="loggedInMemberId"
                          :filteredRegistrations="registrations"
                          :getMemberName="getMemberName"
                          :getMemberDept="getMemberDept"
                          :formatDate="formatDate"
                          :getWeekNameFromDate="getWeekNameFromDate"
                          :isShiftTakenOnDate="isShiftTakenOnDate"
                          :getTakenShiftsCountForDate="getTakenShiftsCountForDate"
                          :isRegDateFull="isRegDateFull"
                          @save-registration="saveRegistration"
                          @delete-registration="confirmDeleteRegistration" />

        <!-- Tab 3: Đơn xin nghỉ phép -->
        <TabLeaveRequests v-show="currentTab === 'leave'"
                          :leaveForm="leaveForm"
                          :members="members"
                          :currentUserRole="currentUserRole"
                          :availableRegisteredShifts="availableRegisteredShifts"
                          :leaveListTitle="leaveListTitle"
                          :pendingLeaveCount="pendingLeaveCount"
                          v-model:leaveStatusFilter="leaveStatusFilter"
                          :filteredLeaveRequests="filteredLeaveRequests"
                          :getMemberName="getMemberName"
                          :getMemberDept="getMemberDept"
                          :formatDate="formatDate"
                          :getLeaveStatusBadgeText="getLeaveStatusBadgeText"
                          :formatCreatedAt="formatCreatedAt"
                          @save-leave-request="saveLeaveRequest"
                          @member-change="onLeaveMemberChange"
                          @reg-select="onLeaveRegSelect"
                          @update-leave-status="updateLeaveStatus" />

        <!-- Tab 4: Thống kê Dashboard & Biểu đồ -->
        <TabDashboard v-show="currentTab === 'dashboard'"
                      :currentUserRole="currentUserRole"
                      :filteredShifts="shifts"
                      :personalShiftsCount="shifts.filter(s => s.memberId === loggedInMemberId).length"
                      :registrations="registrations"
                      :personalRegistrationsCount="registrations.filter(r => r.memberId === loggedInMemberId).length"
                      :targetPassRate="Math.round((members.filter(m => shifts.filter(s => s.memberId === m.id).length >= 10).length / Math.max(1, members.length)) * 100)"
                      :personalProgressPercent="Math.min(100, Math.round((shifts.filter(s => s.memberId === loggedInMemberId).length / 10) * 100))"
                      :membersPassingTargetCount="members.filter(m => shifts.filter(s => s.memberId === m.id).length >= 10).length"
                      :members="members"
                      :leaveRequests="leaveRequests"
                      :personalLeaveRequests="leaveRequests.filter(l => l.memberId === loggedInMemberId)"
                      :pieChartTitle="pieChartTitle" />

        <!-- Tab 5: Tra cứu Lịch sử ca trực -->
        <TabShiftHistory v-show="currentTab === 'history'"
                         :historySubtitle="historySubtitle"
                         :historyFilter="historyFilter"
                         :members="members"
                         :searchedShifts="searchedShifts"
                         :getMemberName="getMemberName"
                         :getMemberDept="getMemberDept"
                         :formatDate="formatDate"
                         @export-excel="exportToExcel" />

        <!-- Tab 6: Quản lý Danh sách Thành viên -->
        <TabMembersList v-show="currentTab === 'members'"
                        :currentUserRole="currentUserRole"
                        :members="members"
                        v-model:memberFilterSearch="memberFilterSearch"
                        v-model:memberFilterDept="memberFilterDept"
                        v-model:memberFilterTarget="memberFilterTarget"
                        :filteredMembersList="filteredMembersList"
                        :selectedMonth="selectedMonth"
                        :getInitials="getInitials"
                        :getDeptColorClass="getDeptColorClass"
                        :formatDate="formatDate"
                        @push-cloud="pushAllMembersToCloud"
                        @open-batch="openBatchModal"
                        @open-member-modal="openMemberModal"
                        @confirm-delete-member="confirmDeleteMember"
                        @reset-filters="resetMemberFilters" />
      </main>
    </div>

    <!-- Modals -->
    <ConfigModal :show="showConfigModal"
                 v-model:configInput="configInput"
                 @close="showConfigModal = false"
                 @save="saveFirebaseConfig"
                 @reset-default="resetConfigToDefault" />

    <MemberModal :show="showMemberModal"
                 :editingMember="editingMember"
                 :memberForm="memberForm"
                 @close="showMemberModal = false"
                 @save="saveMember" />

    <BatchImportModal :show="showBatchModal"
                      v-model:batchText="batchText"
                      @close="showBatchModal = false"
                      @save="saveBatchMembers" />

    <ConfirmDeleteModal :deleteModal="deleteModal" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';

// Composables
import { useToast } from './composables/useToast.js';
import { useTheme } from './composables/useTheme.js';
import { useAuth } from './composables/useAuth.js';
import { useCloud } from './composables/useCloud.js';
import { useMembers } from './composables/useMembers.js';
import { useShifts } from './composables/useShifts.js';

// Components
import Toast from './components/common/Toast.vue';
import AppHeader from './components/common/AppHeader.vue';
import AppNavigation from './components/common/AppNavigation.vue';
import LoginGatekeeper from './components/auth/LoginGatekeeper.vue';
import TabShiftEntry from './components/tabs/TabShiftEntry.vue';
import TabShiftRegister from './components/tabs/TabShiftRegister.vue';
import TabLeaveRequests from './components/tabs/TabLeaveRequests.vue';
import TabDashboard from './components/tabs/TabDashboard.vue';
import TabShiftHistory from './components/tabs/TabShiftHistory.vue';
import TabMembersList from './components/tabs/TabMembersList.vue';
import ConfigModal from './components/modals/ConfigModal.vue';
import MemberModal from './components/modals/MemberModal.vue';
import BatchImportModal from './components/modals/BatchImportModal.vue';
import ConfirmDeleteModal from './components/modals/ConfirmDeleteModal.vue';

// State & Navigation
const currentTab = ref('entry');
const showMobileMenu = ref(false);

const { toast, showToast } = useToast();
const { isDarkMode, applyTheme, toggleTheme } = useTheme();

// Composables wiring
const membersModule = useMembers(null, null, null, null, null);
const {
  members, memberFilterSearch, memberFilterDept, memberFilterTarget, resetMemberFilters,
  getDeptColorClass, filteredMembersList, showMemberModal, editingMember, memberForm,
  openMemberModal, saveMember, confirmDeleteMember, showBatchModal, batchText,
  openBatchModal, saveBatchMembers, pushAllMembersToCloud, deleteModal
} = membersModule;

const authModule = useAuth(members);
const { isLoggedIn, loginRole, loginForm, currentUserRole, loggedInMemberId, adminAccounts, handleLogin, logout } = authModule;

const shiftsModule = useShifts(members, currentUserRole, loggedInMemberId, deleteModal);
const {
  shifts, registrations, leaveRequests, selectedMonth, selectedWeek, todayDate,
  activeMember, getMemberName, getMemberDept, formatDate, getInitials,
  getWeekNumFromDate, getWeekNameFromDate, shiftForm, resetShiftForm, saveShift,
  regForm, saveRegistration, isShiftTakenOnDate, getTakenShiftsCountForDate, isRegDateFull,
  leaveForm, availableRegisteredShifts, onLeaveMemberChange, onLeaveRegSelect,
  saveLeaveRequest, leaveStatusFilter, filteredLeaveRequests, pendingLeaveCount,
  updateLeaveStatus, historyFilter, searchedShifts, confirmDeleteRegistration
} = shiftsModule;

const cloudModule = useCloud(members, shifts, registrations, leaveRequests, adminAccounts);
const {
  isCloudConnected, hasFirebaseConfig, showConfigModal, configInput, cloudStatusText,
  openConfigModal, resetConfigToDefault, saveFirebaseConfig, initCloudRealtime
} = cloudModule;

// Computed UI Helpers
const userRoleBadgeText = computed(() => currentUserRole.value === 'admin' ? `Admin [${loggedInMemberId.value}]` : `Thành Viên [${loggedInMemberId.value}]`);
const leaveListTitle = computed(() => currentUserRole.value === 'admin' ? 'Quản Lý & Duyệt Đơn Xin Nghỉ Phép' : 'Danh Sách Đơn Xin Nghỉ Phép Của Tôi');
const getLeaveStatusBadgeText = (status) => status === 'Chờ duyệt' ? '⏳ Chờ Admin duyệt' : (status === 'Đã duyệt' ? '✅ Đã duyệt' : '✕ Đã từ chối');
const formatCreatedAt = (dt) => dt ? new Date(dt).toLocaleString('vi-VN') : 'vừa xong';
const pieChartTitle = computed(() => currentUserRole.value === 'admin' ? 'Biểu Đồ Tròn: Tỷ Lệ Thành Viên Đạt Chỉ Tiêu (10 Ca/Tháng)' : 'Biểu Đồ Tròn: Tiến Độ Ca Trực Cá Nhân (10 Ca/Tháng)');
const historySubtitle = computed(() => currentUserRole.value === 'admin' ? 'Danh sách toàn bộ ca trực ghi nhận từ sổ gốc' : 'Nhật ký các ca trực cá nhân của tôi');

// Navigation Tabs Config
const tabs = computed(() => [
  { id: 'entry', label: 'Ghi Ca Trực', shortLabel: 'Ghi ca', icon: 'fa-solid fa-pen-to-square' },
  { id: 'register', label: 'Đăng Ký Ca', shortLabel: 'Đăng ký', icon: 'fa-solid fa-calendar-plus' },
  { id: 'leave', label: 'Xin Nghỉ Phép', shortLabel: 'Nghỉ phép', icon: 'fa-solid fa-file-pen', badge: (pendingLeaveCount.value > 0 && currentUserRole.value === 'admin') ? pendingLeaveCount.value : null },
  { id: 'dashboard', label: 'Thống Kê & Chỉ Tiêu', shortLabel: 'Thống kê', icon: 'fa-solid fa-chart-pie' },
  { id: 'history', label: 'Nhật Ký & Tra Cứu', shortLabel: 'Nhật ký', icon: 'fa-solid fa-clock-rotate-left' },
  { id: 'members', label: 'Danh Sách Thành Viên', shortLabel: 'Thành viên', icon: 'fa-solid fa-users' }
]);

// Excel Export Helper
const exportToExcel = () => {
  if (typeof XLSX === 'undefined') return showToast('Thư viện XLSX chưa sẵn sàng!', 'error');
  if (searchedShifts.value.length === 0) return showToast('Không có dữ liệu ca trực để xuất!', 'error');

  const dataToExport = searchedShifts.value.map((s, idx) => ({
    'STT Báo Cáo': idx + 1,
    'MSSV': s.memberId,
    'Họ Và Tên': getMemberName(s.memberId),
    'Ban Hoạt Động': getMemberDept(s.memberId),
    'Ngày Trực': formatDate(s.date),
    'Ca Trực': s.shiftType,
    'Trang Sổ Gốc': s.pageNo,
    'STT Trang Sổ': s.sttNo,
    'Trạng Thái': s.status,
    'Ghi Chú': s.notes || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "BaoCaoCaTruc");
  XLSX.writeFile(workbook, `BaoCao_CaTruc_${selectedMonth.value}.xlsx`);
  showToast('Đã xuất báo cáo Excel thành công!');
};

// Lifecycle
onMounted(() => {
  applyTheme();

  const tryConnectCloud = () => {
    if (window.FirebaseSDK && !isCloudConnected.value) {
      initCloudRealtime();
    }
  };
  tryConnectCloud();
  window.addEventListener('firebase-sdk-ready', tryConnectCloud);

  const retryInterval = setInterval(() => {
    if (isCloudConnected.value) {
      clearInterval(retryInterval);
    } else {
      tryConnectCloud();
    }
  }, 2000);
  setTimeout(() => clearInterval(retryInterval), 10000);
});
</script>
