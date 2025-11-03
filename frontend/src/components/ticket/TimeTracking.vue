<template>
  <div class="time-tracking">
    <h3 class="tracking-title">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
      Time Tracking
    </h3>

    <!-- Total Time Display -->
    <div class="total-time">
      <div class="total-label">Total Time Logged</div>
      <div class="total-value">{{ totalTime.toFixed(2) }} hours</div>
    </div>

    <!-- Log Time Form -->
    <div class="log-time-form">
      <div class="form-group">
        <label for="timeSpent">Hours Spent</label>
        <input
          type="number"
          id="timeSpent"
          v-model.number="timeSpent"
          placeholder="e.g., 2.5"
          min="0.1"
          step="0.5"
          :disabled="submitting"
        />
      </div>

      <div class="form-group">
        <label for="description">Description (Optional)</label>
        <textarea
          id="description"
          v-model="logDescription"
          placeholder="What did you work on?"
          rows="2"
          :disabled="submitting"
        ></textarea>
      </div>

      <button class="btn-log-time" @click="logTime" :disabled="!canLogTime || submitting">
        <svg v-if="!submitting" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 11 12 14 22 4"/>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
        <div v-else class="spinner-small"></div>
        {{ submitting ? 'Logging...' : 'Log Time' }}
      </button>

      <div v-if="message" class="log-message" :class="messageType">
        {{ message }}
      </div>
    </div>

    <!-- Time Logs List -->
    <div v-if="loading" class="logs-loading">
      <div class="spinner"></div>
      <p>Loading time logs...</p>
    </div>

    <div v-else-if="timeLogs.length > 0" class="time-logs">
      <h4 class="logs-title">Recent Logs</h4>
      <div class="logs-list">
        <div v-for="log in timeLogs" :key="log.id" class="log-item">
          <div class="log-header">
            <div class="log-user">
              {{ log.user?.fullName || log.user?.email || 'Unknown' }}
            </div>
            <div class="log-time">{{ log.timeSpent }}h</div>
          </div>
          <div v-if="log.description" class="log-description">
            {{ log.description }}
          </div>
          <div class="log-date">
            {{ formatDate(log.loggedAt) }}
          </div>
        </div>
      </div>
    </div>

    <div v-else class="logs-empty">
      <p>No time logged yet</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import apiClient from '../../api';

interface User {
  id: number;
  email: string;
  fullName?: string;
}

interface TimeLog {
  id: number;
  ticketId: number;
  userId: number;
  timeSpent: number;
  description?: string;
  loggedAt: string;
  user?: User;
}

const props = defineProps<{
  ticketId: number;
}>();

const emit = defineEmits(['timeLogged']);

const timeLogs = ref<TimeLog[]>([]);
const totalTime = ref(0);
const loading = ref(true);
const submitting = ref(false);
const timeSpent = ref<number | null>(null);
const logDescription = ref('');
const message = ref('');
const messageType = ref<'success' | 'error'>('success');

const canLogTime = computed(() => {
  return timeSpent.value !== null && timeSpent.value > 0;
});

const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
  message.value = text;
  messageType.value = type;
  setTimeout(() => {
    message.value = '';
  }, 3000);
};

const fetchTimeLogs = async () => {
  try {
    loading.value = true;
    const response = await apiClient.get(`/tickets/${props.ticketId}/time-logs`);
    timeLogs.value = response.data.timeLogs || [];
    totalTime.value = response.data.totalTime || 0;
  } catch (error) {
    console.error('Error fetching time logs:', error);
  } finally {
    loading.value = false;
  }
};

const logTime = async () => {
  if (!canLogTime.value) return;

  try {
    submitting.value = true;
    await apiClient.post(`/tickets/${props.ticketId}/log-time`, {
      timeSpent: timeSpent.value,
      description: logDescription.value || undefined,
    });

    showMessage('Time logged successfully!');
    timeSpent.value = null;
    logDescription.value = '';

    // Refresh logs
    await fetchTimeLogs();
    emit('timeLogged');
  } catch (error: any) {
    console.error('Error logging time:', error);
    const errorMsg = error.response?.data?.message || 'Failed to log time';
    showMessage(errorMsg, 'error');
  } finally {
    submitting.value = false;
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

onMounted(() => {
  fetchTimeLogs();
});
</script>

<style scoped>
.time-tracking {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  border: 1px solid var(--color-border);
  margin-bottom: var(--spacing-xl);
}

.tracking-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-lg);
  color: var(--color-text-primary);
}

.tracking-title svg {
  color: #14b8a6;
}

.total-time {
  background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%);
  color: white;
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  text-align: center;
  margin-bottom: var(--spacing-lg);
}

.total-label {
  font-size: var(--font-size-sm);
  opacity: 0.9;
  margin-bottom: var(--spacing-xs);
}

.total-value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
}

.log-time-form {
  margin-bottom: var(--spacing-lg);
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-group label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-xs);
  color: var(--color-text-secondary);
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: var(--spacing-sm);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #14b8a6;
}

.form-group textarea {
  resize: vertical;
  font-family: inherit;
}

.btn-log-time {
  width: 100%;
  padding: var(--spacing-md);
  background: #14b8a6;
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  transition: all 0.2s;
}

.btn-log-time:hover:not(:disabled) {
  background: #0d9488;
}

.btn-log-time:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.log-message {
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  text-align: center;
}

.log-message.success {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #10b981;
}

.log-message.error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #ef4444;
}

.logs-loading,
.logs-empty {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-secondary);
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(20, 184, 166, 0.3);
  border-top-color: #14b8a6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto var(--spacing-md);
}

.time-logs {
  margin-top: var(--spacing-lg);
}

.logs-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-md);
  color: var(--color-text-primary);
}

.logs-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.log-item {
  padding: var(--spacing-md);
  background: var(--color-surface-soft);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xs);
}

.log-user {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.log-time {
  font-weight: var(--font-weight-bold);
  color: #14b8a6;
  font-size: var(--font-size-sm);
}

.log-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
}

.log-date {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}
</style>
