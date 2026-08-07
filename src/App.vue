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
                     @login="handleLoginWithTabReset"
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

        <!-- TAB MỚI: QUẢN LÝ HOẠT ĐỘNG (ADMIN) HOẶC CỔNG HOẠT ĐỘNG (USER) -->
        <div v-show="currentTab === 'activities'">
          <!-- Admin View: Quản lý & Tạo hoạt động & Xem tổng lượt điểm danh -->
          <AdminActivityManager v-if="currentUserRole === 'admin'"
                                :activities="activities"
                                :semesters="semesters"
                                :adminActivitySummaryStats="adminActivitySummaryStats"
                                :computeActivityDerivedFields="computeActivityDerivedFields"
                                :getActivityStats="getActivityStats"
                                :formatDate="formatDate"
                                @create-activity="createActivity"
                                @delete-activity="deleteActivity"
                                @add-semester="addSemester"
                                @delete-semester="deleteSemester"
                                @toggle-training-points="toggleTrainingPointsSubmitted"
                                @update-submit-date="updateActivitySubmitDate"
                                @export-excel="handleExportActivityExcel"
                                @open-detail="openActivityDetailModal" />

          <!-- User View: Trang riêng tổng hợp hoạt động tháng, điểm danh, xin nghỉ -->
          <UserActivityPortal v-else
                              :activities="activities"
                              v-model:selectedMonth="selectedMonth"
                              :loggedInMemberId="loggedInMemberId"
                              :activeMemberName="getMemberName(loggedInMemberId)"
                              :activityRegistrations="activityRegistrations"
                              :getUserCheckInRecord="getUserCheckInRecord"
                              :getActivityDates="getActivityDates"
                              :formatDate="formatDate"
                              @check-in="handleUserActivityCheckIn"
                              @open-leave-modal="openLeaveActivityModal"
                              @register-activity-shift="registerActivityShift"
                              @delete-activity-reg="deleteActivityRegistration" />
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
                          :todayDate="todayDate"
                          :getMemberName="getMemberName"
                          :getMemberDept="getMemberDept"
                          :formatDate="formatDate"
                          :getWeekNameFromDate="getWeekNameFromDate"
                          :getShiftRegisteredCount="getShiftRegisteredCount"
                          :isShiftFullOnDate="isShiftFullOnDate"
                          :isShiftTakenOnDate="isShiftTakenOnDate"
                          :getTakenShiftsCountForDate="getTakenShiftsCountForDate"
                          :isRegDateFull="isRegDateFull"
                          @save-registration="saveRegistration"
                          @delete-registration="confirmDeleteRegistration"
                          @export-matrix-excel="exportShiftScheduleMatrixExcel(selectedMonth, registrations)" />

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
                      :currentTab="currentTab"
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
                         @export-excel="exportToExcel"
                         @export-matrix-excel="exportShiftScheduleMatrixExcel(selectedMonth, searchedShifts)" />

        <!-- Tab 6: Quản lý Danh sách Thành viên -->
        <TabMembersList v-show="currentTab === 'members'"
                        :currentUserRole="currentUserRole"
                        :members="members"
                        :departments="departments"
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
                 :departments="departments"
                 @close="showMemberModal = false"
                 @save="saveMember"
                 @add-department="addDepartment" />

    <BatchImportModal :show="showBatchModal"
                      v-model:batchText="batchText"
                      @close="showBatchModal = false"
                      @save="saveBatchMembers" />

    <ConfirmDeleteModal :deleteModal="deleteModal" />

    <!-- Modals cho Quản lý Hoạt Động & Điểm danh -->
    <ActivityDetailModal :show="showActivityDetailModal"
                         :activity="selectedActivityForDetail"
                         :stats="selectedActivityForDetail ? getActivityStats(selectedActivityForDetail.id) : {}"
                         :members="members"
                         :formatDate="formatDate"
                         @close="showActivityDetailModal = false"
                         @admin-checkin="handleAdminCheckInActivity"
                         @export-excel="exportActivityExcel($event, getActivityStats($event.id), members)" />

    <LeaveActivityModal :show="showLeaveActivityModal"
                        :activity="selectedActivityForLeave"
                        @close="showLeaveActivityModal = false"
                        @confirm="handleConfirmLeaveActivity" />
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
import { useActivities } from './composables/useActivities.js';

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
import AdminActivityManager from './components/activities/AdminActivityManager.vue';
import UserActivityPortal from './components/activities/UserActivityPortal.vue';

// Modals
import ConfigModal from './components/modals/ConfigModal.vue';
import MemberModal from './components/modals/MemberModal.vue';
import BatchImportModal from './components/modals/BatchImportModal.vue';
import ConfirmDeleteModal from './components/modals/ConfirmDeleteModal.vue';
import ActivityDetailModal from './components/modals/ActivityDetailModal.vue';
import LeaveActivityModal from './components/modals/LeaveActivityModal.vue';

// State & Navigation
const currentTab = ref('activities');
const showMobileMenu = ref(false);

const { toast, showToast } = useToast();
const { isDarkMode, applyTheme, toggleTheme } = useTheme();

// Composables wiring
const authModule = useAuth(() => members.value);
const { isLoggedIn, loginRole, loginForm, currentUserRole, loggedInMemberId, adminAccounts, handleLogin, logout } = authModule;

const membersModule = useMembers(currentUserRole, loggedInMemberId, null, null, null);
const {
  members, departments, addDepartment, memberFilterSearch, memberFilterDept, memberFilterTarget, resetMemberFilters,
  getDeptColorClass, filteredMembersList, showMemberModal, editingMember, memberForm,
  openMemberModal, saveMember, confirmDeleteMember, showBatchModal, batchText,
  openBatchModal, saveBatchMembers, pushAllMembersToCloud, deleteModal
} = membersModule;

const shiftsModule = useShifts(members, currentUserRole, loggedInMemberId, deleteModal);
const {
  shifts, registrations, leaveRequests, selectedMonth, selectedWeek, todayDate,
  activeMember, getMemberName, getMemberDept, formatDate, getInitials,
  getWeekNumFromDate, getWeekNameFromDate, shiftForm, resetShiftForm, saveShift,
  regForm, saveRegistration, getShiftRegisteredCount, isShiftFullOnDate, isShiftTakenOnDate, getTakenShiftsCountForDate, isRegDateFull,
  leaveForm, availableRegisteredShifts, onLeaveMemberChange, onLeaveRegSelect,
  saveLeaveRequest, leaveStatusFilter, filteredLeaveRequests, pendingLeaveCount,
  updateLeaveStatus, historyFilter, searchedShifts, confirmDeleteRegistration,
  exportShiftScheduleMatrixExcel
} = shiftsModule;

const activitiesModule = useActivities(members, loggedInMemberId, currentUserRole);
const {
  activities, activityCheckIns, semesters, activityRegistrations, addSemester, deleteSemester, toggleTrainingPointsSubmitted,
  updateActivitySubmitDate, createActivity, deleteActivity, registerActivityShift, deleteActivityRegistration, getActivityDates,
  checkInActivity, requestLeaveActivity, getUserCheckInRecord, getActivityStats,
  computeActivityDerivedFields, exportActivityExcel, exportActivityRegistrationMatrixExcel, adminActivitySummaryStats
} = activitiesModule;

const cloudModule = useCloud(members, shifts, registrations, leaveRequests, adminAccounts, activities, activityCheckIns, semesters, departments);
const {
  isCloudConnected, hasFirebaseConfig, showConfigModal, configInput, cloudStatusText,
  openConfigModal, resetConfigToDefault, saveFirebaseConfig, initCloudRealtime
} = cloudModule;

// Modal States for Activities
const showActivityDetailModal = ref(false);
const selectedActivityForDetail = ref(null);

const showLeaveActivityModal = ref(false);
const selectedActivityForLeave = ref(null);

const handleExportActivityExcel = (act, exportType) => {
  if (exportType === 'registration') {
    exportActivityRegistrationMatrixExcel(act, members.value);
  } else {
    exportActivityExcel(act, getActivityStats(act.id), members.value);
  }
};

const openActivityDetailModal = (act) => {
  selectedActivityForDetail.value = act;
  showActivityDetailModal.value = true;
};

const openLeaveActivityModal = (act) => {
  selectedActivityForLeave.value = act;
  showLeaveActivityModal.value = true;
};

const handleConfirmLeaveActivity = (reason) => {
  if (selectedActivityForLeave.value) {
    requestLeaveActivity(selectedActivityForLeave.value.id, reason);
  }
};

const handleAdminCheckInActivity = ({ activityId, memberId }) => {
  checkInActivity(activityId, memberId);
};

const handleUserActivityCheckIn = (payload) => {
  if (typeof payload === 'object' && payload !== null && payload.activityId) {
    checkInActivity(payload.activityId, null, payload.proofImage);
  } else {
    checkInActivity(payload);
  }
};

const handleLoginWithTabReset = () => {
  handleLogin();
  if (isLoggedIn.value) {
    currentTab.value = 'activities';
  }
};

// Computed UI Helpers
const userRoleBadgeText = computed(() => {
  const name = getMemberName(loggedInMemberId.value);
  const displayStr = (name && name !== loggedInMemberId.value)
    ? `${name} (${loggedInMemberId.value})`
    : loggedInMemberId.value;
  return currentUserRole.value === 'admin' ? `Quản Trị Viên: ${displayStr}` : `Thành Viên: ${displayStr}`;
});
const leaveListTitle = computed(() => currentUserRole.value === 'admin' ? 'Quản Lý & Duyệt Đơn Xin Nghỉ Phép' : 'Danh Sách Đơn Xin Nghỉ Phép Của Tôi');
const getLeaveStatusBadgeText = (status) => status === 'Chờ duyệt' ? '⏳ Chờ xét duyệt' : (status === 'Đã duyệt' ? '✅ Đã duyệt' : '✕ Đã từ chối');
const formatCreatedAt = (dt) => dt ? new Date(dt).toLocaleString('vi-VN') : 'vừa xong';
const pieChartTitle = computed(() => currentUserRole.value === 'admin' ? 'Biểu Đồ Tròn: Tỷ Lệ Thành Viên Đạt Chỉ Tiêu (10 Ca/Tháng)' : 'Biểu Đồ Tròn: Tiến Độ Ca Trực Cá Nhân (10 Ca/Tháng)');
const historySubtitle = computed(() => currentUserRole.value === 'admin' ? 'Danh sách toàn bộ ca trực ghi nhận từ sổ gốc' : 'Nhật ký các ca trực cá nhân của tôi');

// Navigation Tabs Config (Roles Separation)
const tabs = computed(() => {
  const isAdmin = currentUserRole.value === 'admin';
  return [
    {
      id: 'activities',
      label: isAdmin ? 'Quản Lý Hoạt Động' : 'Trang Hoạt Động',
      shortLabel: 'Hoạt động',
      icon: 'fa-solid fa-calendar-check'
    },
    { id: 'entry', label: 'Ghi Ca Trực', shortLabel: 'Ghi ca', icon: 'fa-solid fa-pen-to-square' },
    { id: 'register', label: 'Đăng Ký Ca', shortLabel: 'Đăng ký', icon: 'fa-solid fa-calendar-plus' },
    { id: 'leave', label: 'Xin Nghỉ Phép', shortLabel: 'Nghỉ phép', icon: 'fa-solid fa-file-pen', badge: (pendingLeaveCount.value > 0 && isAdmin) ? pendingLeaveCount.value : null },
    { id: 'dashboard', label: 'Thống Kê & Chỉ Tiêu', shortLabel: 'Thống kê', icon: 'fa-solid fa-chart-pie' },
    { id: 'history', label: 'Nhật Ký & Tra Cứu', shortLabel: 'Nhật ký', icon: 'fa-solid fa-clock-rotate-left' },
    { id: 'members', label: 'Danh Sách Thành Viên', shortLabel: 'Thành viên', icon: 'fa-solid fa-users' }
  ];
});

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
