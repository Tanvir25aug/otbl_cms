<template>
  <div class="project-analytics">
    <div class="page-header">
      <div>
        <router-link to="/analytics" class="back-link">← Back to Dashboard</router-link>
        <h1 v-if="analytics.project">{{ analytics.project.name }} ({{ analytics.project.key }})</h1>
        <h1 v-else>Project Analytics</h1>
      </div>
      <div class="header-actions">
        <button @click="exportPDF" class="btn btn-secondary">
          📄 Export PDF
        </button>
        <button @click="exportCSV" class="btn btn-secondary">
          📊 Export CSV
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading">Loading project analytics...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else class="analytics-content">
      <!-- Summary Cards -->
      <div class="metrics-grid">
        <MetricCard
          title="Total Tickets"
          :value="analytics.summary?.totalTickets || 0"
          icon="🎫"
          variant="primary"
        />
        <MetricCard
          title="Completion Rate"
          :value="analytics.summary?.completionRate || 0"
          suffix="%"
          icon="✅"
          variant="success"
        />
        <MetricCard
          title="Overdue Tickets"
          :value="analytics.summary?.overdueTickets || 0"
          icon="⚠️"
          variant="danger"
        />
        <MetricCard
          title="Avg Resolution Time"
          :value="analytics.summary?.avgResolutionTimeHours || 0"
          suffix="h"
          icon="⏱️"
          variant="info"
        />
      </div>

      <!-- Progress Bars -->
      <div class="progress-section">
        <div class="section-card">
          <h2>Progress Overview</h2>
          <ProgressBar
            label="Ticket Completion"
            :current="analytics.summary?.closedTickets || 0"
            :total="analytics.summary?.totalTickets || 1"
            color="#4CAF50"
          />
          <ProgressBar
            label="Story Points"
            :current="analytics.storyPoints?.completed || 0"
            :total="analytics.storyPoints?.total || 1"
            color="#2196F3"
          />
        </div>
      </div>

      <!-- Charts -->
      <div class="charts-grid">
        <div class="chart-card">
          <h2>Tickets by Status</h2>
          <PieChart
            v-if="hasStatusData"
            :data="analytics.breakdown?.byStatus"
          />
          <p v-else class="no-data">No data available</p>
        </div>

        <div class="chart-card">
          <h2>Tickets by Priority</h2>
          <PieChart
            v-if="hasPriorityData"
            :data="analytics.breakdown?.byPriority"
            :colors="['#F44336', '#FF9800', '#FFC107', '#4CAF50', '#2196F3']"
          />
          <p v-else class="no-data">No data available</p>
        </div>

        <div class="chart-card">
          <h2>Tickets by Type</h2>
          <PieChart
            v-if="hasTypeData"
            :data="analytics.breakdown?.byType"
            :colors="['#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#00BCD4', '#009688']"
          />
          <p v-else class="no-data">No data available</p>
        </div>

        <div class="chart-card">
          <h2>Weekly Velocity</h2>
          <VelocityChart
            v-if="hasVelocityData"
            :velocityData="analytics.recentActivity?.velocity || []"
          />
          <p v-else class="no-data">No velocity data available</p>
        </div>
      </div>

      <!-- Teams & Time Tracking -->
      <div class="info-grid">
        <div class="section-card">
          <h2>Teams</h2>
          <div class="info-row">
            <span>Total Teams</span>
            <strong>{{ analytics.teams?.total || 0 }}</strong>
          </div>
          <div class="info-row">
            <span>Active Teams</span>
            <strong>{{ analytics.teams?.active || 0 }}</strong>
          </div>
          <div class="info-row">
            <span>Total Members</span>
            <strong>{{ analytics.teams?.totalMembers || 0 }}</strong>
          </div>
        </div>

        <div class="section-card">
          <h2>Sprints</h2>
          <div class="info-row">
            <span>Total Sprints</span>
            <strong>{{ analytics.sprints?.total || 0 }}</strong>
          </div>
          <div class="info-row">
            <span>Active Sprints</span>
            <strong>{{ analytics.sprints?.active || 0 }}</strong>
          </div>
          <div class="info-row">
            <span>Completed Sprints</span>
            <strong>{{ analytics.sprints?.completed || 0 }}</strong>
          </div>
        </div>

        <div class="section-card">
          <h2>Time Tracking</h2>
          <div class="info-row">
            <span>Estimated Hours</span>
            <strong>{{ analytics.timeTracking?.estimatedHours || 0 }}h</strong>
          </div>
          <div class="info-row">
            <span>Spent Hours</span>
            <strong>{{ analytics.timeTracking?.spentHours || 0 }}h</strong>
          </div>
          <div class="info-row">
            <span>Variance</span>
            <strong :class="varianceClass">
              {{ formatVariance(analytics.timeTracking?.variance) }}
            </strong>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '@/api';
import MetricCard from '@/components/analytics/MetricCard.vue';
import ProgressBar from '@/components/analytics/ProgressBar.vue';
import PieChart from '@/components/charts/PieChart.vue';
import VelocityChart from '@/components/charts/VelocityChart.vue';

const route = useRoute();
const analytics = ref({});
const loading = ref(true);
const error = ref(null);

const hasStatusData = computed(() => analytics.value.breakdown?.byStatus && Object.keys(analytics.value.breakdown.byStatus).length > 0);
const hasPriorityData = computed(() => analytics.value.breakdown?.byPriority && Object.keys(analytics.value.breakdown.byPriority).length > 0);
const hasTypeData = computed(() => analytics.value.breakdown?.byType && Object.keys(analytics.value.breakdown.byType).length > 0);
const hasVelocityData = computed(() => analytics.value.recentActivity?.velocity && analytics.value.recentActivity.velocity.length > 0);

const varianceClass = computed(() => {
  const variance = analytics.value.timeTracking?.variance || 0;
  if (variance > 0) return 'text-danger';
  if (variance < 0) return 'text-success';
  return '';
});

const formatVariance = (variance) => {
  if (!variance) return '0h';
  const sign = variance > 0 ? '+' : '';
  return `${sign}${variance}h`;
};

const fetchAnalytics = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await apiClient.get(`/analytics/projects/${route.params.id}`);
    analytics.value = response.data;
  } catch (err) {
    console.error('Error fetching project analytics:', err);
    error.value = err.response?.data?.message || 'Failed to load analytics';
  } finally {
    loading.value = false;
  }
};

const exportPDF = async () => {
  try {
    const response = await apiClient.get(
      `/export/project/${route.params.id}/pdf`,
      { responseType: 'blob' }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `project-${route.params.id}-analytics.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    console.error('Error exporting PDF:', err);
    alert('Failed to export PDF');
  }
};

const exportCSV = async () => {
  try {
    const response = await apiClient.get(
      `/export/project/${route.params.id}/csv`,
      { responseType: 'blob' }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `project-${route.params.id}-analytics.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    console.error('Error exporting CSV:', err);
    alert('Failed to export CSV');
  }
};

onMounted(fetchAnalytics);
</script>

<style scoped>
.project-analytics {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-top: 0.5rem;
}

.back-link {
  color: #2196F3;
  text-decoration: none;
  font-size: 0.875rem;
  display: inline-block;
  margin-bottom: 0.5rem;
}

.back-link:hover {
  text-decoration: underline;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-secondary {
  background: var(--color-background-soft);
  color: var(--text-primary);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background: var(--color-background-mute);
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

.progress-section {
  margin-bottom: 2rem;
}

.section-card {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
}

.section-card h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}

.charts-grid {
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

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--color-border);
}

.info-row:last-child {
  border-bottom: none;
}

.info-row span {
  color: var(--text-secondary);
}

.info-row strong {
  color: var(--text-primary);
  font-size: 1.125rem;
}

.text-danger {
  color: #F44336;
}

.text-success {
  color: #4CAF50;
}

.no-data {
  text-align: center;
  color: var(--text-secondary);
  padding: 2rem;
}
</style>
