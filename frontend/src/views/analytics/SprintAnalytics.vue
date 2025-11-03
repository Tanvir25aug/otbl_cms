<template>
  <div class="sprint-analytics">
    <div class="page-header">
      <div>
        <router-link to="/analytics" class="back-link">← Back to Dashboard</router-link>
        <h1 v-if="analytics.sprint">{{ analytics.sprint.name }}</h1>
        <h1 v-else>Sprint Analytics</h1>
        <p v-if="analytics.sprint" class="sprint-dates">
          {{ formatDate(analytics.sprint.startDate) }} - {{ formatDate(analytics.sprint.endDate) }}
        </p>
      </div>
      <div class="header-actions">
        <button @click="exportPDF" class="btn btn-secondary">
          📄 Export PDF
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading">Loading sprint analytics...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else class="analytics-content">
      <!-- Sprint Info Banner -->
      <div class="sprint-info-banner">
        <div class="info-item">
          <span class="label">Project</span>
          <strong>{{ analytics.sprint?.project.name }}</strong>
        </div>
        <div class="info-item">
          <span class="label">Team</span>
          <strong>{{ analytics.sprint?.team.name }}</strong>
        </div>
        <div class="info-item">
          <span class="label">Status</span>
          <span :class="['status-badge', analytics.sprint?.status.toLowerCase()]">
            {{ analytics.sprint?.status }}
          </span>
        </div>
        <div class="info-item" v-if="analytics.sprint?.goal">
          <span class="label">Goal</span>
          <p class="goal-text">{{ analytics.sprint.goal }}</p>
        </div>
      </div>

      <!-- Summary Metrics -->
      <div class="metrics-grid">
        <MetricCard
          title="Total Tickets"
          :value="analytics.summary?.totalTickets || 0"
          icon="🎫"
          variant="primary"
        />
        <MetricCard
          title="Completed"
          :value="analytics.summary?.completedTickets || 0"
          :subtitle="`${analytics.summary?.completionRate || 0}% complete`"
          icon="✅"
          variant="success"
        />
        <MetricCard
          title="In Progress"
          :value="analytics.summary?.inProgressTickets || 0"
          icon="🔄"
          variant="warning"
        />
        <MetricCard
          title="To Do"
          :value="analytics.summary?.todoTickets || 0"
          icon="📋"
          variant="info"
        />
      </div>

      <!-- Burndown Chart -->
      <div class="burndown-section">
        <div class="chart-card-large">
          <h2>Sprint Burndown Chart</h2>
          <p class="chart-description">
            Track daily progress against the ideal burndown line
          </p>
          <BurndownChart
            v-if="hasBurndownData"
            :burndownData="analytics.burndown"
            :title="''"
          />
          <p v-else class="no-data">
            Burndown chart requires sprint start and end dates
          </p>
        </div>
      </div>

      <!-- Story Points & Scope -->
      <div class="info-grid">
        <div class="section-card">
          <h2>Story Points</h2>
          <ProgressBar
            label="Story Points Progress"
            :current="analytics.storyPoints?.completed || 0"
            :total="analytics.storyPoints?.committed || 1"
            color="#4CAF50"
          />
          <div class="stats-row">
            <div class="stat-item">
              <span class="stat-label">Committed</span>
              <span class="stat-value">{{ analytics.storyPoints?.committed || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Completed</span>
              <span class="stat-value">{{ analytics.storyPoints?.completed || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Remaining</span>
              <span class="stat-value">{{ analytics.storyPoints?.remaining || 0 }}</span>
            </div>
          </div>
        </div>

        <div class="section-card">
          <h2>Scope Management</h2>
          <div class="info-row">
            <span>Initial Tickets</span>
            <strong>{{ analytics.scope?.initialTickets || 0 }}</strong>
          </div>
          <div class="info-row">
            <span>Added Tickets</span>
            <strong>{{ analytics.scope?.addedTickets || 0 }}</strong>
          </div>
          <div class="info-row">
            <span>Scope Change</span>
            <strong :class="scopeChangeClass">
              {{ analytics.scope?.scopeChangePercent || 0 }}%
            </strong>
          </div>
          <div class="scope-alert" v-if="(analytics.scope?.scopeChangePercent || 0) > 20">
            ⚠️ High scope change detected. Consider reviewing sprint planning.
          </div>
        </div>
      </div>

      <!-- Breakdown Charts -->
      <div class="charts-grid">
        <div class="chart-card">
          <h2>Tickets by Type</h2>
          <PieChart
            v-if="hasTypeData"
            :data="analytics.breakdown?.byType"
            :colors="['#9C27B0', '#3F51B5', '#2196F3', '#00BCD4', '#009688', '#4CAF50']"
          />
          <p v-else class="no-data">No data available</p>
        </div>

        <div class="chart-card">
          <h2>Tickets by Status</h2>
          <PieChart
            v-if="hasStatusData"
            :data="analytics.breakdown?.byStatus"
          />
          <p v-else class="no-data">No data available</p>
        </div>
      </div>

      <!-- Time Tracking -->
      <div class="section-card">
        <h2>Time Tracking</h2>
        <div class="time-grid">
          <div class="time-item">
            <span class="time-label">Estimated Hours</span>
            <span class="time-value">{{ analytics.timeTracking?.estimatedHours || 0 }}h</span>
          </div>
          <div class="time-item">
            <span class="time-label">Spent Hours</span>
            <span class="time-value">{{ analytics.timeTracking?.spentHours || 0 }}h</span>
          </div>
          <div class="time-item">
            <span class="time-label">Remaining Hours</span>
            <span class="time-value">{{ analytics.timeTracking?.remainingHours || 0 }}h</span>
          </div>
          <div class="time-item">
            <span class="time-label">Variance</span>
            <span :class="['time-value', varianceClass]">
              {{ formatVariance(analytics.timeTracking?.variance) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import MetricCard from '@/components/analytics/MetricCard.vue';
import ProgressBar from '@/components/analytics/ProgressBar.vue';
import PieChart from '@/components/charts/PieChart.vue';
import BurndownChart from '@/components/charts/BurndownChart.vue';

const route = useRoute();
const analytics = ref({});
const loading = ref(true);
const error = ref(null);

const hasBurndownData = computed(() =>
  analytics.value.burndown && analytics.value.burndown.length > 0
);
const hasTypeData = computed(() =>
  analytics.value.breakdown?.byType && Object.keys(analytics.value.breakdown.byType).length > 0
);
const hasStatusData = computed(() =>
  analytics.value.breakdown?.byStatus && Object.keys(analytics.value.breakdown.byStatus).length > 0
);

const scopeChangeClass = computed(() => {
  const change = analytics.value.scope?.scopeChangePercent || 0;
  if (change > 20) return 'text-danger';
  if (change > 10) return 'text-warning';
  return 'text-success';
});

const varianceClass = computed(() => {
  const variance = analytics.value.timeTracking?.variance || 0;
  if (variance > 0) return 'text-danger';
  if (variance < 0) return 'text-success';
  return '';
});

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
};

const formatVariance = (variance) => {
  if (!variance) return '0h';
  const sign = variance > 0 ? '+' : '';
  return `${sign}${variance}h`;
};

const fetchAnalytics = async () => {
  loading.value = true;
  error.value = null;

  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/analytics/sprints/${route.params.id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    analytics.value = response.data;
  } catch (err) {
    console.error('Error fetching sprint analytics:', err);
    error.value = err.response?.data?.message || 'Failed to load analytics';
  } finally {
    loading.value = false;
  }
};

const exportPDF = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/export/sprint/${route.params.id}/pdf`,
      {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sprint-${route.params.id}-analytics.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    console.error('Error exporting PDF:', err);
    alert('Failed to export PDF');
  }
};

onMounted(fetchAnalytics);
</script>

<style scoped>
.sprint-analytics {
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
  margin-bottom: 0.25rem;
}

.sprint-dates {
  color: var(--text-secondary);
  font-size: 0.875rem;
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

.sprint-info-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.info-item .label {
  display: block;
  font-size: 0.75rem;
  opacity: 0.9;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item strong {
  font-size: 1.125rem;
}

.goal-text {
  margin: 0.5rem 0 0 0;
  font-size: 0.875rem;
  line-height: 1.5;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.2);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.burndown-section {
  margin-bottom: 2rem;
}

.chart-card-large {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 2rem;
}

.chart-card-large h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.chart-description {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
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

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 1.5rem;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
  text-transform: uppercase;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
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

.scope-alert {
  margin-top: 1rem;
  padding: 0.75rem;
  background: rgba(255, 152, 0, 0.1);
  border-left: 3px solid #FF9800;
  border-radius: 4px;
  font-size: 0.875rem;
  color: #F57C00;
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

.time-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
}

.time-item {
  text-align: center;
  padding: 1rem;
  background: var(--color-background-soft);
  border-radius: 8px;
}

.time-label {
  display: block;
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
}

.time-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.text-danger {
  color: #F44336;
}

.text-warning {
  color: #FF9800;
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
