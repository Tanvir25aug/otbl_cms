<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4 md:p-6 lg:p-8">
    <!-- Header -->
    <div class="mb-8 animate-fadeIn">
      <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
        Complaint Reports
      </h1>
      <p class="text-gray-600 text-sm md:text-base">Analytics and insights for complaint management</p>
    </div>

    <!-- Date Range Filter -->
    <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 mb-8 border border-white/20">
      <div class="flex items-center gap-2 mb-4">
        <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h2 class="text-lg font-semibold text-gray-800">Date Range</h2>
      </div>
      <div class="flex flex-wrap items-end gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input v-model="startDate" type="date" class="px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input v-model="endDate" type="date" class="px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" />
        </div>
        <button @click="fetchAnalytics" class="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
          Apply
        </button>
        <button @click="resetFilters" class="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200">
          Reset
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
      <p class="mt-4 text-gray-600">Loading analytics...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
      <p class="text-red-600">{{ error }}</p>
      <button @click="fetchAnalytics" class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Retry</button>
    </div>

    <div v-else>
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl">📋</div>
            <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Complaints</h3>
          </div>
          <p class="text-3xl font-bold text-gray-900">{{ data.totalComplaints || 0 }}</p>
        </div>

        <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-xl">📊</div>
            <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide">Daily Average</h3>
          </div>
          <p class="text-3xl font-bold text-gray-900">{{ data.dailyAverage || '0' }}</p>
        </div>

        <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-xl">🏷️</div>
            <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide">Most Common Issue</h3>
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ data.mostCommonIssue?.category || 'N/A' }}</p>
          <p class="text-sm text-gray-500 mt-1">{{ data.mostCommonIssue?.count || 0 }} complaints</p>
        </div>

        <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-xl">🏆</div>
            <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide">Top Agent</h3>
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ data.topAgent?.name || 'N/A' }}</p>
          <p class="text-sm text-gray-500 mt-1">{{ data.topAgent?.count || 0 }} handled</p>
        </div>
      </div>

      <!-- Additional Insight Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20">
          <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Resolution Rate</h3>
          <p class="text-3xl font-bold text-green-600">{{ resolutionRate }}%</p>
          <p class="text-sm text-gray-500 mt-1">{{ closedCount }} closed out of {{ data.totalComplaints || 0 }}</p>
        </div>
        <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20">
          <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Avg Complaints / Day</h3>
          <p class="text-3xl font-bold text-blue-600">{{ data.dailyAverage || '0' }}</p>
        </div>
        <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20">
          <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Busiest Month</h3>
          <p class="text-2xl font-bold text-indigo-600">{{ busiestMonth.label }}</p>
          <p class="text-sm text-gray-500 mt-1">{{ busiestMonth.count }} complaints</p>
        </div>
      </div>

      <!-- Charts Row: Status Pie + Category Bar -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Status-wise Report -->
        <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
          <h2 class="text-xl font-bold text-gray-800 mb-4">Status-wise Report</h2>
          <PieChart v-if="statusPieData && Object.keys(statusPieData).length" :data="statusPieData" :colors="statusColors" />
          <p v-else class="text-gray-500 text-center py-8">No status data available</p>
          <!-- Status Table -->
          <div v-if="data.statusWiseReport?.length" class="mt-6 overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="text-left py-2 px-3 text-gray-500 font-semibold">Status</th>
                  <th class="text-right py-2 px-3 text-gray-500 font-semibold">Count</th>
                  <th class="text-right py-2 px-3 text-gray-500 font-semibold">Percentage</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in data.statusWiseReport" :key="item.status" class="border-b border-gray-100 hover:bg-gray-50">
                  <td class="py-2 px-3 font-medium">
                    <span :class="statusBadgeClass(item.status)" class="px-2.5 py-1 rounded-full text-xs font-semibold">{{ item.status }}</span>
                  </td>
                  <td class="text-right py-2 px-3">{{ item.count }}</td>
                  <td class="text-right py-2 px-3">{{ percentage(item.count) }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Category-wise Report -->
        <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
          <h2 class="text-xl font-bold text-gray-800 mb-4">Category-wise Report</h2>
          <BarChart v-if="categoryChartData.labels.length" :chartData="categoryChartData" />
          <p v-else class="text-gray-500 text-center py-8">No category data available</p>
          <!-- Category Table -->
          <div v-if="data.categoryWiseReport?.length" class="mt-6 overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="text-left py-2 px-3 text-gray-500 font-semibold">Category</th>
                  <th class="text-right py-2 px-3 text-gray-500 font-semibold">Count</th>
                  <th class="text-right py-2 px-3 text-gray-500 font-semibold">Percentage</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in data.categoryWiseReport" :key="item.category" class="border-b border-gray-100 hover:bg-gray-50">
                  <td class="py-2 px-3 font-medium">{{ item.category }}</td>
                  <td class="text-right py-2 px-3">{{ item.count }}</td>
                  <td class="text-right py-2 px-3">{{ percentage(item.count) }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Agent Performance Report -->
      <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20 mb-8">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Agent Performance Report</h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <BarChart v-if="agentChartData.labels.length" :chartData="agentChartData" />
            <p v-else class="text-gray-500 text-center py-8">No agent data available</p>
          </div>
          <div v-if="data.agentWiseReport?.length" class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="text-left py-2 px-3 text-gray-500 font-semibold">Agent</th>
                  <th class="text-right py-2 px-3 text-gray-500 font-semibold">Complaints</th>
                  <th class="text-right py-2 px-3 text-gray-500 font-semibold">Percentage</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in data.agentWiseReport" :key="item.agentName" class="border-b border-gray-100 hover:bg-gray-50">
                  <td class="py-2 px-3 font-medium">{{ item.agentName }}</td>
                  <td class="text-right py-2 px-3">{{ item.count }}</td>
                  <td class="text-right py-2 px-3">{{ percentage(item.count) }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Monthly Trend -->
      <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20 mb-8">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Monthly Trend (Last 12 Months)</h2>
        <BarChart v-if="monthlyChartData.labels.length" :chartData="monthlyChartData" />
        <p v-else class="text-gray-500 text-center py-8">No monthly data available</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getComplaintAnalytics } from '@/api';
import PieChart from '@/components/charts/PieChart.vue';
import BarChart from '@/components/BarChart.vue';

const loading = ref(true);
const error = ref<string | null>(null);
const data = ref<any>({});
const startDate = ref('');
const endDate = ref('');

const statusColors = ['#3B82F6', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6'];

const fetchAnalytics = async () => {
  loading.value = true;
  error.value = null;
  try {
    const params: any = {};
    if (startDate.value) params.startDate = startDate.value;
    if (endDate.value) params.endDate = endDate.value;
    const res = await getComplaintAnalytics(params);
    data.value = res.data;
  } catch (err: any) {
    console.error('Error fetching complaint analytics:', err);
    error.value = err.response?.data?.message || 'Failed to load analytics data';
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  startDate.value = '';
  endDate.value = '';
  fetchAnalytics();
};

const percentage = (count: number) => {
  const total = data.value.totalComplaints || 0;
  if (!total) return '0.0';
  return ((count / total) * 100).toFixed(1);
};

const closedCount = computed(() => {
  if (!data.value.statusWiseReport) return 0;
  const closed = data.value.statusWiseReport.find((s: any) => s.status?.toLowerCase() === 'closed' || s.status?.toLowerCase() === 'resolved');
  return closed?.count || 0;
});

const resolutionRate = computed(() => {
  const total = data.value.totalComplaints || 0;
  if (!total) return '0.0';
  return ((closedCount.value / total) * 100).toFixed(1);
});

const busiestMonth = computed(() => {
  if (!data.value.monthlyComplaints?.length) return { label: 'N/A', count: 0 };
  const sorted = [...data.value.monthlyComplaints].sort((a: any, b: any) => b.count - a.count);
  const top = sorted[0];
  const date = new Date(top.month);
  const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  return { label, count: top.count };
});

// PieChart data for status (expects { label: count })
const statusPieData = computed(() => {
  if (!data.value.statusWiseReport?.length) return {};
  const obj: Record<string, number> = {};
  data.value.statusWiseReport.forEach((s: any) => {
    obj[s.status] = s.count;
  });
  return obj;
});

// BarChart data for categories
const categoryChartData = computed(() => {
  if (!data.value.categoryWiseReport?.length) return { labels: [], datasets: [] };
  return {
    labels: data.value.categoryWiseReport.map((c: any) => c.category),
    datasets: [{
      label: 'Complaints',
      data: data.value.categoryWiseReport.map((c: any) => c.count),
      backgroundColor: 'rgba(99, 102, 241, 0.7)',
      borderColor: 'rgba(99, 102, 241, 1)',
      borderWidth: 1,
    }]
  };
});

// BarChart data for agents
const agentChartData = computed(() => {
  if (!data.value.agentWiseReport?.length) return { labels: [], datasets: [] };
  return {
    labels: data.value.agentWiseReport.map((a: any) => a.agentName),
    datasets: [{
      label: 'Complaints Handled',
      data: data.value.agentWiseReport.map((a: any) => a.count),
      backgroundColor: 'rgba(139, 92, 246, 0.7)',
      borderColor: 'rgba(139, 92, 246, 1)',
      borderWidth: 1,
    }]
  };
});

// BarChart data for monthly trend
const monthlyChartData = computed(() => {
  if (!data.value.monthlyComplaints?.length) return { labels: [], datasets: [] };
  return {
    labels: data.value.monthlyComplaints.map((m: any) => {
      const date = new Date(m.month);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    }),
    datasets: [{
      label: 'Complaints',
      data: data.value.monthlyComplaints.map((m: any) => m.count),
      backgroundColor: 'rgba(59, 130, 246, 0.7)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1,
    }]
  };
});

const statusBadgeClass = (status: string) => {
  const s = status?.toLowerCase();
  if (s === 'open') return 'bg-blue-100 text-blue-700';
  if (s === 'in progress') return 'bg-amber-100 text-amber-700';
  if (s === 'closed' || s === 'resolved') return 'bg-green-100 text-green-700';
  if (s === 'rejected') return 'bg-red-100 text-red-700';
  return 'bg-gray-100 text-gray-700';
};

onMounted(fetchAnalytics);
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.5s ease-out;
}
</style>
