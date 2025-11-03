<template>
  <div class="quick-actions">
    <h3 class="actions-title">Quick Actions</h3>

    <div class="actions-grid">
      <button class="action-btn action-assign" @click="assignToMe" :disabled="loading">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        Assign to Me
      </button>

      <button class="action-btn action-urgent" @click="markUrgent" :disabled="loading">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        Mark Urgent
      </button>

      <button
        v-if="ticket.status !== 'Closed'"
        class="action-btn action-close"
        @click="closeTicket"
        :disabled="loading"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 11 12 14 22 4"/>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
        Close Ticket
      </button>

      <button
        v-if="ticket.status === 'Closed'"
        class="action-btn action-reopen"
        @click="reopenTicket"
        :disabled="loading"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
        </svg>
        Reopen Ticket
      </button>

      <button class="action-btn action-clone" @click="cloneTicket" :disabled="loading">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
        Clone Ticket
      </button>
    </div>

    <div v-if="message" class="action-message" :class="messageType">
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import apiClient from '../../api';
import { useRouter } from 'vue-router';

interface Ticket {
  id: number;
  status: string;
  [key: string]: any;
}

const props = defineProps<{
  ticket: Ticket;
}>();

const emit = defineEmits(['actionComplete', 'error']);

const router = useRouter();
const loading = ref(false);
const message = ref('');
const messageType = ref<'success' | 'error'>('success');

const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
  message.value = text;
  messageType.value = type;
  setTimeout(() => {
    message.value = '';
  }, 3000);
};

const assignToMe = async () => {
  try {
    loading.value = true;
    await apiClient.post(`/tickets/${props.ticket.id}/assign-to-me`);
    showMessage('Ticket assigned to you successfully!');
    emit('actionComplete');
  } catch (error: any) {
    console.error('Error assigning ticket:', error);
    const errorMsg = error.response?.data?.message || 'Failed to assign ticket';
    showMessage(errorMsg, 'error');
    emit('error', errorMsg);
  } finally {
    loading.value = false;
  }
};

const markUrgent = async () => {
  try {
    loading.value = true;
    await apiClient.post(`/tickets/${props.ticket.id}/mark-urgent`);
    showMessage('Ticket marked as urgent!');
    emit('actionComplete');
  } catch (error: any) {
    console.error('Error marking ticket urgent:', error);
    const errorMsg = error.response?.data?.message || 'Failed to mark ticket as urgent';
    showMessage(errorMsg, 'error');
    emit('error', errorMsg);
  } finally {
    loading.value = false;
  }
};

const closeTicket = async () => {
  try {
    loading.value = true;
    await apiClient.post(`/tickets/${props.ticket.id}/close`);
    showMessage('Ticket closed successfully!');
    emit('actionComplete');
  } catch (error: any) {
    console.error('Error closing ticket:', error);
    const errorMsg = error.response?.data?.message || 'Failed to close ticket';
    showMessage(errorMsg, 'error');
    emit('error', errorMsg);
  } finally {
    loading.value = false;
  }
};

const reopenTicket = async () => {
  try {
    loading.value = true;
    await apiClient.post(`/tickets/${props.ticket.id}/reopen`);
    showMessage('Ticket reopened successfully!');
    emit('actionComplete');
  } catch (error: any) {
    console.error('Error reopening ticket:', error);
    const errorMsg = error.response?.data?.message || 'Failed to reopen ticket';
    showMessage(errorMsg, 'error');
    emit('error', errorMsg);
  } finally {
    loading.value = false;
  }
};

const cloneTicket = async () => {
  try {
    loading.value = true;
    const response = await apiClient.post(`/tickets/${props.ticket.id}/clone`);
    const clonedTicket = response.data.ticket;
    showMessage(`Ticket cloned! Redirecting to #${clonedTicket.id}...`);

    setTimeout(() => {
      router.push(`/tickets/${clonedTicket.id}`);
    }, 1500);
  } catch (error: any) {
    console.error('Error cloning ticket:', error);
    const errorMsg = error.response?.data?.message || 'Failed to clone ticket';
    showMessage(errorMsg, 'error');
    emit('error', errorMsg);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.quick-actions {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  border: 1px solid var(--color-border);
  margin-bottom: var(--spacing-xl);
}

.actions-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-lg);
  color: var(--color-text-primary);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-md);
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
  border: 2px solid;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.action-btn svg {
  flex-shrink: 0;
}

.action-assign {
  border-color: #3b82f6;
  color: #3b82f6;
}

.action-assign:hover:not(:disabled) {
  background: #3b82f6;
  color: white;
}

.action-urgent {
  border-color: #f59e0b;
  color: #f59e0b;
}

.action-urgent:hover:not(:disabled) {
  background: #f59e0b;
  color: white;
}

.action-close {
  border-color: #10b981;
  color: #10b981;
}

.action-close:hover:not(:disabled) {
  background: #10b981;
  color: white;
}

.action-reopen {
  border-color: #8b5cf6;
  color: #8b5cf6;
}

.action-reopen:hover:not(:disabled) {
  background: #8b5cf6;
  color: white;
}

.action-clone {
  border-color: #06b6d4;
  color: #06b6d4;
}

.action-clone:hover:not(:disabled) {
  background: #06b6d4;
  color: white;
}

.action-message {
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  text-align: center;
}

.action-message.success {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #10b981;
}

.action-message.error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #ef4444;
}

@media (max-width: 768px) {
  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
