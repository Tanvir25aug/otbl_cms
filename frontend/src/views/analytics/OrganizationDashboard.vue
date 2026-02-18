<template>
  <div class="organization-dashboard">
    <div class="dashboard-header">
      <h1>Analytics Dashboard</h1>
      <p class="subtitle">Organization-wide metrics and insights</p>
    </div>

    <div v-if="loading" class="loading">
      <p>Loading analytics data...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
    </div>

    <div v-else class="dashboard-content">
      <!-- Overview Cards -->
      <div class="metrics-grid">
        <MetricCard
          title="Active Projects"
          :value="analytics.overview?.projects.active || 0"
          :subtitle="`${analytics.overview?.projects.total || 0} total projects`"
          icon="📊"
          variant="primary"
        />

        <MetricCard
          title="Open Tickets"
          :value="analytics.overview?.tickets.open || 0"
          :subtitle="`${analytics.overview?.tickets.total || 0} total tickets`"
          icon="🎫"
          variant="warning"
        />

        <MetricCard
          title="Overdue"
          :value="analytics.overview?.tickets.overdue || 0"
          subtitle="Needs attention"
          icon="⚠️"
          variant="danger"
        />

        <MetricCard
          title="Completed"
          :value="analytics.overview?.tickets.completed || 0"
          subtitle="This month"
          icon="✅"
          variant="success"
        />
      </div>

      <!-- Charts Grid -->
      <div class="charts-section">
        <div class="chart-card">
          <h2>Tickets by Priority</h2>
          <PieChart
            v-if="hasPriorityData"
            :data="analytics.breakdown?.byPriority"
            :colors="['#F44336', '#FF9800', '#FFC107', '#4CAF50', '#2196F3']"
          />
          <p v-else class="no-data">No priority data available</p>
        </div>

        <div class="chart-card">
          <h2>Tickets by Status</h2>
          <BarChart
            v-if="hasStatusData"
            :chartData="statusChartData"
          />
          <p v-else class="no-data">No status data available</p>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="activity-section">
        <div class="section-card">
          <h2>Recent Activity (7 Days)</h2>
          <div class="activity-stats">
            <div class="activity-item">
              <span class="activity-label">Tickets Created</span>
              <span class="activity-value success">+{{ analytics.recentActivity?.ticketsCreated7Days || 0 }}</span>
            </div>
            <div class="activity-item">
              <span class="activity-label">Tickets Closed</span>
              <span class="activity-value primary">{{ analytics.recentActivity?.ticketsClosed7Days || 0 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Complaints Summary -->
      <div class="complaints-section" v-if="complaintData">
        <div class="section-card">
          <h2>Complaints Summary</h2>
          <div class="metrics-grid" style="margin-bottom: 1.5rem;">
            <MetricCard
              title="Total Complaints"
              :value="complaintData.totalComplaints || 0"
              icon="📋"
              variant="primary"
            />
            <MetricCard
              title="Open"
              :value="complaintStatusCount('Open')"
              icon="🔵"
              variant="info"
            />
            <MetricCard
              title="In Progress"
              :value="complaintStatusCount('In Progress')"
              icon="🟡"
              variant="warning"
            />
            <MetricCard
              title="Closed"
              :value="complaintStatusCount('Close')"
              subtitle="Resolved complaints"
              icon="✅"
              variant="success"
            />
          </div>
          <h3 style="font-size: 1rem; font-weight: 600; margin-bottom: 1rem; color: var(--text-primary);">Category Distribution</h3>
          <BarChart
            v-if="complaintCategoryChartData.labels.length"
            :chartData="complaintCategoryChartData"
          />
          <p v-else class="no-data">No complaint category data available</p>
        </div>
      </div>

      <!-- Top Projects -->
      <div class="projects-section">
        <div class="section-card">
          <h2>Top Projects by Ticket Count</h2>
          <div class="projects-table" v-if="analytics.topProjects && analytics.topProjects.length > 0">
            <table>
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Key</th>
                  <th>Tickets</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in analytics.topProjects" :key="item.project.id">
                  <td>
                    <strong>{{ item.project.name }}</strong>
                  </td>
                  <td>
                    <code>{{ item.project.key }}</code>
                  </td>
                  <td>
                    <span class="badge">{{ item.ticketCount }}</span>
                  </td>
                  <td>
                    <span :class="['status-badge', item.project.status.toLowerCase()]">
                      {{ item.project.status }}
                    </span>
                  </td>
                  <td>
                    <router-link :to="`/analytics/project/${item.project.id}`" class="btn-link">
                      View Analytics →
                    </router-link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="no-data">No projects available</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import apiClient, { getComplaintAnalytics } from '@/api';
import MetricCard from '@/components/analytics/MetricCard.vue';
import PieChart from '@/components/charts/PieChart.vue';
import BarChart from '@/components/BarChart.vue';

const router = useRouter();
const analytics = ref({});
const loading = ref(true);
const error = ref(null);
const complaintData = ref(null);

const hasPriorityData = computed(() => {
  return analytics.value.breakdown?.byPriority &&
    Object.keys(analytics.value.breakdown.byPriority).length > 0;
});

const hasStatusData = computed(() => {
  return analytics.value.breakdown?.byStatus &&
    Object.keys(analytics.value.breakdown.byStatus).length > 0;
});

const statusChartData = computed(() => {
  if (!hasStatusData.value) return { labels: [], datasets: [] };

  const statusData = analytics.value.breakdown.byStatus;
  return {
    labels: Object.keys(statusData),
    datasets: [{
      label: 'Tickets',
      data: Object.values(statusData),
      backgroundColor: [
        'rgba(102, 126, 234, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(139, 92, 246, 0.8)',
      ],
    }]
  };
});

const complaintStatusCount = (status) => {
  if (!complaintData.value?.statusWiseReport) return 0;
  const found = complaintData.value.statusWiseReport.find(s => s.status === status);
  return found?.count || 0;
};

const complaintCategoryChartData = computed(() => {
  if (!complaintData.value?.categoryWiseReport?.length) return { labels: [], datasets: [] };
  return {
    labels: complaintData.value.categoryWiseReport.map(c => c.category),
    datasets: [{
      label: 'Complaints',
      data: complaintData.value.categoryWiseReport.map(c => c.count),
      backgroundColor: [
        'rgba(99, 102, 241, 0.7)',
        'rgba(245, 158, 11, 0.7)',
        'rgba(16, 185, 129, 0.7)',
        'rgba(239, 68, 68, 0.7)',
        'rgba(139, 92, 246, 0.7)',
        'rgba(59, 130, 246, 0.7)',
      ],
    }]
  };
});

const fetchDashboard = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await apiClient.get('/analytics/dashboard');
    analytics.value = response.data;
  } catch (err) {
    console.error('Error fetching dashboard:', err);
    error.value = err.response?.data?.message || 'Failed to load dashboard data';
  } finally {
    loading.value = false;
  }
};

const fetchComplaintAnalytics = async () => {
  try {
    const res = await getComplaintAnalytics();
    complaintData.value = res.data;
  } catch (err) {
    console.error('Error fetching complaint analytics:', err);
  }
};

onMounted(() => {
  fetchDashboard();
  fetchComplaintAnalytics();
});
</script>

<style scoped>
.organization-dashboard {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
}

.loading, .error {
  text-align: center;
  padding: 3rem;
  font-size: 1.125rem;
}

.error {
  color: #F44336;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.chart-card {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
}

.chart-card h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}

.section-card {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.section-card h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}

.activity-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.activity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--color-background-soft);
  border-radius: 8px;
}

.activity-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.activity-value {
  font-size: 1.5rem;
  font-weight: 700;
}

.activity-value.success {
  color: #4CAF50;
}

.activity-value.primary {
  color: #2196F3;
}

.projects-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

th {
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #2196F3;
  color: white;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-badge.active {
  background: #4CAF50;
  color: white;
}

.status-badge.completed {
  background: #9E9E9E;
  color: white;
}

.btn-link {
  color: #2196F3;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.btn-link:hover {
  color: #1976D2;
  text-decoration: underline;
}

.no-data {
  text-align: center;
  color: var(--text-secondary);
  padding: 2rem;
}

code {
  background: var(--color-background-soft);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.875rem;
}
</style>
