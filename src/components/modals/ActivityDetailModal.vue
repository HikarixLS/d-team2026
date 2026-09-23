<template>
  <Transition name="modal-fade">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full p-5 sm:p-6 border border-slate-100 dark:border-slate-800 flex flex-col max-h-[92vh]">
        <!-- Header -->
        <div class="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span class="px-2.5 py-1 text-[11px] font-black rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
              {{ activity?.semester }}
            </span>
            <h3 class="font-extrabold text-slate-800 dark:text-white text-base sm:text-lg mt-1">{{ activity?.name }}</h3>
            <p class="text-xs text-slate-500 font-medium flex items-center gap-2 mt-0.5">
              <span><i class="fa-solid fa-calendar-days text-indigo-500"></i> {{ formatDate(activity?.date) }}</span>
              <span>•</span>
              <span><i class="fa-solid fa-location-dot text-rose-500"></i> {{ activity?.location || 'Trường ĐH' }}</span>
            </p>
          </div>
          <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600 p-2 rounded-xl cursor-pointer">
            <i class="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <!-- Stats Quick Bar -->
        <div class="grid grid-cols-2 gap-3 py-2.5 my-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl px-4 border border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-lg">
              <i class="fa-solid fa-user-check"></i>
            </div>
            <div>
              <div class="text-xl font-black text-emerald-600 dark:text-emerald-400">{{ stats?.totalCheckIns || 0 }}</div>
              <div class="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Đã điểm danh</div>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-lg">
              <i class="fa-solid fa-user-xmark"></i>
            </div>
            <div>
              <div class="text-xl font-black text-amber-600 dark:text-amber-400">{{ stats?.totalLeaves || 0 }}</div>
              <div class="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Đã xin nghỉ</div>
            </div>
          </div>
        </div>

        <!-- Admin Check-In On Behalf Form -->
        <div class="mb-4 p-3.5 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200/70 dark:border-indigo-900/60 space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-1.5">
            <div class="text-xs font-black text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5 uppercase">
              <i class="fa-solid fa-user-shield text-indigo-600"></i> Quản Trị Viên Điểm Danh Hộ / Điểm Danh Bù
            </div>
            <!-- Toggle Filter Mode -->
            <div class="flex items-center gap-1 text-[10px] font-bold bg-white/80 dark:bg-slate-900/80 p-0.5 rounded-xl border border-indigo-200/60 dark:border-indigo-800/60">
              <button type="button" @click="filterOnlyRegistered = true"
                      class="px-2 py-0.5 rounded-lg transition cursor-pointer"
                      :class="filterOnlyRegistered ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'">
                Đã đăng ký ({{ uniqueRegisteredMembersCount }})
              </button>
              <button type="button" @click="filterOnlyRegistered = false"
                      class="px-2 py-0.5 rounded-lg transition cursor-pointer"
                      :class="!filterOnlyRegistered ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'">
                Tất cả thành viên
              </button>
            </div>
          </div>

          <!-- 1. Search Member Input (When no member is chosen yet) -->
          <div v-if="!selectedAdminMember" class="space-y-1.5">
            <div class="relative flex items-center">
              <i class="fa-solid fa-magnifying-glass absolute left-3 text-indigo-400 text-xs"></i>
              <input type="text"
                     v-model="memberSearchQuery"
                     :placeholder="filterOnlyRegistered ? 'Nhập tên hoặc MSSV thành viên đã đăng ký...' : 'Nhập tên hoặc MSSV để tìm trong tất cả thành viên...'"
                     class="w-full text-xs pl-8 pr-8 py-2.5 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-xl font-bold text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
              <button v-if="memberSearchQuery" @click="memberSearchQuery = ''"
                      type="button"
                      class="absolute right-2.5 text-slate-400 hover:text-slate-600 p-1 text-xs cursor-pointer">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>

            <!-- Autocomplete / Filtered Members List -->
            <div class="max-h-48 overflow-y-auto rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-white dark:bg-slate-900 shadow-md divide-y divide-slate-100 dark:divide-slate-800">
              <div v-if="candidateMembers.length === 0" class="p-3 text-center text-xs text-slate-400 italic">
                {{ memberSearchQuery ? 'Không tìm thấy thành viên phù hợp.' : 'Chưa có thành viên nào trong danh sách đăng ký.' }}
              </div>
              <div v-for="m in candidateMembers" :key="m.id"
                   @click="selectAdminMember(m)"
                   class="p-2.5 hover:bg-indigo-50/70 dark:hover:bg-slate-800/80 cursor-pointer transition flex items-center justify-between gap-2">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
                    {{ m.name ? m.name.charAt(0).toUpperCase() : 'U' }}
                  </div>
                  <div>
                    <div class="text-xs font-bold text-slate-800 dark:text-white">
                      {{ m.name }}
                      <span class="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 ml-1">[{{ m.id }}]</span>
                    </div>
                    <div class="text-[10px] text-slate-400">{{ m.department || 'Ban chưa đặt' }}</div>
                  </div>
                </div>

                <div class="flex items-center gap-1.5 shrink-0">
                  <span v-if="getMemberRegisteredShiftsCount(m.id) > 0"
                        class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                    {{ getMemberRegisteredShiftsCount(m.id) }} ca đăng ký
                  </span>
                  <span v-if="isMemberAnyCheckedIn(m.id)"
                        class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    ✓ Đã điểm danh
                  </span>
                  <span class="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400">
                    Chọn ➔
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. Selected Member Panel & Shift Selection -->
          <div v-else class="space-y-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-indigo-200 dark:border-indigo-800">
            <!-- Member Header & Change Button -->
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                  {{ selectedAdminMember.name ? selectedAdminMember.name.charAt(0).toUpperCase() : 'U' }}
                </div>
                <div>
                  <div class="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                    <span>{{ selectedAdminMember.name }}</span>
                    <span class="text-indigo-600 dark:text-indigo-400 font-extrabold">[{{ selectedAdminMember.id }}]</span>
                  </div>
                  <div class="text-[10px] text-slate-400">{{ selectedAdminMember.department || 'Ban chưa đặt' }}</div>
                </div>
              </div>

              <button type="button" @click="selectedAdminMember = null; selectedShift = null;"
                      class="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1">
                <i class="fa-solid fa-arrows-rotate"></i> Đổi thành viên
              </button>
            </div>

            <!-- Shifts that this member registered for -->
            <div>
              <div class="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Chọn ca hoạt động để điểm danh:</span>
                <span v-if="memberRegisteredShifts.length > 0" class="text-[10px] text-sky-600 font-semibold">
                  (Thành viên đã đăng ký {{ memberRegisteredShifts.length }} ca)
                </span>
              </div>

              <!-- Case A: Member registered for specific shifts -->
              <div v-if="memberRegisteredShifts.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div v-for="s in memberRegisteredShifts" :key="s.id"
                     @click="selectedShift = s"
                     class="p-2.5 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between"
                     :class="selectedShift?.id === s.id
                       ? 'bg-indigo-50 border-indigo-500 dark:bg-indigo-950/60 dark:border-indigo-500 text-indigo-950 dark:text-indigo-100 ring-2 ring-indigo-500 shadow-xs'
                       : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'">
                  <div>
                    <div class="font-bold flex items-center gap-1.5">
                      <i class="fa-solid fa-calendar-day text-indigo-500"></i>
                      <span>Ngày {{ formatDate(s.date) }}</span>
                    </div>
                    <div class="text-[11px] font-extrabold text-indigo-700 dark:text-indigo-300 mt-0.5">
                      {{ s.shiftType }}
                    </div>
                    <div v-if="s.notes" class="text-[10px] text-slate-400 italic mt-0.5">
                      "{{ s.notes }}"
                    </div>
                  </div>

                  <div class="shrink-0 ml-2">
                    <span v-if="selectedShift?.id === s.id" class="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                      <i class="fa-solid fa-check"></i>
                    </span>
                    <span v-else class="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-600 inline-block"></span>
                  </div>
                </div>
              </div>

              <!-- Case B: Member didn't register for any specific shift -->
              <div v-else class="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-500">
                <div class="flex items-center gap-1.5 text-amber-600 font-bold mb-0.5">
                  <i class="fa-solid fa-triangle-exclamation"></i> Thành viên này chưa đăng ký ca cụ thể trong hoạt động.
                </div>
                <div>Điểm danh cho toàn bộ hoạt động ngày <b>{{ formatDate(activity?.date) }}</b>.</div>
              </div>
            </div>

            <!-- Action Button -->
            <div class="pt-1 flex items-center justify-end gap-2">
              <button type="button" @click="selectedAdminMember = null; selectedShift = null;"
                      class="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs transition cursor-pointer">
                Hủy
              </button>
              <button @click="handleAdminCheckIn"
                      type="button"
                      class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-extrabold rounded-xl text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer">
                <i class="fa-solid fa-user-check"></i>
                <span>Điểm Danh Hộ {{ selectedShift ? `(${selectedShift.shiftType})` : '' }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Detail Lists Tabs -->
        <div class="flex-grow overflow-y-auto pr-1 space-y-5 sm:space-y-6">
          <!-- Present List -->
          <div>
            <h4 class="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <i class="fa-solid fa-circle-check text-emerald-500"></i> Danh sách thành viên điểm danh ({{ stats?.presentList?.length || 0 }})
            </h4>

            <div v-if="!stats?.presentList?.length" class="text-center py-6 text-xs text-slate-400 font-medium italic bg-slate-50 dark:bg-slate-800/40 rounded-xl">
              Chưa có lượt điểm danh nào.
            </div>

            <div v-else class="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
              <div v-for="item in stats.presentList" :key="item.id" class="p-3 flex items-center justify-between bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <div class="flex items-center gap-3">
                  <!-- Member Avatar / Photo Thumbnail -->
                  <div v-if="item.proofImage" @click="openPhotoPreview(item)" class="relative cursor-pointer group shrink-0" title="Bấm để phóng to ảnh thẻ SV">
                    <img :src="item.proofImage" class="w-9 h-9 rounded-xl object-cover border-2 border-emerald-400 group-hover:scale-105 transition shadow-xs">
                    <span class="absolute -bottom-1 -right-1 bg-emerald-600 text-white text-[8px] px-1 rounded-full font-bold">
                      <i class="fa-solid fa-magnifying-glass"></i>
                    </span>
                  </div>
                  <div v-else class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center shrink-0">
                    {{ item.memberName ? item.memberName.charAt(0).toUpperCase() : 'U' }}
                  </div>

                  <div>
                    <div class="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                      {{ item.memberName }}
                      <button v-if="item.proofImage" @click="openPhotoPreview(item)" class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer">
                        [🖼️ Xem ảnh]
                      </button>
                    </div>
                    <div class="text-[11px] text-slate-400 font-medium">MSSV: {{ item.memberId }}</div>
                  </div>
                </div>
                <div class="text-right">
                  <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center gap-1 justify-end">
                    <i class="fa-solid fa-check"></i> {{ item.adminCheckedIn ? 'Admin Điểm Danh Hộ' : 'Có Mặt' }}
                  </span>
                  <div v-if="item.shiftType" class="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                    {{ item.shiftType }} {{ item.shiftDate ? `(${formatDate(item.shiftDate)})` : '' }}
                  </div>
                  <div class="text-[10px] text-slate-400 mt-0.5">{{ formatTime(item.timestamp) }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Leave Requests List -->
          <div>
            <h4 class="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <i class="fa-solid fa-envelope-open-text text-amber-500"></i> Danh sách xin nghỉ ({{ stats?.leaveList?.length || 0 }})
            </h4>

            <div v-if="!stats?.leaveList?.length" class="text-center py-6 text-xs text-slate-400 font-medium italic bg-slate-50 dark:bg-slate-800/40 rounded-xl">
              Chưa có thành viên nào gửi đơn xin nghỉ.
            </div>

            <div v-else class="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
              <div v-for="item in stats.leaveList" :key="item.id" class="p-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-black text-xs flex items-center justify-center">
                      {{ item.memberName ? item.memberName.charAt(0).toUpperCase() : 'U' }}
                    </div>
                    <div>
                      <div class="text-xs font-bold text-slate-800 dark:text-white">{{ item.memberName }}</div>
                      <div class="text-[11px] text-slate-400 font-medium">MSSV: {{ item.memberId }}</div>
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      <i class="fa-solid fa-clock"></i> Vắng có lý do
                    </span>
                    <div class="text-[10px] text-slate-400 mt-0.5">{{ formatTime(item.timestamp) }}</div>
                  </div>
                </div>
                <div v-if="item.leaveReason" class="mt-2 text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 p-2 rounded-xl border border-amber-200/50">
                  <span class="font-bold">Lý do:</span> {{ item.leaveReason }}
                </div>
              </div>
            </div>
          </div>

          <!-- Registered Shifts List -->
          <div>
            <h4 class="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <i class="fa-solid fa-clipboard-check text-sky-500"></i> Danh sách thành viên đăng ký theo Ngày/Ca ({{ stats?.regsList?.length || 0 }})
            </h4>

            <div v-if="!stats?.regsList?.length" class="text-center py-6 text-xs text-slate-400 font-medium italic bg-slate-50 dark:bg-slate-800/40 rounded-xl">
              Chưa có lượt đăng ký ca nào cho hoạt động này.
            </div>

            <div v-else class="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
              <div v-for="item in stats.regsList" :key="item.id" class="p-3 flex items-center justify-between bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-sky-100 text-sky-700 font-black text-xs flex items-center justify-center shrink-0">
                    {{ item.memberName ? item.memberName.charAt(0).toUpperCase() : 'U' }}
                  </div>
                  <div>
                    <div class="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                      <span>{{ item.memberName }}</span>
                      <span v-if="isShiftCheckedIn(item)" class="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        ✓ Đã Có Mặt
                      </span>
                    </div>
                    <div class="text-[11px] text-slate-400 font-medium">MSSV: {{ item.memberId }}</div>
                  </div>
                </div>

                <div class="flex items-center gap-2 text-right">
                  <div>
                    <span class="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300">
                      🗓️ {{ formatDate(item.date) }} • {{ item.shiftType }}
                    </span>
                    <div v-if="item.notes" class="text-[10px] text-slate-400 mt-0.5 italic">"{{ item.notes }}"</div>
                  </div>

                  <!-- Quick Check-in button if not checked in -->
                  <button v-if="!isShiftCheckedIn(item)"
                          type="button"
                          @click="quickCheckInShift(item)"
                          class="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-extrabold transition shadow-2xs cursor-pointer flex items-center gap-1 shrink-0"
                          title="Điểm danh hộ ngay cho ca này">
                    <i class="fa-solid fa-bolt"></i> Điểm danh hộ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <button @click="$emit('export-excel', activity)" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold rounded-xl text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer">
            <i class="fa-solid fa-file-excel"></i> Xuất Excel (DSSV)
          </button>

          <button @click="$emit('close')" class="px-5 py-2 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer">
            Đóng lại
          </button>
        </div>
      </div>

      <!-- Photo Preview Lightbox Modal -->
      <div v-if="previewPhotoModal.show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
        <div class="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 max-w-lg w-full shadow-2xl space-y-4">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-id-card text-indigo-600 text-lg"></i>
              <div>
                <h4 class="font-extrabold text-slate-900 dark:text-white text-sm">Ảnh Minh Chứng Thẻ SV</h4>
                <p class="text-xs text-slate-500 font-bold">{{ previewPhotoModal.item?.memberName }} ({{ previewPhotoModal.item?.memberId }})</p>
              </div>
            </div>
            <button @click="previewPhotoModal.show = false" class="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
              <i class="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>

          <div class="rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-slate-200 dark:border-slate-800 p-2">
            <img :src="previewPhotoModal.item?.proofImage" class="max-h-[60vh] object-contain rounded-xl shadow-lg">
          </div>

          <div class="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-mono space-y-1">
            <div class="text-slate-600 dark:text-slate-400">
              🏷️ <span class="font-bold text-slate-900 dark:text-white">Tên file chuẩn:</span>
              <span class="text-emerald-600 dark:text-emerald-400 font-bold ml-1">{{ getFormattedFileName(previewPhotoModal.item) }}</span>
            </div>
            <div class="text-slate-600 dark:text-slate-400">
              📁 <span class="font-bold text-slate-900 dark:text-white">Folder ngày:</span>
              <span class="text-indigo-600 dark:text-indigo-400 font-bold ml-1">{{ getFolderDateStr(activity?.date) }}</span>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2">
            <a :href="googleDriveFolderUrl" target="_blank" rel="noopener noreferrer"
               class="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-extrabold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs">
              <i class="fa-brands fa-google-drive"></i> Mở Thư Mục Drive
            </a>
            <button type="button" @click="downloadProofImage(previewPhotoModal.item)"
                    class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-extrabold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer border border-slate-700">
              <i class="fa-solid fa-download"></i> Tải Về Máy
            </button>
            <button type="button" @click="previewPhotoModal.show = false"
                    class="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs cursor-pointer">
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { downloadBase64File } from '../../utils/fileExport.js';

const props = defineProps({
  show: Boolean,
  activity: Object,
  stats: Object,
  members: Array,
  formatDate: Function
});

const emit = defineEmits(['close', 'admin-checkin', 'export-excel']);

const googleDriveFolderUrl = 'https://drive.google.com/drive/folders/1zbUHwDzxXVfYK_kTIdQvVZXYJ2sVMBsd';

// Search & Member Selection State for Admin Check-in
const memberSearchQuery = ref('');
const selectedAdminMember = ref(null);
const selectedShift = ref(null);
const filterOnlyRegistered = ref(true);

const uniqueRegisteredMembersCount = computed(() => {
  if (!props.stats?.regsList) return 0;
  const set = new Set(props.stats.regsList.map(r => String(r.memberId).trim().toUpperCase()));
  return set.size;
});

const getMemberRegisteredShifts = (memberId) => {
  if (!props.stats?.regsList || !memberId) return [];
  const mId = String(memberId).trim().toUpperCase();
  return props.stats.regsList.filter(r => String(r.memberId).trim().toUpperCase() === mId);
};

const getMemberRegisteredShiftsCount = (memberId) => {
  return getMemberRegisteredShifts(memberId).length;
};

const isMemberAnyCheckedIn = (memberId) => {
  if (!props.stats?.presentList || !memberId) return false;
  const mId = String(memberId).trim().toUpperCase();
  return props.stats.presentList.some(p => String(p.memberId).trim().toUpperCase() === mId);
};

const candidateMembers = computed(() => {
  let pool = props.members || [];
  if (filterOnlyRegistered.value) {
    const regIds = new Set((props.stats?.regsList || []).map(r => String(r.memberId).trim().toUpperCase()));
    pool = pool.filter(m => regIds.has(String(m.id).trim().toUpperCase()));
  }

  const q = memberSearchQuery.value.trim().toLowerCase();
  if (!q) {
    return pool.slice(0, 15);
  }

  return pool.filter(m => {
    const name = (m.name || '').toLowerCase();
    const id = String(m.id || '').toLowerCase();
    const dept = (m.department || '').toLowerCase();
    return name.includes(q) || id.includes(q) || dept.includes(q);
  }).slice(0, 20);
});

const selectAdminMember = (m) => {
  selectedAdminMember.value = m;
  const shifts = getMemberRegisteredShifts(m.id);
  if (shifts.length > 0) {
    selectedShift.value = shifts[0];
  } else {
    selectedShift.value = null;
  }
};

const memberRegisteredShifts = computed(() => {
  if (!selectedAdminMember.value) return [];
  return getMemberRegisteredShifts(selectedAdminMember.value.id);
});

const handleAdminCheckIn = () => {
  if (!selectedAdminMember.value || !props.activity) return;
  emit('admin-checkin', {
    activityId: props.activity.id,
    memberId: selectedAdminMember.value.id,
    shiftInfo: selectedShift.value ? {
      shiftType: selectedShift.value.shiftType,
      date: selectedShift.value.date
    } : null
  });
  selectedAdminMember.value = null;
  selectedShift.value = null;
  memberSearchQuery.value = '';
};

const quickCheckInShift = (item) => {
  if (!item || !props.activity) return;
  emit('admin-checkin', {
    activityId: props.activity.id,
    memberId: item.memberId,
    shiftInfo: {
      shiftType: item.shiftType,
      date: item.date
    }
  });
};

const isShiftCheckedIn = (item) => {
  if (!props.stats?.presentList || !item) return false;
  const mId = String(item.memberId).trim().toUpperCase();
  return props.stats.presentList.some(p => {
    const isSameMember = String(p.memberId).trim().toUpperCase() === mId;
    if (!isSameMember) return false;
    if (p.shiftType && item.shiftType) {
      return p.shiftType === item.shiftType;
    }
    return true;
  });
};

watch(() => props.show, (newVal) => {
  if (!newVal) {
    selectedAdminMember.value = null;
    selectedShift.value = null;
    memberSearchQuery.value = '';
  }
});

const previewPhotoModal = ref({
  show: false,
  item: null
});

const getFolderDateStr = (dateStr) => {
  let datePrefix = '';
  const dStr = dateStr || props.activity?.date;
  if (dStr && dStr.includes('-')) {
    const parts = dStr.split('-');
    datePrefix = `${parts[2]}_${parts[1]}_${parts[0]}`;
  } else {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    datePrefix = `${dd}_${mm}_${yyyy}`;
  }
  const actName = props.activity?.name ? ` _ ${props.activity.name}` : '';
  return `${datePrefix}${actName}`;
};

const getOnlyDateStr = (dateStr) => {
  const dStr = dateStr || props.activity?.date;
  if (dStr && dStr.includes('-')) {
    const parts = dStr.split('-');
    return `${parts[2]}_${parts[1]}_${parts[0]}`;
  }
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}_${mm}_${yyyy}`;
};

const getFormattedFileName = (item) => {
  if (!item) return 'photo.jpg';
  const name = item.memberName || 'Thành viên';
  const mssv = item.memberId || 'MSSV';
  const dateStr = getOnlyDateStr(props.activity?.date);
  return `${name} - ${mssv} - ${dateStr}.jpg`;
};

const openPhotoPreview = (item) => {
  if (!item || !item.proofImage) return;
  previewPhotoModal.value = {
    show: true,
    item
  };
};

const downloadProofImage = async (item) => {
  if (!item || !item.proofImage) return;
  const fileName = getFormattedFileName(item);
  await downloadBase64File(item.proofImage, fileName);
};

const formatTime = (ts) => {
  if (!ts) return '';
  return new Date(ts).toLocaleString('vi-VN');
};
</script>
