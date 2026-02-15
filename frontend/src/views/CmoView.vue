<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4 md:p-6 lg:p-8">
    <!-- Header -->
    <div class="mb-8 animate-fadeIn">
      <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            CMO Management
          </h1>
          <p class="text-gray-600 text-sm md:text-base">View and manage Change Meter Owner (CMO) records</p>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8" v-if="statistics">
      <div class="group relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
        <div class="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        <div class="relative p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 text-sm font-medium mb-1">Total</p>
              <p class="text-4xl font-bold text-white">{{ statistics.total }}</p>
            </div>
            <div class="bg-white/20 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div class="group relative bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
        <div class="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        <div class="relative p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-100 text-sm font-medium mb-1">Draft</p>
              <p class="text-4xl font-bold text-white">{{ statistics.draft }}</p>
            </div>
            <div class="bg-white/20 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div class="group relative bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
        <div class="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        <div class="relative p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-yellow-100 text-sm font-medium mb-1">Pending</p>
              <p class="text-4xl font-bold text-white">{{ statistics.pending }}</p>
            </div>
            <div class="bg-white/20 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div class="group relative bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
        <div class="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        <div class="relative p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-indigo-100 text-sm font-medium mb-1">Uploaded</p>
              <p class="text-4xl font-bold text-white">{{ statistics.uploaded }}</p>
            </div>
            <div class="bg-white/20 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div class="group relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
        <div class="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        <div class="relative p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-green-100 text-sm font-medium mb-1">Approved</p>
              <p class="text-4xl font-bold text-white">{{ statistics.approved }}</p>
            </div>
            <div class="bg-white/20 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 mb-8 border border-white/20">
      <div class="flex items-center gap-2 mb-4">
        <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <h2 class="text-lg font-semibold text-gray-800">Filters</h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <!-- Search -->
        <div class="relative md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              v-model="filters.search"
              @input="debouncedFetch"
              type="text"
              placeholder="Search by name, mobile, customer ID, meter ID..."
              class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        <!-- Status -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            v-model="filters.status"
            @change="fetchCMOs"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="uploaded">Uploaded</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <!-- Sort By -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
          <select
            v-model="filters.sortBy"
            @change="fetchCMOs"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
          >
            <option value="createdAt">Created Date</option>
            <option value="customerName">Customer Name</option>
            <option value="status">Status</option>
          </select>
        </div>

        <!-- Sort Order + Clear -->
        <div class="flex flex-col">
          <label class="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
          <div class="flex gap-2">
            <button
              @click="toggleSortOrder"
              class="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium text-gray-700 flex items-center justify-center gap-1"
            >
              <svg v-if="filters.sortOrder === 'DESC'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
              </svg>
              {{ filters.sortOrder }}
            </button>
            <button
              @click="clearFilters"
              class="px-3 py-2.5 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-gray-700"
              title="Clear Filters"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Bar -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div class="text-sm text-gray-600">
        <span v-if="pagination">
          Showing {{ cmos.length }} of {{ pagination.total }} records — Page {{ pagination.page }} of {{ pagination.totalPages }}
        </span>
      </div>
      <div class="flex gap-3">
        <button
          @click="exportToExcel"
          :disabled="cmos.length === 0 || exporting"
          class="group px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <svg v-if="!exporting" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14,2 14,8 20,8" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
          </svg>
          <svg v-else class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke-width="2" stroke-dasharray="31.4" stroke-dashoffset="10" />
          </svg>
          {{ exporting ? 'Exporting...' : 'Export Excel' }}
        </button>
        <button
          @click="refresh"
          :disabled="loading"
          class="px-4 py-2.5 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium text-gray-700 flex items-center gap-2 disabled:opacity-50"
        >
          <svg class="w-4 h-4" :class="{ 'animate-spin': loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-12 mb-8 border border-white/20 flex flex-col items-center justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mb-4"></div>
      <p class="text-gray-500 font-medium">Loading CMO records...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-12 mb-8 border border-red-200 flex flex-col items-center justify-center">
      <svg class="w-16 h-16 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-red-600 font-medium mb-2">Error loading CMO data</p>
      <p class="text-gray-500 text-sm mb-4">{{ error }}</p>
      <button @click="refresh" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
        Try Again
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="cmos.length === 0" class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-12 mb-8 border border-white/20 flex flex-col items-center justify-center">
      <svg class="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <p class="text-gray-500 font-medium mb-2">No CMO records found</p>
      <p class="text-gray-400 text-sm">Try adjusting your filters or search criteria</p>
    </div>

    <!-- Data Table -->
    <div v-else class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden mb-8">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer ID</th>
              <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer Name</th>
              <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Mobile</th>
              <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">New Meter ID</th>
              <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Old Meter Type</th>
              <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Old Meter No</th>
              <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Old Reading</th>
              <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">NOCS</th>
              <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Feeder</th>
              <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Bill Group</th>
              <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Synced</th>
              <th class="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created At</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-100">
            <tr v-for="cmo in cmos" :key="cmo.id" class="hover:bg-blue-50/50 transition-colors duration-150">
              <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{{ cmo.customerId || '-' }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{{ cmo.customerName || '-' }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{{ cmo.mobileNumber || '-' }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{{ cmo.newMeterId || '-' }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{{ cmo.oldMeterType || '-' }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{{ cmo.oldMeterNumber || '-' }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{{ cmo.oldMeterReading || '-' }}</td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span :class="getStatusClass(cmo.status)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize">
                  {{ cmo.status || '-' }}
                </span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{{ cmo.nocs || '-' }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{{ cmo.feeder || '-' }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{{ cmo.billGroup || '-' }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm">
                <span v-if="cmo.isSynced" class="text-green-600 font-medium">Yes</span>
                <span v-else class="text-gray-400">No</span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{{ formatDate(cmo.created_at || cmo.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination && pagination.totalPages > 1" class="flex flex-col sm:flex-row items-center justify-between gap-4">
      <p class="text-sm text-gray-600">
        Page {{ pagination.page }} of {{ pagination.totalPages }} ({{ pagination.total }} total records)
      </p>
      <div class="flex items-center gap-1">
        <button
          @click="goToPage(1)"
          :disabled="pagination.page <= 1"
          class="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          First
        </button>
        <button
          @click="goToPage(pagination.page - 1)"
          :disabled="pagination.page <= 1"
          class="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Prev
        </button>

        <template v-for="pageNum in visiblePages" :key="pageNum">
          <button
            v-if="pageNum === '...'"
            disabled
            class="px-3 py-2 text-sm text-gray-400"
          >
            ...
          </button>
          <button
            v-else
            @click="goToPage(pageNum as number)"
            :class="[
              'px-3 py-2 text-sm border rounded-lg transition-colors',
              pagination.page === pageNum
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'border-gray-300 hover:bg-gray-50'
            ]"
          >
            {{ pageNum }}
          </button>
        </template>

        <button
          @click="goToPage(pagination.page + 1)"
          :disabled="pagination.page >= pagination.totalPages"
          class="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
        <button
          @click="goToPage(pagination.totalPages)"
          :disabled="pagination.page >= pagination.totalPages"
          class="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Last
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getCMOs, getCMOStatistics } from '../api';
import * as XLSX from 'xlsx';

interface CMORecord {
  id: string;
  customerId: string;
  customerName: string;
  mobileNumber: string;
  newMeterId: string;
  oldMeterType: string;
  oldMeterNumber: string;
  oldMeterReading: string;
  status: string;
  nocs: string;
  feeder: string;
  billGroup: string;
  isSynced: boolean;
  created_at?: string;
  createdAt?: string;
}

interface Statistics {
  total: number;
  draft: number;
  pending: number;
  uploaded: number;
  approved: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const cmos = ref<CMORecord[]>([]);
const statistics = ref<Statistics | null>(null);
const pagination = ref<Pagination | null>(null);
const loading = ref(false);
const error = ref('');
const exporting = ref(false);

const filters = ref({
  search: '',
  status: '',
  sortBy: 'createdAt',
  sortOrder: 'DESC',
  page: 1,
  limit: 20
});

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const debouncedFetch = () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    filters.value.page = 1;
    fetchCMOs();
  }, 400);
};

const visiblePages = computed(() => {
  if (!pagination.value) return [];
  const total = pagination.value.totalPages;
  const current = pagination.value.page;
  const pages: (number | string)[] = [];

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
    return pages;
  }

  pages.push(1);
  if (current > 3) pages.push('...');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push('...');
  pages.push(total);

  return pages;
});

const fetchCMOs = async () => {
  loading.value = true;
  error.value = '';
  try {
    const params: Record<string, any> = {
      page: filters.value.page,
      limit: filters.value.limit,
      sortBy: filters.value.sortBy,
      sortOrder: filters.value.sortOrder
    };
    if (filters.value.search) params.search = filters.value.search;
    if (filters.value.status) params.status = filters.value.status;

    const response = await getCMOs(params);
    cmos.value = response.data.data || [];
    pagination.value = response.data.pagination || null;
  } catch (err: any) {
    error.value = err.response?.data?.message || err.message || 'Failed to fetch CMO data';
    cmos.value = [];
    pagination.value = null;
  } finally {
    loading.value = false;
  }
};

const fetchStatistics = async () => {
  try {
    const response = await getCMOStatistics();
    statistics.value = response.data.data || null;
  } catch (err) {
    console.error('Failed to fetch CMO statistics:', err);
  }
};

const goToPage = (page: number) => {
  if (!pagination.value) return;
  if (page < 1 || page > pagination.value.totalPages) return;
  filters.value.page = page;
  fetchCMOs();
};

const toggleSortOrder = () => {
  filters.value.sortOrder = filters.value.sortOrder === 'DESC' ? 'ASC' : 'DESC';
  fetchCMOs();
};

const clearFilters = () => {
  filters.value = {
    search: '',
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'DESC',
    page: 1,
    limit: 20
  };
  fetchCMOs();
};

const refresh = () => {
  fetchCMOs();
  fetchStatistics();
};

const exportToExcel = async () => {
  exporting.value = true;
  try {
    // Fetch all records for export
    const response = await getCMOs({
      page: 1,
      limit: 99999,
      status: filters.value.status || undefined,
      search: filters.value.search || undefined,
      sortBy: filters.value.sortBy,
      sortOrder: filters.value.sortOrder
    });

    const allRecords = (response.data.data || []).map((cmo: CMORecord) => ({
      'Customer ID': cmo.customerId || '',
      'Customer Name': cmo.customerName || '',
      'Mobile': cmo.mobileNumber || '',
      'New Meter ID': cmo.newMeterId || '',
      'Old Meter Type': cmo.oldMeterType || '',
      'Old Meter Number': cmo.oldMeterNumber || '',
      'Old Meter Reading': cmo.oldMeterReading || '',
      'Status': cmo.status || '',
      'NOCS': cmo.nocs || '',
      'Feeder': cmo.feeder || '',
      'Bill Group': cmo.billGroup || '',
      'Synced': cmo.isSynced ? 'Yes' : 'No',
      'Created At': formatDate(cmo.created_at || cmo.createdAt)
    }));

    const worksheet = XLSX.utils.json_to_sheet(allRecords);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'CMO Records');
    XLSX.writeFile(workbook, `cmo_records_${new Date().toISOString().slice(0, 10)}.xlsx`);
  } catch (err) {
    console.error('Error exporting to Excel:', err);
  } finally {
    exporting.value = false;
  }
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
};

const getStatusClass = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'draft': return 'bg-gray-100 text-gray-700';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'uploaded': return 'bg-indigo-100 text-indigo-700';
    case 'approved': return 'bg-green-100 text-green-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-600';
  }
};

onMounted(() => {
  fetchCMOs();
  fetchStatistics();
});
</script>
