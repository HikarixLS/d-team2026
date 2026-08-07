<template>
  <div class="space-y-6">
    <!-- User Welcome Hero Banner -->
    <div class="bg-gradient-to-r from-sky-900 via-indigo-900 to-blue-950 rounded-3xl p-6 text-white shadow-xl border border-sky-700/40 relative overflow-hidden">
      <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-400/20 text-sky-300 text-xs font-black mb-2 border border-sky-400/30">
            <i class="fa-solid fa-user-graduate"></i> Không Gian Thành Viên
          </div>
          <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight">Cổng Hoạt Động Cá Nhân</h2>
          <p class="text-xs sm:text-sm text-sky-200 mt-1">
            Tổng hợp hoạt động tháng {{ selectedMonthText }} • Bấm điểm danh đúng ngày hoặc gửi đơn xin nghỉ hoạt động.
          </p>
        </div>

        <div class="flex items-center gap-3 bg-sky-950/70 backdrop-blur-md px-4 py-3 rounded-2xl border border-sky-700/50 shadow-md">
          <div class="w-10 h-10 rounded-xl bg-sky-500 text-white font-black text-lg flex items-center justify-center shadow-md shrink-0">
            {{ activeMemberName ? activeMemberName.trim().slice(-1).toUpperCase() : 'T' }}
          </div>
          <div>
            <div class="text-xs font-black text-white flex items-center gap-1.5">
              <i class="fa-solid fa-user-check text-sky-400"></i>
              <span>{{ (activeMemberName && activeMemberName !== loggedInMemberId) ? activeMemberName : `Thành Viên (${loggedInMemberId})` }}</span>
            </div>
            <div class="text-[11px] font-bold text-sky-300 flex items-center gap-1 mt-0.5">
              <i class="fa-solid fa-id-card text-sky-400"></i>
              <span>MSSV: {{ loggedInMemberId }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Personal Monthly Summary Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      <!-- Total Activities this Month -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3">
        <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl shrink-0">
          <i class="fa-solid fa-calendar-days"></i>
        </div>
        <div>
          <div class="text-2xl font-black text-slate-800 dark:text-white leading-none">
            {{ monthlyActivities.length }}
          </div>
          <div class="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
            Hoạt Động Tháng
          </div>
        </div>
      </div>

      <!-- Joined / Attended Activities -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3">
        <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl shrink-0">
          <i class="fa-solid fa-user-check"></i>
        </div>
        <div>
          <div class="text-2xl font-black text-emerald-600 dark:text-emerald-400 leading-none">
            {{ userAttendedCount }}
          </div>
          <div class="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
            Đã Tham Gia
          </div>
        </div>
      </div>

      <!-- Leave Requested Activities -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3">
        <div class="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl shrink-0">
          <i class="fa-solid fa-file-signature"></i>
        </div>
        <div>
          <div class="text-2xl font-black text-amber-600 dark:text-amber-400 leading-none">
            {{ userLeaveCount }}
          </div>
          <div class="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
            Đã Xin Nghỉ
          </div>
        </div>
      </div>

      <!-- Attendance Participation Rate -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3">
        <div class="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center text-xl shrink-0">
          <i class="fa-solid fa-chart-line"></i>
        </div>
        <div>
          <div class="text-2xl font-black text-sky-600 dark:text-sky-400 leading-none">
            {{ participationRate }}%
          </div>
          <div class="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
            Tỷ Lệ Chuyên Cần
          </div>
        </div>
      </div>
    </div>

    <!-- Monthly Activities List -->
    <div class="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 class="font-extrabold text-slate-800 dark:text-white text-lg flex items-center gap-2">
            <i class="fa-solid fa-list-check text-indigo-600"></i> Danh Sách Hoạt Động Trong Tháng
          </h3>
          <p class="text-xs text-slate-500 font-medium">Quy định: Chỉ được tự điểm danh đúng trong ngày diễn ra ca trực (Quên điểm danh sẽ nhờ Admin điểm danh hộ/bù).</p>
        </div>

        <!-- Month Filter Selector -->
        <div class="flex items-center gap-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
          <span class="text-slate-500">Tháng:</span>
          <input type="month" :value="selectedMonth" @input="$emit('update:selectedMonth', $event.target.value)"
                 class="bg-transparent font-bold text-slate-800 dark:text-white focus:outline-none cursor-pointer">
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="monthlyActivities.length === 0" class="py-12 text-center text-slate-400 space-y-2">
        <i class="fa-solid fa-calendar-xmark text-4xl text-slate-300"></i>
        <div class="font-bold text-sm">Không có hoạt động nào diễn ra trong tháng {{ selectedMonthText }}.</div>
        <div class="text-xs">Vui lòng chọn tháng khác hoặc chờ Quản trị viên cập nhật thêm hoạt động mới.</div>
      </div>

      <!-- Activities Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="act in monthlyActivities" :key="act.id"
             class="bg-slate-50/70 dark:bg-slate-800/40 rounded-3xl p-5 border border-slate-200/70 dark:border-slate-800 hover:border-indigo-300 transition flex flex-col justify-between space-y-4">
          <!-- Top Info -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                {{ act.semester }}
              </span>

              <!-- Status Badges for Date Enforcement -->
              <span v-if="getUserCheckInRecord(act.id)?.status === 'present'"
                    class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1 border border-emerald-300">
                <i class="fa-solid fa-circle-check text-emerald-600"></i>
                {{ getUserCheckInRecord(act.id)?.adminCheckedIn ? 'Đã Đ.Danh (Admin Hộ)' : 'Đã Điểm Danh' }}
              </span>

              <span v-else-if="getUserCheckInRecord(act.id)?.status === 'leave'"
                    class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1 border border-amber-300">
                <i class="fa-solid fa-clock"></i> Đã Xin Nghỉ
              </span>

              <span v-else-if="act.date === todayDate"
                    class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-white animate-pulse flex items-center gap-1">
                <i class="fa-solid fa-bolt"></i> Sẵn Sàng Điểm Danh (Hôm Nay)
              </span>

              <span v-else-if="act.date > todayDate"
                    class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-300">
                🗓️ Chưa Đến Ngày ({{ formatDate(act.date) }})
              </span>

              <span v-else
                    class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300">
                ⚠️ Quá Hạn (Cần Admin điểm danh bù)
              </span>
            </div>

            <h4 class="font-extrabold text-slate-800 dark:text-white text-base leading-snug">{{ act.name }}</h4>

            <div class="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-400 font-medium">
              <p class="flex items-center gap-1.5">
                <i class="fa-solid fa-calendar-day text-indigo-500"></i>
                <span class="font-bold">Ngày diễn ra:</span> {{ formatDate(act.date) }}
                <span v-if="act.date === todayDate" class="text-emerald-600 font-black ml-1">(Hôm nay)</span>
              </p>
              <p class="flex items-center gap-1.5">
                <i class="fa-solid fa-location-dot text-rose-500"></i>
                <span class="font-bold">Địa điểm:</span> {{ act.location || 'Trường ĐH' }}
              </p>
            </div>

            <p v-if="act.description" class="text-xs text-slate-500 italic mt-2 line-clamp-2">
              "{{ act.description }}"
            </p>

            <!-- Registered Activity Shifts Badges -->
            <div v-if="getUserActivityRegs(act.id).length > 0" class="mt-3 space-y-1.5 border-t border-slate-200/60 dark:border-slate-700/60 pt-2">
              <div class="text-[11px] font-bold text-sky-700 dark:text-sky-300 flex items-center gap-1">
                <i class="fa-solid fa-clipboard-check"></i> Ca hoạt động đã đăng ký:
              </div>
              <div class="flex flex-wrap gap-1">
                <span v-for="r in getUserActivityRegs(act.id)" :key="r.id"
                      class="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300 border border-sky-300 flex items-center gap-1">
                  <span>✓ {{ formatDate(r.date) }} ({{ r.shiftType }})</span>
                </span>
              </div>
            </div>
          </div>

          <!-- Bottom Action Buttons (Check-in, Request Leave, Register Shift) -->
          <div class="pt-3 border-t border-slate-200/60 dark:border-slate-700/60 space-y-2 text-xs">
            <button @click="openRegModal(act)"
                    class="w-full py-2 px-3 rounded-2xl font-bold bg-sky-600 hover:bg-sky-700 text-white transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer">
              <i class="fa-solid fa-calendar-plus"></i> Đăng Ký Ca Tham Gia (Theo Ngày/Ca)
            </button>

            <div class="grid grid-cols-2 gap-2">
              <!-- Điểm danh Button -->
              <button @click="handleCheckInClick(act)"
                      :disabled="getUserCheckInRecord(act.id)?.status !== 'present' && !canUserCheckInToday(act)"
                      class="py-2 px-3 rounded-2xl font-extrabold transition flex items-center justify-center gap-1.5 shadow-xs"
                      :class="[
                        getUserCheckInRecord(act.id)?.status === 'present'
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer'
                          : (canUserCheckInToday(act)
                              ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer active:scale-95 shadow-md'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300/60')
                      ]"
                      :title="getCheckInButtonTitle(act)">
                <i class="fa-solid" :class="getUserCheckInRecord(act.id)?.status === 'present' ? 'fa-user-check' : (canUserCheckInToday(act) ? 'fa-bolt' : 'fa-lock')"></i>
                <span>{{ getCheckInButtonText(act) }}</span>
              </button>

              <!-- Xin nghỉ Button -->
              <button @click="$emit('open-leave-modal', act)"
                      class="py-2 px-3 rounded-2xl font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
                      :class="getUserCheckInRecord(act.id)?.status === 'leave' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200'">
                <i class="fa-solid fa-file-pen"></i>
                <span>Xin Nghỉ</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Registration Modal for Activity Shift -->
    <div v-if="selectedActForReg" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 max-w-md w-full shadow-2xl space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 class="font-extrabold text-slate-800 dark:text-white text-base flex items-center gap-2">
            <i class="fa-solid fa-calendar-plus text-sky-600"></i> Đăng Ký Ca Hoạt Động
          </h3>
          <button @click="selectedActForReg = null" class="text-slate-400 hover:text-slate-600 p-1.5 cursor-pointer">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <div class="text-xs space-y-1">
          <p class="font-bold text-slate-800 dark:text-white text-sm">{{ selectedActForReg.name }}</p>
          <p class="text-slate-500">📍 {{ selectedActForReg.location || 'Trường ĐH' }}</p>
        </div>

        <form @submit.prevent="submitShiftReg" class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Chọn Ngày Tham Gia <span class="text-rose-500">*</span>
            </label>
            <select v-model="regModalForm.date" required class="w-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl p-2.5 font-bold focus:outline-none">
              <option v-for="d in getAvailableDates(selectedActForReg)" :key="d" :value="d">
                🗓️ Ngày {{ formatDate(d) }} {{ d === todayDate ? '(Hôm nay)' : '' }}
              </option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Chọn Ca Tham Gia <span class="text-rose-500">*</span>
            </label>
            <select v-model="regModalForm.shiftType" required class="w-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl p-2.5 font-bold focus:outline-none">
              <option value="Ca 1">Ca 1 (7h30 - 9h20)</option>
              <option value="Ca 2">Ca 2 (9h20 - 11h30)</option>
              <option value="Ca 3">Ca 3 (13h00 - 15h20)</option>
              <option value="Ca 4">Ca 4 (15h20 - 17h00)</option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Ghi chú (Tùy chọn)</label>
            <input type="text" v-model="regModalForm.notes" placeholder="VD: Tham gia ca sáng hỗ trợ khâu trang trí..."
                   class="w-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl p-2 font-medium focus:outline-none" />
          </div>

          <div class="pt-2 flex items-center justify-end gap-2">
            <button type="button" @click="selectedActForReg = null" class="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold cursor-pointer">
              Hủy bỏ
            </button>
            <button type="submit" class="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold cursor-pointer">
              Xác Nhận Đăng Ký
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Chụp Hình / Tải Ảnh Minh Chứng Thẻ SV & Google Drive Sync -->
    <div v-if="showCheckInProofModal && selectedActForCheckIn" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 max-w-lg w-full shadow-2xl space-y-4 my-auto">
        <!-- Header -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-lg font-bold shadow-md">
              <i class="fa-solid fa-camera"></i>
            </div>
            <div>
              <h3 class="font-extrabold text-slate-900 dark:text-white text-base">Chụp Ảnh &amp; Điểm Danh Thẻ SV</h3>
              <p class="text-xs text-slate-500 truncate max-w-xs">{{ selectedActForCheckIn.name }}</p>
            </div>
          </div>
          <button @click="closeCheckInModal" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <!-- Google Drive Cloud Target Info Banner -->
        <div class="bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 rounded-2xl p-3.5 space-y-2 text-xs">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div class="font-black text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5 text-xs uppercase tracking-wide">
              <i class="fa-brands fa-google-drive text-amber-500 text-sm"></i> Thư Mục Google Drive Lưu Trữ:
            </div>
            <a :href="googleDriveFolderUrl" target="_blank"
               class="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-xl text-[11px] shadow-xs transition flex items-center gap-1 cursor-pointer">
              <i class="fa-solid fa-arrow-up-right-from-square"></i> Mở Drive
            </a>
          </div>

          <div class="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900/40 space-y-1 font-mono text-[11px]">
            <div class="text-slate-700 dark:text-slate-300">
              📁 <span class="font-bold text-slate-900 dark:text-white">Folder Ngày:</span>
              <span class="text-indigo-600 dark:text-indigo-400 font-bold ml-1">{{ currentProofFolderDate }}</span>
            </div>
            <div class="text-slate-700 dark:text-slate-300 break-all">
              🏷️ <span class="font-bold text-slate-900 dark:text-white">Quy ước tên file:</span>
              <span class="text-emerald-600 dark:text-emerald-400 font-bold ml-1">{{ currentStandardFileName }}</span>
            </div>
          </div>
        </div>

        <!-- Capture / Upload Modes Switcher -->
        <div class="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          <button type="button" @click="setCaptureMode('camera')"
                  :class="captureMode === 'camera' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-extrabold' : 'text-slate-600 dark:text-slate-400 font-medium'"
                  class="py-2 text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer">
            <i class="fa-solid fa-camera"></i> Chụp Camera Trực Tiếp
          </button>
          <button type="button" @click="setCaptureMode('upload')"
                  :class="captureMode === 'upload' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-extrabold' : 'text-slate-600 dark:text-slate-400 font-medium'"
                  class="py-2 text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer">
            <i class="fa-solid fa-upload"></i> Tải Ảnh Từ Thiết Bị
          </button>
        </div>

        <!-- Mode 1: Live Camera Stream Capture Area -->
        <div v-if="captureMode === 'camera' && !proofImageBase64" class="space-y-3">
          <div class="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-200 dark:border-slate-800">
            <video ref="videoElementRef" autoplay playsinline muted class="w-full h-full object-cover"></video>
            
            <!-- Camera Flip Button -->
            <button type="button" @click="flipCamera" title="Đổi camera trước / sau"
                    class="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 text-white hover:bg-black/80 flex items-center justify-center text-xs backdrop-blur-sm cursor-pointer transition">
              <i class="fa-solid fa-camera-rotate"></i>
            </button>

            <!-- Guide overlay -->
            <div class="absolute inset-x-8 inset-y-6 border-2 border-dashed border-white/60 rounded-2xl pointer-events-none flex items-center justify-center">
              <span class="bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">Đặt thẻ SV vào khung</span>
            </div>
          </div>

          <button type="button" @click="capturePhotoFromCamera"
                  class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-extrabold rounded-2xl shadow-md transition cursor-pointer flex items-center justify-center gap-2 text-xs">
            <i class="fa-solid fa-circle-dot text-rose-400 animate-pulse text-sm"></i> 📸 BẤM CHỤP ẢNH THẺ SV NGAY
          </button>
        </div>

        <!-- Mode 2: File Upload Area -->
        <div v-else-if="captureMode === 'upload' && !proofImageBase64">
          <input type="file" accept="image/*" ref="fileInputRef" @change="handleProofImageUpload" class="hidden" />

          <button type="button" @click="$refs.fileInputRef.click()"
                  class="w-full border-2 border-dashed border-indigo-300 dark:border-indigo-700 hover:border-indigo-500 bg-indigo-50/50 dark:bg-slate-800/60 rounded-2xl p-6 text-center space-y-2 cursor-pointer transition group">
            <div class="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 mx-auto flex items-center justify-center text-2xl group-hover:scale-110 transition">
              <i class="fa-solid fa-cloud-arrow-up"></i>
            </div>
            <div class="font-extrabold text-slate-800 dark:text-white text-xs">Bấm để chọn file ảnh thẻ SV từ máy</div>
            <div class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Hỗ trợ định dạng JPG, PNG, WEBP</div>
          </button>
        </div>

        <!-- Captured / Uploaded Image Preview Box -->
        <div v-if="proofImageBase64" class="relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 p-2.5 flex flex-col items-center space-y-2">
          <img :src="proofImageBase64" class="max-h-56 object-contain rounded-xl shadow-md border border-slate-800">
          
          <div class="flex items-center justify-between w-full px-1">
            <span class="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
              <i class="fa-solid fa-circle-check"></i> Ảnh đã sẵn sàng!
            </span>
            <div class="flex items-center gap-1.5">
              <button type="button" @click="downloadCapturedPhoto" title="Tải ảnh về máy"
                      class="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1">
                <i class="fa-solid fa-download"></i> Tải ảnh
              </button>
              <button type="button" @click="retakePhoto"
                      class="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition cursor-pointer">
                ✕ Đổi ảnh
              </button>
            </div>
          </div>
        </div>

        <!-- Hidden canvas for capturing -->
        <canvas ref="canvasElementRef" class="hidden"></canvas>

        <!-- Footer Actions -->
        <div class="pt-2 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
          <a :href="googleDriveFolderUrl" target="_blank"
             class="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1">
            <i class="fa-brands fa-google-drive"></i> Link Google Drive
          </a>

          <div class="flex items-center gap-2">
            <button type="button" @click="closeCheckInModal" class="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-xs cursor-pointer">
              Hủy bỏ
            </button>
            <button type="button" @click="confirmCheckInWithProof"
                    :disabled="!proofImageBase64"
                    :class="[
                      proofImageBase64
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-95 shadow-md'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300/60'
                    ]"
                    class="px-5 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-1.5 shadow-sm">
              <i class="fa-solid fa-bolt"></i> ⚡ Xác Nhận Điểm Danh
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue';

const props = defineProps({
  activities: Array,
  selectedMonth: String,
  loggedInMemberId: String,
  activeMemberName: String,
  activityRegistrations: {
    type: Array,
    default: () => []
  },
  getUserCheckInRecord: Function,
  getActivityDates: Function,
  formatDate: Function
});

const emit = defineEmits(['update:selectedMonth', 'check-in', 'open-leave-modal', 'register-activity-shift', 'delete-activity-reg']);

const selectedActForReg = ref(null);
const regModalForm = ref({ date: '', shiftType: 'Ca 1', notes: '' });

const showCheckInProofModal = ref(false);
const selectedActForCheckIn = ref(null);
const proofImageBase64 = ref('');
const captureMode = ref('camera'); // 'camera' | 'upload'
const facingMode = ref('environment'); // 'user' | 'environment'

const videoElementRef = ref(null);
const canvasElementRef = ref(null);
let mediaStream = null;

const googleDriveFolderUrl = 'https://drive.google.com/drive/folders/1zbUHwDzxXVfYK_kTIdQvVZXYJ2sVMBsd';

const formatActivityFolderName = (act) => {
  const dateStr = act?.date;
  let datePrefix = '';
  if (dateStr && dateStr.includes('-')) {
    const parts = dateStr.split('-');
    datePrefix = `${parts[2]}_${parts[1]}_${parts[0]}`;
  } else {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    datePrefix = `${dd}_${mm}_${yyyy}`;
  }
  const actName = act?.name ? ` _ ${act.name}` : '';
  return `${datePrefix}${actName}`;
};

const currentProofFolderDate = computed(() => {
  return formatActivityFolderName(selectedActForCheckIn.value);
});

const currentStandardFileName = computed(() => {
  const name = props.activeMemberName || 'Thành viên';
  const mssv = props.loggedInMemberId || 'MSSV';
  const act = selectedActForCheckIn.value;
  let dateStr = '';
  if (act?.date && act.date.includes('-')) {
    const parts = act.date.split('-');
    dateStr = `${parts[2]}_${parts[1]}_${parts[0]}`;
  } else {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    dateStr = `${dd}_${mm}_${yyyy}`;
  }
  return `${name} - ${mssv} - ${dateStr}.jpg`;
});

const startCamera = async () => {
  stopCamera();
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    captureMode.value = 'upload';
    return;
  }
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: facingMode.value,
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    });
    if (videoElementRef.value) {
      videoElementRef.value.srcObject = mediaStream;
      videoElementRef.value.play().catch(() => {});
    }
  } catch (err) {
    console.warn('Camera access denied or unavailable, switching to file upload:', err);
    captureMode.value = 'upload';
  }
};

const stopCamera = () => {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
  }
};

const flipCamera = () => {
  facingMode.value = facingMode.value === 'user' ? 'environment' : 'user';
  startCamera();
};

const setCaptureMode = (mode) => {
  captureMode.value = mode;
  if (mode === 'camera' && !proofImageBase64.value) {
    setTimeout(startCamera, 100);
  } else {
    stopCamera();
  }
};

const capturePhotoFromCamera = () => {
  const video = videoElementRef.value;
  const canvas = canvasElementRef.value;
  if (!video || !canvas) return;

  const w = video.videoWidth || 640;
  const h = video.videoHeight || 480;
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, w, h);

  proofImageBase64.value = canvas.toDataURL('image/jpeg', 0.85);
  stopCamera();
};

const retakePhoto = () => {
  proofImageBase64.value = '';
  if (captureMode.value === 'camera') {
    setTimeout(startCamera, 100);
  }
};

const downloadCapturedPhoto = () => {
  if (!proofImageBase64.value) return;
  const link = document.createElement('a');
  link.href = proofImageBase64.value;
  link.download = currentStandardFileName.value;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const closeCheckInModal = () => {
  stopCamera();
  showCheckInProofModal.value = false;
  selectedActForCheckIn.value = null;
  proofImageBase64.value = '';
};

onBeforeUnmount(() => {
  stopCamera();
});

const openRegModal = (act) => {
  selectedActForReg.value = act;
  const dates = getAvailableDates(act);
  regModalForm.value = {
    date: dates.length > 0 ? dates[0] : act.date,
    shiftType: 'Ca 1',
    notes: ''
  };
};

const getAvailableDates = (act) => {
  if (!act) return [];
  if (props.getActivityDates) {
    const dates = props.getActivityDates(act);
    return dates.filter(d => d >= todayDate.value);
  }
  return [act.date];
};

const submitShiftReg = () => {
  if (!selectedActForReg.value) return;
  emit('register-activity-shift', {
    activityId: selectedActForReg.value.id,
    date: regModalForm.value.date,
    shiftType: regModalForm.value.shiftType,
    notes: regModalForm.value.notes
  });
  selectedActForReg.value = null;
};

const getUserActivityRegs = (actId) => {
  if (!props.activityRegistrations || !props.loggedInMemberId) return [];
  return props.activityRegistrations.filter(
    r => r.activityId === actId && r.memberId?.toLowerCase() === props.loggedInMemberId?.toLowerCase()
  );
};

const todayDate = computed(() => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
});

const canUserCheckInToday = (act) => {
  if (!act) return false;
  const userRegs = getUserActivityRegs(act.id);
  if (userRegs.length > 0) {
    return userRegs.some(r => r.date === todayDate.value);
  }
  const actDates = props.getActivityDates ? props.getActivityDates(act) : [act.date];
  return actDates.includes(todayDate.value);
};

const handleCheckInClick = (act) => {
  const rec = props.getUserCheckInRecord(act.id);
  if (rec?.status === 'present') return;
  if (!canUserCheckInToday(act)) return;

  selectedActForCheckIn.value = act;
  proofImageBase64.value = '';
  showCheckInProofModal.value = true;
  captureMode.value = 'camera';
  setTimeout(startCamera, 150);
};

const handleProofImageUpload = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    alert('Vui lòng chọn file hình ảnh!');
    return;
  }
  const reader = new FileReader();
  reader.onload = (event) => {
    proofImageBase64.value = event.target.result;
  };
  reader.readAsDataURL(file);
};

const confirmCheckInWithProof = () => {
  if (!selectedActForCheckIn.value || !proofImageBase64.value) return;

  // Auto-download standardized image for Google Drive folder
  downloadCapturedPhoto();

  emit('check-in', {
    activityId: selectedActForCheckIn.value.id,
    proofImage: proofImageBase64.value,
    proofFileName: currentStandardFileName.value,
    proofFolderDate: currentProofFolderDate.value
  });

  closeCheckInModal();
};

const selectedMonthText = computed(() => {
  if (!props.selectedMonth) return '';
  const parts = props.selectedMonth.split('-');
  return `${parts[1]}/${parts[0]}`;
});

const monthlyActivities = computed(() => {
  if (!props.activities) return [];
  return props.activities.filter(a => a.date && a.date.startsWith(props.selectedMonth));
});

const userAttendedCount = computed(() => {
  return monthlyActivities.value.filter(act => {
    const rec = props.getUserCheckInRecord(act.id);
    return rec && rec.status === 'present';
  }).length;
});

const userLeaveCount = computed(() => {
  return monthlyActivities.value.filter(act => {
    const rec = props.getUserCheckInRecord(act.id);
    return rec && rec.status === 'leave';
  }).length;
});

const participationRate = computed(() => {
  if (monthlyActivities.value.length === 0) return 0;
  return Math.round((userAttendedCount.value / monthlyActivities.value.length) * 100);
});

const getCheckInButtonText = (act) => {
  const rec = props.getUserCheckInRecord(act.id);
  if (rec?.status === 'present') return 'Đã Điểm Danh';

  const userRegs = getUserActivityRegs(act.id);
  if (userRegs.length > 0) {
    const isRegToday = userRegs.some(r => r.date === todayDate.value);
    if (isRegToday) return 'Điểm Danh Ngay';
    return 'Chưa Đến Ca Trực';
  }

  if (act.date === todayDate.value) return 'Điểm Danh Ngay';
  if (act.date > todayDate.value) return 'Chưa Đến Ngày';
  return 'Quá Hạn Điểm Danh';
};

const getCheckInButtonTitle = (act) => {
  const rec = props.getUserCheckInRecord(act.id);
  if (rec?.status === 'present') return 'Bạn đã hoàn thành điểm danh ca này';

  const userRegs = getUserActivityRegs(act.id);
  if (userRegs.length > 0) {
    const isRegToday = userRegs.some(r => r.date === todayDate.value);
    if (isRegToday) return 'Bấm để chụp hình thẻ sinh viên và điểm danh hôm nay!';
    const regDatesStr = userRegs.map(r => props.formatDate(r.date)).join(', ');
    return `Chưa đến ca trực bạn đã đăng ký (${regDatesStr}). Nút điểm danh chỉ mở đúng ngày ca trực!`;
  }

  if (act.date === todayDate.value) return 'Bấm để chụp hình thẻ sinh viên và điểm danh hôm nay!';
  if (act.date > todayDate.value) return `Chưa đến ngày diễn ra (${props.formatDate(act.date)}). Không thể điểm danh trước!`;
  return `Đã quá hạn điểm danh ngày ${props.formatDate(act.date)}. Vui lòng liên hệ Admin để điểm danh bù.`;
};
</script>
