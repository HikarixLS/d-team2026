<template>
  <div class="flex-grow flex flex-col font-sans selection:bg-indigo-500 selection:text-white" :class="{ 'dark-mode': isDarkMode }">
    <!-- Network Offline Status Banner -->
    <NetworkStatusBanner :isOnline="isOnline" :isChecking="isCheckingNetwork" @retry="checkNetworkStatus(initCloudRealtime)" />

    <!-- Toast Alert Component -->
    <Toast :toast="toast" />

    <!-- App Authentication / Workspace View Cross-Fade -->
    <Transition name="fade-app" mode="out-in">
      <!-- Fullscreen Login Gatekeeper Component -->
      <LoginGatekeeper v-if="!isLoggedIn"
                       key="login-gate"
                       v-model:loginRole="loginRole"
                       :loginForm="loginForm"
                       :isCloudConnected="isCloudConnected"
                       :hasFirebaseConfig="hasFirebaseConfig"
                       @login="handleLoginWithTabReset"
                       @retry-cloud="initCloudRealtime" />

      <!-- Master App Workspace Layout -->
      <div v-else key="master-app" class="flex-grow flex flex-col">
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
        <main class="flex-grow w-full px-3 sm:px-6 lg:px-8 py-4 pb-24 sm:pb-6 space-y-4">
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
                         :shiftTypes="shiftTypes"
                         :currentUserRole="currentUserRole"
                         :todayDate="todayDate"
                         :shifts="searchedShifts"
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
                            :filteredRegistrations="filteredRegistrations"
                            :todayDate="todayDate"
                            :shiftTypes="shiftTypes"
                            :shiftSettings="shiftSettings"
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
                            @open-shift-settings="openShiftSettingsModal"
                            @toggle-registration-open="toggleRegistrationOpen"
                            @export-matrix-excel="exportShiftScheduleMatrixExcel(selectedMonth, filteredRegistrations)" />

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
                        :filteredShifts="searchedShifts"
                        :shiftTypes="shiftTypes"
                        :personalShiftsCount="searchedShifts.filter(s => String(s.memberId).toUpperCase() === String(loggedInMemberId).toUpperCase()).length"
                        :registrations="filteredRegistrations"
                        :personalRegistrationsCount="filteredRegistrations.filter(r => String(r.memberId).toUpperCase() === String(loggedInMemberId).toUpperCase()).length"
                        :targetPassRate="targetPassRate"
                        :personalProgressPercent="personalProgressPercent"
                        :membersPassingTargetCount="membersPassingTargetCount"
                        :membersInProgressCount="membersInProgressCount"
                        :membersZeroCount="membersZeroCount"
                        :members="members"
                        :selectedMonth="selectedMonth"
                        :getMemberName="getMemberName"
                        :getMemberDept="getMemberDept"
                        :leaveRequests="filteredLeaveRequests"
                        :personalLeaveRequests="filteredLeaveRequests.filter(l => String(l.memberId).toUpperCase() === String(loggedInMemberId).toUpperCase())"
                        :pieChartTitle="pieChartTitle" />

          <!-- Tab 5: Tra cứu Lịch sử ca trực -->
          <TabShiftHistory v-show="currentTab === 'history'"
                           :historySubtitle="historySubtitle"
                           :historyFilter="historyFilter"
                           :members="members"
                           :searchedShifts="searchedShifts"
                           :registrations="registrations"
                           :filteredRegistrations="filteredRegistrations"
                           :shifts="shifts"
                           :shiftTypes="shiftTypes"
                           :selectedMonth="selectedMonth"
                           :selectedWeek="selectedWeek"
                           :getMemberName="getMemberName"
                           :getMemberDept="getMemberDept"
                           :formatDate="formatDate"
                           @export-excel="exportToExcel"
                           @export-matrix-excel="exportShiftScheduleMatrixExcel(selectedMonth, $event || filteredRegistrations)" />

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
    </Transition>

    <!-- Modals -->
    <ShiftSettingsModal :show="showShiftSettingsModal"
                        :shiftSettings="shiftSettings"
                        @close="showShiftSettingsModal = false"
                        @save="saveShiftSettings"
                        @reset-default="resetShiftSettingsToDefault" />

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

    <!-- App OTA Update Modal -->
    <AppUpdateModal :show="showUpdateModal"
                    :currentVersion="CURRENT_APP_VERSION"
                    :updateInfo="updateInfo"
                    @close="showUpdateModal = false"
                    @update="downloadAndInstall" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { App as CapApp } from '@capacitor/app';

// Composables
import { useToast } from './composables/useToast.js';
import { useTheme } from './composables/useTheme.js';
import { useAuth } from './composables/useAuth.js';
import { useCloud } from './composables/useCloud.js';
import { useMembers } from './composables/useMembers.js';
import { useShifts } from './composables/useShifts.js';
import { useActivities } from './composables/useActivities.js';
import { useHaptics } from './composables/useHaptics.js';
import { useNetwork } from './composables/useNetwork.js';
import { useNotifications } from './composables/useNotifications.js';
import { useAppUpdater, CURRENT_APP_VERSION } from './composables/useAppUpdater.js';
import { exportExcelFile } from './utils/fileExport.js';

// Components
import Toast from './components/common/Toast.vue';
import NetworkStatusBanner from './components/common/NetworkStatusBanner.vue';
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
import ShiftSettingsModal from './components/modals/ShiftSettingsModal.vue';
import ConfigModal from './components/modals/ConfigModal.vue';
import MemberModal from './components/modals/MemberModal.vue';
import BatchImportModal from './components/modals/BatchImportModal.vue';
import ConfirmDeleteModal from './components/modals/ConfirmDeleteModal.vue';
import ActivityDetailModal from './components/modals/ActivityDetailModal.vue';
import LeaveActivityModal from './components/modals/LeaveActivityModal.vue';
import AppUpdateModal from './components/modals/AppUpdateModal.vue';

// State & Navigation
const currentTab = ref('activities');
const showMobileMenu = ref(false);

const { toast, showToast } = useToast();
const { isDarkMode, applyTheme, toggleTheme } = useTheme();
const { impactLight, notificationWarning } = useHaptics();
const { isOnline, isCheckingNetwork, initNetworkListener, checkNetworkStatus } = useNetwork();
const { initPushNotifications, syncAllUpcomingShiftReminders } = useNotifications();
const { isChecking: isCheckingUpdate, hasUpdate, showUpdateModal, updateInfo, checkForUpdate, downloadAndInstall } = useAppUpdater();

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
  shifts, registrations, leaveRequests, shiftSettings, shiftTypes, shiftTypeNames,
  showShiftSettingsModal, openShiftSettingsModal, saveShiftSettings, toggleRegistrationOpen, resetShiftSettingsToDefault,
  selectedMonth, selectedWeek, todayDate,
  activeMember, getMemberName, getMemberDept, formatDate, getInitials,
  getWeekNumFromDate, getWeekNameFromDate, shiftForm, resetShiftForm, saveShift,
  regForm, saveRegistration, getShiftRegisteredCount, isShiftFullOnDate, isShiftTakenOnDate, getTakenShiftsCountForDate, isRegDateFull,
  leaveForm, availableRegisteredShifts, onLeaveMemberChange, onLeaveRegSelect,
  saveLeaveRequest, leaveStatusFilter, filteredLeaveRequests, pendingLeaveCount,
  updateLeaveStatus, historyFilter, searchedShifts, filteredRegistrations, confirmDeleteRegistration,
  exportShiftScheduleMatrixExcel
} = shiftsModule;

const activitiesModule = useActivities(members, loggedInMemberId, currentUserRole);
const {
  activities, activityCheckIns, semesters, activityRegistrations, addSemester, deleteSemester, toggleTrainingPointsSubmitted,
  updateActivitySubmitDate, createActivity, deleteActivity, registerActivityShift, deleteActivityRegistration, getActivityDates,
  checkInActivity, requestLeaveActivity, getUserCheckInRecord, getActivityStats,
  computeActivityDerivedFields, exportActivityExcel, exportActivityRegistrationMatrixExcel, adminActivitySummaryStats
} = activitiesModule;

const cloudModule = useCloud(members, shifts, registrations, leaveRequests, adminAccounts, activities, activityCheckIns, semesters, departments, shiftSettings);
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
    checkInActivity(payload.activityId, null, payload.proofImage, payload.proofFileName, payload.proofFolderDate);
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

// Target & Stats Computed Properties
const memberShiftCountMap = computed(() => {
  const map = {};
  members.value.forEach(m => {
    map[String(m.id).toUpperCase()] = 0;
  });
  searchedShifts.value.forEach(s => {
    const id = String(s.memberId || '').toUpperCase();
    map[id] = (map[id] || 0) + 1;
  });
  return map;
});

const membersPassingTargetCount = computed(() => {
  if (members.value.length === 0) return 0;
  return members.value.filter(m => {
    const count = memberShiftCountMap.value[String(m.id).toUpperCase()] || 0;
    const target = m.targetShifts || 10;
    return count >= target;
  }).length;
});

const membersInProgressCount = computed(() => {
  if (members.value.length === 0) return 0;
  return members.value.filter(m => {
    const count = memberShiftCountMap.value[String(m.id).toUpperCase()] || 0;
    const target = m.targetShifts || 10;
    return count > 0 && count < target;
  }).length;
});

const membersZeroCount = computed(() => {
  if (members.value.length === 0) return 0;
  return members.value.filter(m => {
    const count = memberShiftCountMap.value[String(m.id).toUpperCase()] || 0;
    return count === 0;
  }).length;
});

const targetPassRate = computed(() => {
  if (members.value.length === 0) return 0;
  const totalCompleted = searchedShifts.value.length;
  const totalTarget = members.value.reduce((acc, m) => acc + (m.targetShifts || 10), 0);
  if (totalTarget === 0) return 0;
  return Math.min(100, Math.round((totalCompleted / totalTarget) * 100));
});

const personalProgressPercent = computed(() => {
  const currentId = String(loggedInMemberId.value || '').toUpperCase();
  const count = memberShiftCountMap.value[currentId] || 0;
  const target = activeMember.value?.targetShifts || 10;
  return Math.min(100, Math.round((count / target) * 100));
});

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
const pieChartTitle = computed(() => currentUserRole.value === 'admin' ? 'Biểu Đồ Tròn: Phân Bổ Thành Viên Theo Chỉ Tiêu (10 Ca/Tháng)' : 'Biểu Đồ Tròn: Tiến Độ Ca Trực Cá Nhân (10 Ca/Tháng)');
const historySubtitle = computed(() => currentUserRole.value === 'admin' ? 'Danh sách toàn bộ ca trực ghi nhận từ sổ gốc' : 'Nhật ký các ca trực cá nhân của tôi');

// Navigation Tabs Config (Roles Separation)
const tabs = computed(() => {
  const isAdmin = currentUserRole.value === 'admin';
  const list = [
    {
      id: 'activities',
      label: isAdmin ? 'Quản Lý Hoạt Động' : 'Trang Hoạt Động',
      shortLabel: 'Hoạt động',
      icon: 'fa-solid fa-calendar-check'
    },
    { id: 'entry', label: 'Ghi Ca Trực', shortLabel: 'Ghi ca', icon: 'fa-solid fa-pen-to-square' },
    { id: 'register', label: 'Đăng Ký Ca', shortLabel: 'Đăng ký', icon: 'fa-solid fa-calendar-plus' },
    { id: 'leave', label: 'Xin Nghỉ Phép', shortLabel: 'Nghỉ phép', icon: 'fa-solid fa-file-pen', badge: (pendingLeaveCount.value > 0 && isAdmin) ? pendingLeaveCount.value : null }
  ];

  if (isAdmin) {
    list.push(
      { id: 'dashboard', label: 'Thống Kê & Chỉ Tiêu', shortLabel: 'Thống kê', icon: 'fa-solid fa-chart-pie' },
      { id: 'history', label: 'Nhật Ký & Tra Cứu', shortLabel: 'Nhật ký', icon: 'fa-solid fa-clock-rotate-left' },
      { id: 'members', label: 'Danh Sách Thành Viên', shortLabel: 'Thành viên', icon: 'fa-solid fa-users' }
    );
  }

  return list;
});

watch(
  () => currentUserRole.value,
  (role) => {
    if (role !== 'admin' && ['dashboard', 'history', 'members'].includes(currentTab.value)) {
      currentTab.value = 'activities';
    }
  }
);

// Excel Export Helper
const exportToExcel = async () => {
  if (typeof XLSX === 'undefined') return showToast('Thư viện XLSX chưa sẵn sàng!', 'error');
  if (searchedShifts.value.length === 0) return showToast('Không có dữ liệu ca trực để xuất!', 'error');

  const dataToExport = searchedShifts.value.map((s, idx) => ({
    'STT Báo Cáo': idx + 1,
    'MSSV': s.memberId,
    'Họ Và Tên': getMemberName(s.memberId),
    'Ban Hoạt Động': getMemberDept(s.memberId),
    'Ngày Trực': formatDate(s.date),
    'Ca Trực': s.shiftType,
    'Trang Số Gốc': s.pageNo,
    'STT Trang Sổ': s.sttNo,
    'Trạng Thái': s.status,
    'Ghi Chú': s.notes || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  worksheet['!cols'] = [
    { wch: 14 }, // STT Báo Cáo
    { wch: 14 }, // MSSV
    { wch: 25 }, // Họ Và Tên
    { wch: 22 }, // Ban Hoạt Động
    { wch: 14 }, // Ngày Trực
    { wch: 12 }, // Ca Trực
    { wch: 15 }, // Trang Số Gốc
    { wch: 15 }, // STT Trang Sổ
    { wch: 14 }, // Trạng Thái
    { wch: 20 }  // Ghi Chú
  ];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "BaoCaoCaTruc");
  await exportExcelFile(workbook, `BaoCao_CaTruc_${selectedMonth.value}.xlsx`, showToast);
};

// Lifecycle & Native Mobile Event Listeners
let lastBackPressTime = 0;
let backListenerHandle = null;

const setupBackButtonListener = async () => {
  if (typeof window !== 'undefined' && window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform()) {
    try {
      backListenerHandle = await CapApp.addListener('backButton', () => {
        // 1. Close open modals in priority order
        if (showUpdateModal.value && !updateInfo.value?.forceUpdate) {
          showUpdateModal.value = false;
          impactLight();
          return;
        }
        if (showActivityDetailModal.value) {
          showActivityDetailModal.value = false;
          impactLight();
          return;
        }
        if (showLeaveActivityModal.value) {
          showLeaveActivityModal.value = false;
          impactLight();
          return;
        }
        if (showMemberModal.value) {
          showMemberModal.value = false;
          impactLight();
          return;
        }
        if (showBatchModal.value) {
          showBatchModal.value = false;
          impactLight();
          return;
        }
        if (showShiftSettingsModal.value) {
          showShiftSettingsModal.value = false;
          impactLight();
          return;
        }
        if (showConfigModal.value) {
          showConfigModal.value = false;
          impactLight();
          return;
        }
        if (deleteModal.value && deleteModal.value.show) {
          deleteModal.value.show = false;
          impactLight();
          return;
        }
        if (showMobileMenu.value) {
          showMobileMenu.value = false;
          impactLight();
          return;
        }

        // 2. If on a secondary tab, return to main tab ('activities')
        if (isLoggedIn.value && currentTab.value !== 'activities') {
          currentTab.value = 'activities';
          impactLight();
          return;
        }

        // 3. Double-tap Back button within 2s to exit app
        const now = Date.now();
        if (now - lastBackPressTime < 2000) {
          CapApp.exitApp();
        } else {
          lastBackPressTime = now;
          impactLight();
          showToast('Nhấn BACK lần nữa để thoát ứng dụng', 'info');
        }
      });
    } catch (e) {
      console.warn('[BackButton] Setup error:', e);
    }
  }
};

const setupNotifications = async () => {
  await initPushNotifications((action) => {
    const extra = action?.notification?.data || action?.notification?.extra;
    if (extra?.type === 'leave_request' && currentUserRole.value === 'admin') {
      currentTab.value = 'leave';
    } else if (extra?.type === 'shift_reminder') {
      currentTab.value = 'entry';
    } else if (extra?.type === 'activity_reminder') {
      currentTab.value = 'activities';
    }
  });
};

watch(
  () => [isLoggedIn.value, loggedInMemberId.value, searchedShifts.value],
  () => {
    if (isLoggedIn.value && loggedInMemberId.value) {
      const userShifts = searchedShifts.value.filter(s => String(s.memberId).toUpperCase() === String(loggedInMemberId.value).toUpperCase());
      const name = getMemberName(loggedInMemberId.value);
      syncAllUpcomingShiftReminders(userShifts, name);
    }
  },
  { deep: true }
);

onMounted(() => {
  applyTheme();
  initNetworkListener(initCloudRealtime);
  setupBackButtonListener();
  setupNotifications();

  // Auto-check for OTA updates after app launch
  setTimeout(() => {
    checkForUpdate(false);
  }, 2500);

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

onBeforeUnmount(() => {
  if (backListenerHandle) {
    try { backListenerHandle.remove(); } catch (e) {}
  }
});
</script>
