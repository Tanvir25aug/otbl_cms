<template>
  <div class="activity-timeline">
    <h3 class="timeline-title">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
      Activity Timeline
    </h3>

    <div v-if="loading" class="timeline-loading">
      <div class="spinner"></div>
      <p>Loading activity...</p>
    </div>

    <div v-else-if="error" class="timeline-error">
      <p>{{ error }}</p>
    </div>

    <div v-else-if="history.length === 0" class="timeline-empty">
      <p>No activity yet</p>
    </div>

    <div v-else class="timeline-list">
      <div
        v-for="entry in history"
        :key="entry.id"
        class="timeline-item"
        :class="`timeline-${getActionColor(entry.action)}`"
      >
        <div class="timeline-marker">
          <div class="timeline-dot"></div>
          <div class="timeline-line"></div>
        </div>

        <div class="timeline-content">
          <div class="timeline-header">
            <div class="timeline-action">
              <span class="action-icon">{{ getActionIcon(entry.action) }}</span>
              <span class="action-text">{{ entry.action.replace('_', ' ').toUpperCase() }}</span>
            </div>
            <div class="timeline-time">{{ formatTime(entry.createdAt) }}</div>
          </div>

          <div class="timeline-user">
            {{ entry.user?.fullName || entry.user?.email || 'System' }}
          </div>

          <div v-if="entry.description" class="timeline-description">
            {{ entry.description }}
          </div>

          <div v-if="entry.oldValue || entry.newValue" class="timeline-changes">
            <span v-if="entry.oldValue" class="change-old">{{ entry.oldValue }}</span>
            <span class="change-arrow">’</span>
            <span v-if="entry.newValue" class="change-new">{{ entry.newValue }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import apiClient from '../../api';

interface User {
  id: number;
  email: string;
  fullName?: string;
}

interface HistoryEntry {
  id: number;
  ticketId: number;
  userId: number;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  description?: string;
  createdAt: string;
  user?: User;
}

const props = defineProps<{
  ticketId: number;
}>();

const history = ref<HistoryEntry[]>([]);
const loading = ref(true);
const error = ref('');

const getActionColor = (action: string): string => {
  const colorMap: Record<string, string> = {
    'created': 'blue',
    'updated': 'gray',
    'status_changed': 'purple',
    'assigned': 'green',
    'reassigned': 'green',
    'priority_changed': 'orange',
    'closed': 'red',
    'reopened': 'yellow',
    'cloned': 'cyan',
    'time_logged': 'teal',
    'flagged': 'pink',
    'archived': 'dark',
  };
  return colorMap[action] || 'gray';
};

const getActionIcon = (action: string): string => {
  const iconMap: Record<string, string> = {
    'created': '(',
    'updated': '',
    'status_changed': '=',
    'assigned': '=d',
    'reassigned': '=',
    'priority_changed': '¡',
    'closed': '',
    'reopened': '=',
    'cloned': '=Ë',
    'time_logged': 'ñ',
    'flagged': '=©',
    'archived': '=æ',
  };
  return iconMap[action] || '=Ì';
};

const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
};

const fetchHistory = async () => {
  try {
    loading.value = true;
    error.value = '';
    const response = await apiClient.get(`/tickets/${props.ticketId}/history`);
    history.value = response.data;
  } catch (err: any) {
    console.error('Error fetching history:', err);
    error.value = 'Failed to load activity timeline';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchHistory();
});

defineExpose({
  refresh: fetchHistory,
});
</script>

<style scoped>
.activity-timeline {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  border: 1px solid var(--color-border);
}

.timeline-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-lg);
  color: var(--color-text-primary);
}

.timeline-title svg {
  color: #667eea;
}

.timeline-loading,
.timeline-error,
.timeline-empty {
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--color-text-secondary);
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(102, 126, 234, 0.3);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto var(--spacing-md);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.timeline-list {
  position: relative;
}

.timeline-item {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  position: relative;
}

.timeline-item:last-child .timeline-line {
  display: none;
}

.timeline-marker {
  position: relative;
  flex-shrink: 0;
  width: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: currentColor;
  border: 3px solid var(--color-surface);
  box-shadow: 0 0 0 2px currentColor;
  z-index: 1;
}

.timeline-line {
  flex: 1;
  width: 2px;
  background: var(--color-border);
  margin-top: 4px;
}

.timeline-blue { color: #3b82f6; }
.timeline-gray { color: #6b7280; }
.timeline-purple { color: #8b5cf6; }
.timeline-green { color: #10b981; }
.timeline-orange { color: #f59e0b; }
.timeline-red { color: #ef4444; }
.timeline-yellow { color: #eab308; }
.timeline-cyan { color: #06b6d4; }
.timeline-teal { color: #14b8a6; }
.timeline-pink { color: #ec4899; }
.timeline-dark { color: #374151; }

.timeline-content {
  flex: 1;
  background: var(--color-surface-soft);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xs);
}

.timeline-action {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.action-icon {
  font-size: var(--font-size-lg);
}

.action-text {
  text-transform: capitalize;
}

.timeline-time {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.timeline-user {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
}

.timeline-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-top: var(--spacing-xs);
}

.timeline-changes {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
  font-size: var(--font-size-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--color-surface);
  border-radius: var(--radius-sm);
}

.change-old {
  color: #ef4444;
  text-decoration: line-through;
}

.change-arrow {
  color: var(--color-text-tertiary);
}

.change-new {
  color: #10b981;
  font-weight: var(--font-weight-medium);
}
</style>
