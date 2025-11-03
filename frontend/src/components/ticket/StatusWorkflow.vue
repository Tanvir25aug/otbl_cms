<template>
  <div class="status-workflow">
    <h3 class="workflow-title">Status Workflow</h3>

    <div class="workflow-steps">
      <div
        v-for="(status, index) in statuses"
        :key="status"
        class="workflow-step"
        :class="{
          'step-active': currentStatus === status,
          'step-completed': isCompleted(status),
          'step-clickable': canChangeStatus
        }"
        @click="handleStatusClick(status)"
      >
        <div class="step-marker">
          <div class="step-number">{{ index + 1 }}</div>
          <div v-if="currentStatus === status" class="step-pulse"></div>
        </div>
        <div class="step-label">{{ status }}</div>
        <div v-if="index < statuses.length - 1" class="step-connector"></div>
      </div>
    </div>

    <div v-if="showConfirm" class="status-confirm-modal">
      <div class="confirm-content">
        <h4>Change Status</h4>
        <p>Change status from <strong>{{ currentStatus }}</strong> to <strong>{{ pendingStatus }}</strong>?</p>
        <div class="confirm-actions">
          <button class="btn btn-primary" @click="confirmStatusChange" :disabled="updating">
            {{ updating ? 'Updating...' : 'Confirm' }}
          </button>
          <button class="btn btn-secondary" @click="cancelStatusChange" :disabled="updating">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import apiClient from '../../api';

interface Ticket {
  id: number;
  status: string;
  [key: string]: any;
}

const props = defineProps<{
  ticket: Ticket;
  canChangeStatus?: boolean;
}>();

const emit = defineEmits(['statusChanged', 'error']);

const statuses = ['Backlog', 'To Do', 'In Progress', 'In Review', 'Testing', 'Done', 'Closed'];

const showConfirm = ref(false);
const pendingStatus = ref('');
const updating = ref(false);

const currentStatus = computed(() => props.ticket.status);

const isCompleted = (status: string): boolean => {
  const currentIndex = statuses.indexOf(currentStatus.value);
  const statusIndex = statuses.indexOf(status);
  return statusIndex < currentIndex;
};

const handleStatusClick = (status: string) => {
  if (!props.canChangeStatus) return;
  if (status === currentStatus.value) return;

  pendingStatus.value = status;
  showConfirm.value = true;
};

const confirmStatusChange = async () => {
  try {
    updating.value = true;
    await apiClient.patch(`/tickets/${props.ticket.id}/status`, {
      status: pendingStatus.value
    });

    emit('statusChanged', pendingStatus.value);
    showConfirm.value = false;
  } catch (error: any) {
    console.error('Error changing status:', error);
    emit('error', error.response?.data?.message || 'Failed to change status');
  } finally {
    updating.value = false;
  }
};

const cancelStatusChange = () => {
  showConfirm.value = false;
  pendingStatus.value = '';
};
</script>

<style scoped>
.status-workflow {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
  color: white;
}

.workflow-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-lg);
  text-align: center;
}

.workflow-steps {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.workflow-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
  cursor: default;
  transition: all 0.3s ease;
}

.step-clickable {
  cursor: pointer;
}

.step-clickable:hover .step-marker {
  transform: scale(1.1);
}

.step-marker {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-sm);
  transition: all 0.3s ease;
  z-index: 2;
}

.step-completed .step-marker {
  background: rgba(16, 185, 129, 0.9);
}

.step-active .step-marker {
  background: white;
  color: #667eea;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
}

.step-number {
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-lg);
}

.step-pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0;
  }
}

.step-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-align: center;
  max-width: 80px;
  opacity: 0.9;
}

.step-active .step-label {
  opacity: 1;
  font-weight: var(--font-weight-bold);
}

.step-connector {
  position: absolute;
  top: 24px;
  left: 50%;
  width: 100%;
  height: 2px;
  background: rgba(255, 255, 255, 0.3);
  z-index: 1;
}

.step-completed .step-connector {
  background: rgba(16, 185, 129, 0.6);
}

.status-confirm-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.confirm-content {
  background: white;
  color: var(--color-text-primary);
  padding: var(--spacing-2xl);
  border-radius: var(--radius-lg);
  max-width: 400px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
}

.confirm-content h4 {
  margin-bottom: var(--spacing-md);
  color: var(--color-text-primary);
}

.confirm-content p {
  margin-bottom: var(--spacing-lg);
  color: var(--color-text-secondary);
}

.confirm-actions {
  display: flex;
  gap: var(--spacing-md);
}

.btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5568d3;
}

.btn-secondary {
  background: #e5e7eb;
  color: var(--color-text-primary);
}

.btn-secondary:hover:not(:disabled) {
  background: #d1d5db;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .workflow-steps {
    flex-direction: column;
    gap: var(--spacing-lg);
  }

  .step-connector {
    display: none;
  }

  .workflow-step {
    width: 100%;
    flex-direction: row;
    justify-content: flex-start;
    gap: var(--spacing-md);
  }

  .step-label {
    text-align: left;
    max-width: none;
  }
}
</style>
