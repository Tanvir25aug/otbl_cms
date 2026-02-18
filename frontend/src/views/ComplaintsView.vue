<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4 md:p-6 lg:p-8">
    <!-- Enhanced Header with Gradient -->
    <div class="mb-8 animate-fadeIn">
      <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Complaints Management
          </h1>
          <p class="text-gray-600 text-sm md:text-base">Manage and track customer complaints efficiently</p>
        </div>
        <div class="flex items-center gap-3">
          <router-link
            to="/complaints/reports"
            class="group relative px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 overflow-hidden"
          >
            <span class="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
            <svg class="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span class="relative z-10">Reports</span>
          </router-link>
          <button
            @click="openCreateModal"
            class="group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 overflow-hidden"
          >
            <span class="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
            <svg class="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span class="relative z-10">New Complaint</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Enhanced Filters Card -->
    <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 mb-8 border border-white/20 animate-slideUp">
      <div class="flex items-center gap-2 mb-4">
        <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <h2 class="text-lg font-semibold text-gray-800">Filters</h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="relative">
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
              placeholder="Search complaints..."
              class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select
            v-model="filters.category"
            @change="currentPage = 1; fetchComplaints()"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
          >
            <option value="">All Categories</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            v-model="filters.status"
            @change="currentPage = 1; fetchComplaints()"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
          >
            <option value="">All Status</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Close">Close</option>
          </select>
        </div>
        <div class="flex items-end">
          <button
            @click="clearFilters"
            class="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium text-gray-700 flex items-center justify-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Enhanced Stats Cards with Glassmorphism -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="group relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1 animate-scaleIn">
        <div class="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        <div class="relative p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 text-sm font-medium mb-1">Total Complaints</p>
              <p class="text-4xl font-bold text-white">{{ totalComplaints }}</p>
            </div>
            <div class="bg-white/20 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div class="mt-4 flex items-center text-blue-100 text-xs">
            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" />
            </svg>
            All time records
          </div>
        </div>
      </div>

      <div class="group relative bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1 animate-scaleIn">
        <div class="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        <div class="relative p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-yellow-100 text-sm font-medium mb-1">Open</p>
              <p class="text-4xl font-bold text-white">{{ statusCounts.Open || 0 }}</p>
            </div>
            <div class="bg-white/20 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div class="mt-4 flex items-center text-yellow-100 text-xs">
            <svg class="w-4 h-4 mr-1 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
            </svg>
            Pending action
          </div>
        </div>
      </div>

      <div class="group relative bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1 animate-scaleIn">
        <div class="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        <div class="relative p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-indigo-100 text-sm font-medium mb-1">In Progress</p>
              <p class="text-4xl font-bold text-white">{{ statusCounts['In Progress'] || 0 }}</p>
            </div>
            <div class="bg-white/20 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div class="mt-4 flex items-center text-indigo-100 text-xs">
            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clip-rule="evenodd" />
            </svg>
            Being resolved
          </div>
        </div>
      </div>

      <div class="group relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1 animate-scaleIn">
        <div class="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        <div class="relative p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-green-100 text-sm font-medium mb-1">Closed</p>
              <p class="text-4xl font-bold text-white">{{ statusCounts.Close || 0 }}</p>
            </div>
            <div class="bg-white/20 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div class="mt-4 flex items-center text-green-100 text-xs">
            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            Successfully resolved
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced Complaints Table -->
    <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-white/20 animate-slideUp">
      <div class="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-800">Complaints List</h2>
              <p class="text-sm text-gray-500">Showing {{ complaints.length }} of {{ totalItems }} complaint(s) — Page {{ currentPage }} of {{ totalPages }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="loading" class="p-12 text-center">
        <div class="inline-flex flex-col items-center gap-4">
          <div class="relative">
            <div class="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
            <div class="w-16 h-16 border-4 border-blue-600 rounded-full animate-spin border-t-transparent absolute top-0"></div>
          </div>
          <p class="text-gray-600 font-medium">Loading complaints...</p>
        </div>
      </div>

      <div v-else-if="complaints.length === 0" class="p-12 text-center">
        <div class="flex flex-col items-center gap-4">
          <div class="p-6 bg-gray-100 rounded-full">
            <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <div>
            <p class="text-xl font-semibold text-gray-700 mb-1">No complaints found</p>
            <p class="text-gray-500">Try adjusting your filters or create a new complaint</p>
          </div>
        </div>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ID</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Customer</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Meter No</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Category</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Agent</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Created</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="complaint in complaints" :key="complaint.id"
                class="hover:bg-blue-50/50 transition-colors duration-150 animate-fadeIn">
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-1 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-bold">
                  #{{ complaint.id }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ complaint.customerId }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">{{ complaint.meterNumber }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200">
                  {{ complaint.ComplaintCategory?.name || 'N/A' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="{
                    'bg-gradient-to-r from-yellow-400 to-orange-400 text-white': complaint.status === 'Open',
                    'bg-gradient-to-r from-blue-400 to-indigo-500 text-white': complaint.status === 'In Progress',
                    'bg-gradient-to-r from-green-400 to-emerald-500 text-white': complaint.status === 'Close'
                  }"
                  class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold shadow-sm"
                >
                  <span class="w-2 h-2 rounded-full bg-white mr-2 animate-pulse"></span>
                  {{ complaint.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xs mr-2">
                    {{ (complaint.agent?.fullName || 'U')[0] }}
                  </div>
                  <span class="text-sm text-gray-900">{{ complaint.agent?.fullName || 'Unassigned' }}</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-col">
                  <span class="text-sm text-gray-900">{{ formatDate(complaint.createdAt) }}</span>
                  <span
                    :class="{
                      'text-green-600 font-semibold': getComplaintAgeHours(complaint.createdAt) < 24,
                      'text-yellow-600 font-semibold': getComplaintAgeHours(complaint.createdAt) >= 24 && getComplaintAgeHours(complaint.createdAt) < 48,
                      'text-orange-600 font-semibold': getComplaintAgeHours(complaint.createdAt) >= 48 && getComplaintAgeHours(complaint.createdAt) < 72,
                      'text-red-600 font-bold animate-pulse': getComplaintAgeHours(complaint.createdAt) >= 72
                    }"
                    class="text-xs"
                  >
                    {{ getComplaintAgeText(complaint.createdAt) }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center gap-2">
                  <button
                    @click="openViewModal(complaint)"
                    class="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200 hover:scale-110"
                    title="View Details"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    @click="openEditModal(complaint)"
                    class="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-all duration-200 hover:scale-110"
                    title="Edit"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    v-if="canDeleteComplaints"
                    @click="confirmDelete(complaint)"
                    class="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200 hover:scale-110"
                    title="Delete"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
      <p class="text-sm text-gray-600">
        Page {{ currentPage }} of {{ totalPages }} ({{ totalItems }} total complaints)
      </p>
      <div class="flex items-center gap-1">
        <button
          @click="goToPage(1)"
          :disabled="currentPage <= 1"
          class="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          First
        </button>
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage <= 1"
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
              currentPage === pageNum
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'border-gray-300 hover:bg-gray-50'
            ]"
          >
            {{ pageNum }}
          </button>
        </template>

        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage >= totalPages"
          class="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
        <button
          @click="goToPage(totalPages)"
          :disabled="currentPage >= totalPages"
          class="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Last
        </button>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <Transition name="modal">
      <div
        v-if="showModal"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
        @click.self="closeModal"
      >
        <div class="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-scaleIn">
          <div class="sticky top-0 z-10 p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-3xl">
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-3">
                <div class="p-3 bg-white/20 rounded-xl">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 class="text-2xl font-bold text-white">
                  {{ modalMode === 'create' ? 'Create New Complaint' : 'Edit Complaint' }}
                </h2>
              </div>
              <button @click="closeModal" class="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div class="p-6 space-y-6">
            <!-- Customer ID / Meter Number Search -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Customer ID or Meter Number *</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  v-model="formData.customerId"
                  @input="handleCustomerSearch"
                  type="text"
                  placeholder="Enter Customer ID or Meter Number"
                  class="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  :disabled="modalMode === 'edit'"
                />
                <div v-if="loadingCustomer" class="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg class="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              </div>
              <p class="text-xs text-gray-500 mt-1">Search automatically as you type</p>
            </div>

            <!-- Customer Information Card (in Create Modal) -->
            <Transition name="slide-fade">
              <div v-if="customerInfo && modalMode === 'create'" class="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
                <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Customer Information
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div class="flex justify-between items-center py-2 border-b border-green-200">
                    <span class="font-semibold text-gray-600">Name:</span>
                    <span class="text-gray-900">{{ customerInfo.CustomerName }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2 border-b border-green-200">
                    <span class="font-semibold text-gray-600">Mobile:</span>
                    <span class="text-gray-900">{{ customerInfo.Mobile }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2 border-b border-green-200">
                    <span class="font-semibold text-gray-600">Meter No:</span>
                    <span class="text-gray-900 font-mono">{{ customerInfo.MeterNumber }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2 border-b border-green-200">
                    <span class="font-semibold text-gray-600">Tariff:</span>
                    <span class="text-gray-900">{{ customerInfo.Tariff }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2 border-b border-green-200">
                    <span class="font-semibold text-gray-600">Phase:</span>
                    <span class="text-gray-900">{{ customerInfo.Phase }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2 border-b border-green-200">
                    <span class="font-semibold text-gray-600">Feeder:</span>
                    <span class="text-gray-900">{{ customerInfo.FeederName }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2 border-b border-green-200">
                    <span class="font-semibold text-gray-600">Last Bill Date:</span>
                    <span class="text-gray-900">{{ formatBillDate(customerInfo.LastBillDate) }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2 border-b border-green-200">
                    <span class="font-semibold text-gray-600">Bill Status:</span>
                    <span :class="{
                      'text-green-700 font-semibold': customerInfo.BillStatus === 'Bill Start',
                      'text-red-700 font-semibold': customerInfo.BillStatus === 'Bill Stop',
                      'text-orange-700 font-semibold': customerInfo.BillStatus === 'Bill Not Generated',
                      'text-gray-900': !['Bill Start', 'Bill Stop', 'Bill Not Generated'].includes(customerInfo.BillStatus)
                    }">{{ customerInfo.BillStatus || 'N/A' }}</span>
                  </div>
                  <div class="col-span-2 pt-2">
                    <span class="font-semibold text-gray-600 block mb-1">Address:</span>
                    <span class="text-gray-900">{{ customerInfo.Address }}</span>
                  </div>
                </div>
              </div>
            </Transition>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                <select
                  v-model="formData.complaintCategoryId"
                  class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                  required
                >
                  <option value="">Select Category</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  v-model="formData.status"
                  class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Close">Close</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Issue Description</label>
              <ckeditor
                v-model="formData.issueDescription"
                :editor="editor"
                :config="editorConfig"
                class="border-2 border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent"
              />
            </div>

            <Transition name="slide-fade">
              <div v-if="error" class="p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl flex items-start gap-3">
                <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
                <span class="font-medium">{{ error }}</span>
              </div>
            </Transition>
          </div>

          <div class="sticky bottom-0 p-6 border-t border-gray-200 bg-gray-50 rounded-b-3xl flex justify-end gap-3">
            <button
              @click="closeModal"
              class="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-100 transition-all duration-200 font-semibold text-gray-700"
            >
              Cancel
            </button>
            <button
              @click="saveComplaint"
              :disabled="saving"
              class="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-semibold flex items-center gap-2"
            >
              <svg v-if="saving" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ saving ? 'Saving...' : 'Save Complaint' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Enhanced View Modal with Customer Info and Status Update -->
    <Transition name="modal">
      <div
        v-if="showViewModal"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
        @click.self="closeViewModal"
      >
        <div class="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-scaleIn">
          <div class="sticky top-0 z-10 p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-3xl">
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-3">
                <div class="p-3 bg-white/20 rounded-xl">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h2 class="text-2xl font-bold text-white">Complaint Details #{{ selectedComplaint?.id }}</h2>
              </div>
              <button @click="closeViewModal" class="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div v-if="selectedComplaint" class="p-6">
            <!-- Status Update Section -->
            <div class="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Update Status
                  </h3>
                  <p class="text-sm text-gray-600">Current status:
                    <span
                      :class="{
                        'text-yellow-700': viewFormData.status === 'Open',
                        'text-blue-700': viewFormData.status === 'In Progress',
                        'text-green-700': viewFormData.status === 'Close'
                      }"
                      class="font-semibold"
                    >{{ viewFormData.status }}</span>
                  </p>
                </div>
                <div class="flex items-center gap-3">
                  <select
                    v-model="viewFormData.status"
                    class="px-4 py-2 border-2 border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white font-medium"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Close">Close</option>
                  </select>
                  <button
                    @click="updateStatus"
                    :disabled="updatingStatus || viewFormData.status === selectedComplaint.status"
                    class="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-semibold flex items-center gap-2"
                  >
                    <svg v-if="updatingStatus" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{ updatingStatus ? 'Updating...' : 'Update' }}
                  </button>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div class="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Complaint Information
                </h3>
                <div class="space-y-3 text-sm">
                  <div class="flex justify-between items-center py-2 border-b border-blue-200">
                    <span class="font-semibold text-gray-600">ID:</span>
                    <span class="font-bold text-blue-600">#{{ selectedComplaint.id }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2 border-b border-blue-200">
                    <span class="font-semibold text-gray-600">Customer ID:</span>
                    <span class="text-gray-900">{{ selectedComplaint.customerId }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2 border-b border-blue-200">
                    <span class="font-semibold text-gray-600">Meter Number:</span>
                    <span class="text-gray-900 font-mono">{{ selectedComplaint.meterNumber }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2 border-b border-blue-200">
                    <span class="font-semibold text-gray-600">Category:</span>
                    <span class="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">{{ selectedComplaint.ComplaintCategory?.name || 'N/A' }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2 border-b border-blue-200">
                    <span class="font-semibold text-gray-600">Status:</span>
                    <span
                      :class="{
                        'bg-gradient-to-r from-yellow-400 to-orange-400': selectedComplaint.status === 'Open',
                        'bg-gradient-to-r from-blue-400 to-indigo-500': selectedComplaint.status === 'In Progress',
                        'bg-gradient-to-r from-green-400 to-emerald-500': selectedComplaint.status === 'Close'
                      }"
                      class="px-3 py-1.5 text-white rounded-full text-xs font-bold shadow-sm"
                    >
                      {{ selectedComplaint.status }}
                    </span>
                  </div>
                  <div class="flex justify-between items-center py-2 border-b border-blue-200">
                    <span class="font-semibold text-gray-600">Agent:</span>
                    <span class="text-gray-900">{{ selectedComplaint.agent?.fullName || 'Unassigned' }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2 border-b border-blue-200">
                    <span class="font-semibold text-gray-600">Created:</span>
                    <span class="text-gray-900">{{ formatDate(selectedComplaint.createdAt) }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2">
                    <span class="font-semibold text-gray-600">Updated:</span>
                    <span class="text-gray-900">{{ formatDate(selectedComplaint.updatedAt) }}</span>
                  </div>
                </div>
              </div>

              <div v-if="selectedComplaint.customerInfo" class="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Customer Information
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div class="flex justify-between items-center py-2 border-b border-green-200">
                    <span class="font-semibold text-gray-600">Name:</span>
                    <span class="text-gray-900">{{ selectedComplaint.customerInfo.CustomerName }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2 border-b border-green-200">
                    <span class="font-semibold text-gray-600">Mobile:</span>
                    <span class="text-gray-900">{{ selectedComplaint.customerInfo.Mobile }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2 border-b border-green-200">
                    <span class="font-semibold text-gray-600">Tariff:</span>
                    <span class="text-gray-900">{{ selectedComplaint.customerInfo.Tariff }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2 border-b border-green-200">
                    <span class="font-semibold text-gray-600">Phase:</span>
                    <span class="text-gray-900">{{ selectedComplaint.customerInfo.Phase }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2 border-b border-green-200">
                    <span class="font-semibold text-gray-600">Feeder:</span>
                    <span class="text-gray-900">{{ selectedComplaint.customerInfo.FeederName }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2 border-b border-green-200">
                    <span class="font-semibold text-gray-600">Last Bill Date:</span>
                    <span class="text-gray-900">{{ formatBillDate(selectedComplaint.customerInfo.LastBillDate) }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2 border-b border-green-200">
                    <span class="font-semibold text-gray-600">Bill Status:</span>
                    <span
                      :class="{
                        'px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700': selectedComplaint.customerInfo.BillStatus === 'Bill Start',
                        'px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700': selectedComplaint.customerInfo.BillStatus === 'Bill Stop',
                        'px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700': selectedComplaint.customerInfo.BillStatus === 'Bill Not Generated',
                        'text-gray-900': !['Bill Start', 'Bill Stop', 'Bill Not Generated'].includes(selectedComplaint.customerInfo.BillStatus)
                      }"
                    >
                      {{ selectedComplaint.customerInfo.BillStatus || 'N/A' }}
                    </span>
                  </div>
                  <div class="col-span-2 pt-2">
                    <span class="font-semibold text-gray-600 block mb-1">Address:</span>
                    <span class="text-gray-900">{{ selectedComplaint.customerInfo.Address }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200 mb-6">
              <h3 class="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Issue Description
              </h3>
              <div class="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none" v-html="selectedComplaint.issueDescription"></div>
            </div>

            <!-- Bill Stop Analysis Section -->
            <div v-if="selectedComplaint.ComplaintCategory?.name === 'Bill Stop' &&
                      selectedComplaint.customerInfo?.BillStatus &&
                      (selectedComplaint.customerInfo.BillStatus === 'Bill Stop' || selectedComplaint.customerInfo.BillStatus === 'Bill Not Generated')"
                 class="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-300">
              <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Bill Stop Analysis Report
                <span v-if="loadingAnalysis" class="ml-2">
                  <svg class="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              </h3>

              <div v-if="loadingAnalysis" class="text-center py-8">
                <div class="inline-flex flex-col items-center gap-3">
                  <svg class="animate-spin h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p class="text-blue-700 font-medium">Analyzing bill stop issue...</p>
                </div>
              </div>

              <div v-else-if="analysisReport && !analysisReport.error" class="space-y-4">
                <!-- Analysis Status -->
                <div v-if="analysisReport.status" class="p-4 bg-white rounded-xl border border-blue-200">
                  <div class="flex items-center justify-between mb-2">
                    <h4 class="font-semibold text-blue-900">Analysis Status</h4>
                    <span class="px-3 py-1 rounded-full text-xs font-bold"
                          :class="{
                            'bg-green-100 text-green-700': analysisReport.status === 'BILL_START',
                            'bg-red-100 text-red-700': analysisReport.status === 'ANALYZED' || analysisReport.status === 'BILL_STOP',
                            'bg-yellow-100 text-yellow-700': analysisReport.status === 'ERROR'
                          }">
                      {{ analysisReport.status }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-600">{{ analysisReport.reason || 'Bill Stop detected' }}</p>
                </div>

                <!-- Bill Stop Issues -->
                <div v-if="analysisReport.billStopIssues && analysisReport.billStopIssues.length > 0" class="p-4 bg-white rounded-xl border border-red-200">
                  <h4 class="font-semibold text-red-900 mb-3 flex items-center gap-2">
                    <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Bill Stop Issues ({{ analysisReport.billStopIssues.length }})
                  </h4>
                  <div v-for="(issue, idx) in analysisReport.billStopIssues" :key="idx" class="mb-3 last:mb-0">
                    <div class="font-semibold text-gray-800 mb-1">{{ issue.meterType }} ({{ issue.meterNo }})</div>
                    <div class="text-sm text-red-700 mb-2">Missing Readings: {{ issue.missingReadings }}</div>
                    <div v-for="(detail, detailIdx) in issue.issues" :key="detailIdx" class="ml-4 mb-2 p-2 bg-red-50 rounded">
                      <div class="flex items-center gap-2 mb-1">
                        <span class="px-2 py-0.5 rounded text-xs font-bold"
                              :class="{
                                'bg-red-200 text-red-800': detail.severity === 'CRITICAL',
                                'bg-orange-200 text-orange-800': detail.severity === 'WARNING',
                                'bg-blue-200 text-blue-800': detail.severity === 'INFO'
                              }">
                          {{ detail.severity }}
                        </span>
                        <span class="text-xs font-semibold">{{ detail.type }}</span>
                      </div>
                      <p class="text-sm text-gray-700">{{ detail.description }}</p>
                      <p v-if="detail.date" class="text-xs text-gray-500 mt-1">Date: {{ formatBillDate(detail.date) }}</p>
                    </div>
                  </div>
                </div>

                <!-- Old Meter Analysis -->
                <div v-if="analysisReport.oldMeterAnalysis" class="p-4 bg-white rounded-xl border border-blue-200">
                  <h4 class="font-semibold text-blue-900 mb-3">Old Meter: {{ analysisReport.oldMeterAnalysis.meterNo }}</h4>
                  <div v-if="analysisReport.oldMeterAnalysis.monthlyReadings && analysisReport.oldMeterAnalysis.monthlyReadings.length > 0">
                    <table class="min-w-full text-sm">
                      <thead class="bg-blue-50">
                        <tr>
                          <th class="px-3 py-2 text-left">Month</th>
                          <th class="px-3 py-2 text-left">MDM Reads</th>
                          <th class="px-3 py-2 text-left">HES Reads</th>
                          <th class="px-3 py-2 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-200">
                        <tr v-for="(reading, idx) in analysisReport.oldMeterAnalysis.monthlyReadings" :key="idx">
                          <td class="px-3 py-2">{{ reading.month }}</td>
                          <td class="px-3 py-2">{{ reading.mdmCount }}</td>
                          <td class="px-3 py-2">{{ reading.hesCount }}</td>
                          <td class="px-3 py-2">
                            <span class="px-2 py-1 rounded text-xs font-semibold"
                                  :class="{
                                    'bg-green-100 text-green-700': reading.status === 'OK',
                                    'bg-red-100 text-red-700': reading.status === 'MISSING',
                                    'bg-yellow-100 text-yellow-700': reading.status === 'PARTIAL'
                                  }">
                              {{ reading.status }}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- New Meter Analysis -->
                <div v-if="analysisReport.newMeterAnalysis" class="p-4 bg-white rounded-xl border border-blue-200">
                  <h4 class="font-semibold text-blue-900 mb-3">New Meter: {{ analysisReport.newMeterAnalysis.meterNo }}</h4>
                  <div v-if="analysisReport.newMeterAnalysis.monthlyReadings && analysisReport.newMeterAnalysis.monthlyReadings.length > 0">
                    <table class="min-w-full text-sm">
                      <thead class="bg-blue-50">
                        <tr>
                          <th class="px-3 py-2 text-left">Month</th>
                          <th class="px-3 py-2 text-left">MDM Reads</th>
                          <th class="px-3 py-2 text-left">HES Reads</th>
                          <th class="px-3 py-2 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-200">
                        <tr v-for="(reading, idx) in analysisReport.newMeterAnalysis.monthlyReadings" :key="idx">
                          <td class="px-3 py-2">{{ reading.month }}</td>
                          <td class="px-3 py-2">{{ reading.mdmCount }}</td>
                          <td class="px-3 py-2">{{ reading.hesCount }}</td>
                          <td class="px-3 py-2">
                            <span class="px-2 py-1 rounded text-xs font-semibold"
                                  :class="{
                                    'bg-green-100 text-green-700': reading.status === 'OK',
                                    'bg-red-100 text-red-700': reading.status === 'MISSING',
                                    'bg-yellow-100 text-yellow-700': reading.status === 'PARTIAL'
                                  }">
                              {{ reading.status }}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div v-else-if="analysisReport && analysisReport.error" class="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p class="text-sm text-red-700">{{ analysisReport.error }}</p>
              </div>
            </div>

            <!-- Billing Profile Data Section -->
            <div v-if="selectedComplaint.ComplaintCategory?.name === 'Bill Stop' &&
                      selectedComplaint.customerInfo?.BillStatus &&
                      (selectedComplaint.customerInfo.BillStatus === 'Bill Stop' || selectedComplaint.customerInfo.BillStatus === 'Bill Not Generated')"
                 class="mt-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-300">
              <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Billing Profile - All Meter Readings
                <span v-if="loadingBillingProfile" class="ml-2">
                  <svg class="animate-spin h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              </h3>

              <div v-if="loadingBillingProfile" class="text-center py-8">
                <div class="inline-flex flex-col items-center gap-3">
                  <svg class="animate-spin h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p class="text-green-700 font-medium">Loading billing profile...</p>
                </div>
              </div>

              <div v-else-if="billingProfileData && !billingProfileData.error" class="space-y-4">
                <!-- Covered & Missing Months Summary -->
                <div v-if="coveredMonthsData" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="p-4 bg-white rounded-xl border border-green-200">
                    <h4 class="font-semibold text-green-900 mb-2 flex items-center gap-2">
                      <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Covered Months ({{ coveredMonthsData.coveredMonths?.length || 0 }})
                    </h4>
                    <div v-if="coveredMonthsData.coveredMonths && coveredMonthsData.coveredMonths.length > 0" class="flex flex-wrap gap-2">
                      <span v-for="(month, idx) in coveredMonthsData.coveredMonths" :key="idx"
                            class="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                        {{ month }}
                      </span>
                    </div>
                    <p v-else class="text-sm text-gray-500">No covered months</p>
                  </div>

                  <div class="p-4 bg-white rounded-xl border border-red-200">
                    <h4 class="font-semibold text-red-900 mb-2 flex items-center gap-2">
                      <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Missing Months ({{ coveredMonthsData.missingMonths?.length || 0 }})
                    </h4>
                    <div v-if="coveredMonthsData.missingMonths && coveredMonthsData.missingMonths.length > 0" class="flex flex-wrap gap-2">
                      <span v-for="(month, idx) in coveredMonthsData.missingMonths" :key="idx"
                            class="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                        {{ month }}
                      </span>
                    </div>
                    <p v-else class="text-sm text-gray-500">No missing months</p>
                  </div>
                </div>

                <!-- All Meter Readings Table -->
                <div v-if="billingProfileData.readings && billingProfileData.readings.length > 0" class="p-4 bg-white rounded-xl border border-green-200">
                  <h4 class="font-semibold text-green-900 mb-3">All Readings ({{ billingProfileData.readings.length }})</h4>
                  <div class="overflow-x-auto max-h-96 overflow-y-auto">
                    <table class="min-w-full text-sm">
                      <thead class="bg-green-50 sticky top-0">
                        <tr>
                          <th class="px-3 py-2 text-left">Reading Date</th>
                          <th class="px-3 py-2 text-left">Value (kWh)</th>
                          <th class="px-3 py-2 text-left">Month</th>
                          <th class="px-3 py-2 text-left">Type</th>
                          <th class="px-3 py-2 text-left">Method</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-200">
                        <tr v-for="(reading, idx) in billingProfileData.readings" :key="idx"
                            :class="[
                              'hover:bg-green-50',
                              reading.is_estimated ? 'bg-blue-50' : ''
                            ]">
                          <td class="px-3 py-2">{{ formatReadingDate(reading.reading_date) }}</td>
                          <td class="px-3 py-2 font-semibold">{{ reading.value_kwh || 'N/A' }}</td>
                          <td class="px-3 py-2">{{ formatMonthLabel(reading.reading_date) }}</td>
                          <td class="px-3 py-2">
                            <span v-if="reading.is_estimated" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                              📊 Estimated
                            </span>
                            <span v-else class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                              ✅ Actual
                            </span>
                          </td>
                          <td class="px-3 py-2 text-gray-600">
                            <span v-if="reading.estimation_method">{{ reading.estimation_method }}</span>
                            <span v-else>-</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <p v-else class="text-sm text-gray-600 p-4 bg-white rounded-xl border border-green-200">
                  No billing profile data available for this meter.
                </p>
              </div>

              <div v-else-if="billingProfileData && billingProfileData.error" class="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p class="text-sm text-red-700">{{ billingProfileData.error }}</p>
              </div>
            </div>

            <!-- Meter Replacement History Section -->
            <div v-if="selectedComplaint.ComplaintCategory?.name === 'Bill Stop' &&
                      selectedComplaint.customerInfo?.BillStatus &&
                      (selectedComplaint.customerInfo.BillStatus === 'Bill Stop' || selectedComplaint.customerInfo.BillStatus === 'Bill Not Generated')"
                 class="mt-6 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-300">
              <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Meter Replacement History
                <span v-if="loadingReplacementHistory" class="ml-2">
                  <svg class="animate-spin h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              </h3>

              <div v-if="loadingReplacementHistory" class="text-center py-8">
                <div class="inline-flex flex-col items-center gap-3">
                  <svg class="animate-spin h-10 w-10 text-purple-600" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p class="text-purple-700 font-medium">Loading replacement history...</p>
                </div>
              </div>

              <div v-else-if="replacementHistory && !replacementHistory.error">
                <div v-if="replacementHistory.replacements && replacementHistory.replacements.length > 0" class="space-y-3">
                  <div v-for="(replacement, idx) in replacementHistory.replacements" :key="idx"
                       class="p-4 bg-white rounded-xl border border-purple-200">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p class="text-xs text-gray-500 mb-1">Old Meter</p>
                        <p class="font-semibold text-gray-800 font-mono">{{ replacement.oldMeterNumber }}</p>
                      </div>
                      <div>
                        <p class="text-xs text-gray-500 mb-1">New Meter</p>
                        <p class="font-semibold text-gray-800 font-mono">{{ replacement.newMeterNumber }}</p>
                      </div>
                      <div>
                        <p class="text-xs text-gray-500 mb-1">Replacement Date</p>
                        <p class="font-semibold text-gray-800">{{ formatBillDate(replacement.replaceDate) }}</p>
                      </div>
                    </div>
                    <div v-if="replacement.reason" class="mt-3 pt-3 border-t border-purple-100">
                      <p class="text-xs text-gray-500 mb-1">Reason</p>
                      <p class="text-sm text-gray-700">{{ replacement.reason }}</p>
                    </div>
                  </div>
                </div>

                <div v-else class="p-4 bg-white rounded-xl border border-purple-200">
                  <div class="flex items-center gap-2 text-gray-600">
                    <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="text-sm font-medium">No meter replacement history found for this customer.</span>
                  </div>
                </div>
              </div>

              <div v-else-if="replacementHistory && replacementHistory.error" class="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p class="text-sm text-red-700">{{ replacementHistory.error }}</p>
              </div>
            </div>
          </div>

          <div class="sticky bottom-0 p-6 border-t border-gray-200 bg-gray-50 rounded-b-3xl flex justify-end">
            <button
              @click="closeViewModal"
              class="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Enhanced Delete Confirmation Modal -->
    <Transition name="modal">
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
        @click.self="closeDeleteModal"
      >
        <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full transform transition-all duration-300 animate-scaleIn">
          <div class="p-6">
            <div class="flex items-center mb-6">
              <div class="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mr-4 shadow-lg">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900">Delete Complaint</h3>
                <p class="text-sm text-gray-600 mt-1">Are you sure you want to delete this complaint?</p>
              </div>
            </div>
            <div class="p-4 bg-red-50 border-2 border-red-200 rounded-xl mb-6">
              <p class="text-sm text-red-800 font-medium flex items-center gap-2">
                <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                This action cannot be undone
              </p>
            </div>
            <div class="flex justify-end gap-3">
              <button
                @click="closeDeleteModal"
                class="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-100 transition-all duration-200 font-semibold text-gray-700"
              >
                Cancel
              </button>
              <button
                @click="deleteComplaintConfirmed"
                :disabled="deleting"
                class="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-semibold flex items-center gap-2"
              >
                <svg v-if="deleting" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ deleting ? 'Deleting...' : 'Delete' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { useAuthStore } from '../stores/auth';
import {
  getComplaints,
  getComplaintCategories,
  createComplaint,
  updateComplaint,
  deleteComplaint,
  getCustomerInfo,
  getBillStopAnalysis,
  getMeterReadingsByMeterNo,
  getCoveredMonths,
  getMeterReplacementHistory
} from '../api';

interface ComplaintCategory {
  id: number;
  name: string;
}

interface Agent {
  id: number;
  fullName: string;
  email: string;
}

interface CustomerInfo {
  NOCS: string;
  CustomerID: string;
  MeterNumber: string;
  ConnectionDate: string;
  CustomerName: string;
  Address: string;
  Mobile: string;
  Tariff: string;
  LastBillDate: string | null;
  BillStatus: string;
  Phase: string;
  SanctionLoad: string;
  FeederNo: string;
  FeederName: string;
}

interface Complaint {
  id: number;
  customerId: string;
  meterNumber: string;
  issueDescription: string;
  status: 'Open' | 'In Progress' | 'Close';
  customerInfo?: CustomerInfo;
  agent?: Agent;
  ComplaintCategory?: ComplaintCategory;
  complaintCategoryId?: number;
  createdAt: string;
  updatedAt: string;
}

// Auth store
const auth = useAuthStore();

const complaints = ref<Complaint[]>([]);
const categories = ref<ComplaintCategory[]>([]);
const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const loadingCustomer = ref(false);
const updatingStatus = ref(false);
const loadingAnalysis = ref(false);
const loadingBillingProfile = ref(false);
const loadingReplacementHistory = ref(false);
const error = ref('');
const analysisReport = ref<any>(null);
const billingProfileData = ref<any>(null);
const coveredMonthsData = ref<any>(null);
const replacementHistory = ref<any>(null);

const showModal = ref(false);
const showViewModal = ref(false);
const showDeleteModal = ref(false);
const modalMode = ref<'create' | 'edit'>('create');
const selectedComplaint = ref<Complaint | null>(null);
const customerInfo = ref<CustomerInfo | null>(null);

// Check if user can delete complaints (Admin, Super Admin, Manager only)
const canDeleteComplaints = computed(() => {
  const role = auth.user?.role;
  return role === 'Admin' || role === 'Super Admin' || role === 'Manager';
});

const editor = ClassicEditor as any;
const editorConfig = {
  toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'outdent', 'indent', '|', 'blockQuote', 'insertTable', 'undo', 'redo']
};

const currentPage = ref(1);
const totalItems = ref(0);
const itemsPerPage = 50;
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage));

const filters = ref({
  search: '',
  category: '',
  status: ''
});

const formData = ref({
  customerId: '',
  complaintCategoryId: null as number | null,
  issueDescription: '',
  status: 'Open' as 'Open' | 'In Progress' | 'Close'
});

const viewFormData = ref({
  status: 'Open' as 'Open' | 'In Progress' | 'Close'
});

const globalStatusCounts = ref<Record<string, number>>({ total: 0, Open: 0, 'In Progress': 0, Close: 0 });
const totalComplaints = computed(() => globalStatusCounts.value.total);
const statusCounts = computed(() => globalStatusCounts.value);

let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

const debouncedFetch = () => {
  if (debounceTimeout) {
    clearTimeout(debounceTimeout);
  }
  debounceTimeout = setTimeout(() => {
    currentPage.value = 1;
    fetchComplaints();
  }, 500);
};

const fetchComplaints = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: currentPage.value,
      limit: itemsPerPage
    };
    if (filters.value.search) params.search = filters.value.search;
    if (filters.value.category) params.category = filters.value.category;
    if (filters.value.status) params.status = filters.value.status;

    // If no status filter is applied, exclude closed complaints by default
    if (!filters.value.status) {
      params.excludeClose = true;
    }

    const response = await getComplaints(params);
    complaints.value = response.data.rows || [];
    totalItems.value = response.data.pagination?.total ?? response.data.count ?? 0;
    if (response.data.statusCounts) {
      globalStatusCounts.value = response.data.statusCounts;
    }
  } catch (err: any) {
    console.error('Error fetching complaints:', err);
    error.value = err.response?.data?.message || 'Failed to fetch complaints';
  } finally {
    loading.value = false;
  }
};

const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  fetchComplaints();
};

const visiblePages = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
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

const fetchCategories = async () => {
  try {
    const response = await getComplaintCategories();
    categories.value = response.data;
  } catch (err) {
    console.error('Error fetching categories:', err);
  }
};

let customerSearchTimeout: NodeJS.Timeout | null = null;

const handleCustomerSearch = () => {
  if (modalMode.value === 'edit') return;

  // Clear previous timeout
  if (customerSearchTimeout) {
    clearTimeout(customerSearchTimeout);
  }

  // Clear customer info if search is empty
  if (!formData.value.customerId || formData.value.customerId.trim() === '') {
    customerInfo.value = null;
    error.value = '';
    return;
  }

  // Set new timeout for debounced search
  customerSearchTimeout = setTimeout(() => {
    fetchCustomerInfo();
  }, 500);
};

const fetchCustomerInfo = async () => {
  if (!formData.value.customerId) return;

  loadingCustomer.value = true;
  error.value = '';
  try {
    const response = await getCustomerInfo(formData.value.customerId);
    customerInfo.value = response.data;
  } catch (err: any) {
    console.error('Error fetching customer info:', err);
    error.value = err.response?.data?.message || 'Customer not found';
    customerInfo.value = null;
  } finally {
    loadingCustomer.value = false;
  }
};

const openCreateModal = () => {
  modalMode.value = 'create';
  resetForm();
  showModal.value = true;
};

const openEditModal = (complaint: Complaint) => {
  modalMode.value = 'edit';
  selectedComplaint.value = complaint;
  formData.value = {
    customerId: complaint.customerId,
    complaintCategoryId: complaint.complaintCategoryId || null,
    issueDescription: complaint.issueDescription,
    status: complaint.status
  };
  customerInfo.value = complaint.customerInfo || null;
  showModal.value = true;
};

const openViewModal = async (complaint: Complaint) => {
  selectedComplaint.value = complaint;
  viewFormData.value.status = complaint.status;
  showViewModal.value = true;
  analysisReport.value = null;
  billingProfileData.value = null;
  coveredMonthsData.value = null;
  replacementHistory.value = null;

  // Load analysis for Bill Stop complaints with actual issues
  if (complaint.ComplaintCategory?.name === 'Bill Stop' &&
      complaint.customerInfo?.BillStatus &&
      (complaint.customerInfo.BillStatus === 'Bill Stop' || complaint.customerInfo.BillStatus === 'Bill Not Generated')) {
    loadAnalysis(complaint.customerId, complaint.meterNumber);
    // Also load billing profile and replacement history
    loadBillingProfile(complaint.meterNumber);
    loadReplacementHistory(complaint.meterNumber);
  }
};

const loadAnalysis = async (customerId: string, meterNumber: string) => {
  loadingAnalysis.value = true;
  try {
    const response = await getBillStopAnalysis(customerId, meterNumber);
    analysisReport.value = response.data;
  } catch (err: any) {
    console.error('Error loading analysis:', err);
    analysisReport.value = {
      error: 'Failed to load analysis report'
    };
  } finally {
    loadingAnalysis.value = false;
  }
};

const loadBillingProfile = async (meterNumber: string) => {
  loadingBillingProfile.value = true;
  try {
    const [readingsResponse, coveredMonthsResponse] = await Promise.all([
      getMeterReadingsByMeterNo(meterNumber),
      getCoveredMonths(meterNumber)
    ]);
    billingProfileData.value = readingsResponse.data;
    coveredMonthsData.value = coveredMonthsResponse.data;
  } catch (err: any) {
    console.error('Error loading billing profile:', err);
    billingProfileData.value = { error: 'Failed to load billing profile data' };
    coveredMonthsData.value = null;
  } finally {
    loadingBillingProfile.value = false;
  }
};

const loadReplacementHistory = async (meterNumber: string) => {
  loadingReplacementHistory.value = true;
  try {
    const response = await getMeterReplacementHistory(meterNumber);
    replacementHistory.value = response.data;
  } catch (err: any) {
    console.error('Error loading replacement history:', err);
    replacementHistory.value = { error: 'Failed to load replacement history' };
  } finally {
    loadingReplacementHistory.value = false;
  }
};

const closeModal = () => {
  showModal.value = false;
  resetForm();
};

const closeViewModal = () => {
  showViewModal.value = false;
  selectedComplaint.value = null;
};

const resetForm = () => {
  formData.value = {
    customerId: '',
    complaintCategoryId: null,
    issueDescription: '',
    status: 'Open'
  };
  customerInfo.value = null;
  error.value = '';
};

const saveComplaint = async () => {
  if (!formData.value.customerId || !formData.value.complaintCategoryId) {
    error.value = 'Please fill in all required fields (Customer ID and Category)';
    return;
  }

  saving.value = true;
  error.value = '';

  try {
    const data = {
      customerId: formData.value.customerId,
      complaintCategoryId: formData.value.complaintCategoryId,
      issueDescription: formData.value.issueDescription || '',
      status: formData.value.status
    };

    if (modalMode.value === 'create') {
      await createComplaint(data);
    } else if (selectedComplaint.value) {
      await updateComplaint(selectedComplaint.value.id, data);
    }

    closeModal();
    fetchComplaints();
  } catch (err: any) {
    console.error('Error saving complaint:', err);
    error.value = err.response?.data?.message || 'Failed to save complaint';
  } finally {
    saving.value = false;
  }
};

const updateStatus = async () => {
  if (!selectedComplaint.value) return;

  updatingStatus.value = true;
  try {
    await updateComplaint(selectedComplaint.value.id, {
      status: viewFormData.value.status
    });
    selectedComplaint.value.status = viewFormData.value.status;
    await fetchComplaints();
  } catch (err: any) {
    console.error('Error updating status:', err);
    error.value = err.response?.data?.message || 'Failed to update status';
  } finally {
    updatingStatus.value = false;
  }
};

const confirmDelete = (complaint: Complaint) => {
  selectedComplaint.value = complaint;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  selectedComplaint.value = null;
};

const deleteComplaintConfirmed = async () => {
  if (!selectedComplaint.value) return;

  deleting.value = true;
  try {
    await deleteComplaint(selectedComplaint.value.id);
    closeDeleteModal();
    fetchComplaints();
  } catch (err: any) {
    console.error('Error deleting complaint:', err);
    alert(err.response?.data?.message || 'Failed to delete complaint');
  } finally {
    deleting.value = false;
  }
};

const clearFilters = () => {
  filters.value = {
    search: '',
    category: '',
    status: ''
  };
  currentPage.value = 1;
  fetchComplaints();
};

const formatDate = (date: string) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format bill date from ISO format to "21-Sept-2024" format
const formatBillDate = (date: string | null) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  const day = d.getDate();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

// Format bill month from reading date to "Sept-2024" format
const formatBillMonth = (date: string | null) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();
  return `${month}-${year}`;
};

// Format reading date to locale format (matching BillingProfileView)
const formatReadingDate = (date: any) => {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString();
};

// Format month label (matching BillingProfileView)
const formatMonthLabel = (date: any) => {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleString('default', { month: 'long', year: 'numeric' });
};

// Calculate complaint age in hours
const getComplaintAgeHours = (createdAt: string) => {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now.getTime() - created.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60));
};

// Get human-readable age text with urgency
const getComplaintAgeText = (createdAt: string) => {
  const hours = getComplaintAgeHours(createdAt);

  if (hours < 1) {
    return '🟢 Just now';
  } else if (hours < 24) {
    return `🟢 ${hours}h ago`;
  } else if (hours < 48) {
    const days = Math.floor(hours / 24);
    return `🟡 ${days} day ago`;
  } else if (hours < 72) {
    const days = Math.floor(hours / 24);
    return `🟠 ${days} days ago`;
  } else {
    const days = Math.floor(hours / 24);
    return `🔴 ${days} days ago (URGENT)`;
  }
};

onMounted(() => {
  fetchComplaints();
  fetchCategories();
});
</script>

<style scoped>
/* Custom Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out;
}

.animate-slideUp {
  animation: slideUp 0.6s ease-out;
}

.animate-scaleIn {
  animation: scaleIn 0.4s ease-out;
}

/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.3s ease;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  transform: scale(0.9);
}

/* Slide Fade Transition */
.slide-fade-enter-active {
  transition: all 0.3s ease;
}

.slide-fade-leave-active {
  transition: all 0.2s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #3b82f6, #6366f1);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #2563eb, #4f46e5);
}

/* CKEditor Styling */
:deep(.ck-editor__editable) {
  min-height: 200px;
  max-height: 400px;
}

:deep(.ck-content) {
  font-size: 14px;
}
</style>
