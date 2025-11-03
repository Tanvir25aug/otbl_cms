<template>
  <div class="ticket-list">
    <div class="page-header">
      <div class="page-header__content">
        <h1 class="page-title">Tickets</h1>
        <p class="page-subtitle">Manage and track support tickets</p>
      </div>
      <div class="page-header__actions">
        <router-link to="/tickets/board" class="btn btn--outline me-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
          </svg>
          Board
        </router-link>
        <router-link to="/tickets/create" class="btn btn--primary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Create Ticket
        </router-link>
      </div>
    </div>

    <div class="search-section">
      <div class="search-input-wrapper">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
        <input 
          type="text" 
          class="form-control search-input" 
          placeholder="Search by title or ID..." 
          v-model="searchTerm"
        >
      </div>
    </div>

    <div class="table-container">
      <div class="table-wrapper">
        <table class="modern-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Assignee</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ticket in filteredTickets" :key="ticket.id" class="table-row">
              <td class="ticket-id">#{{ ticket.id }}</td>
              <td class="ticket-title">{{ ticket.title }}</td>
              <td>
                <select
                  class="status-select"
                  :class="`status-select--${ticket.status.toLowerCase()}`"
                  v-model="ticket.status"
                  @change="updateTicketStatus(ticket)"
                >
                  <option value="Open">Open</option>
                  <option value="In-Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </td>
              <td>
                <span class="priority-badge" :class="`priority-badge--${ticket.priority.toLowerCase()}`">
                  {{ ticket.priority }}
                </span>
              </td>
              <td>
                <span class="text-muted">{{ ticket.assignee?.fullName || ticket.assignee?.email || 'Unassigned' }}</span>
              </td>
              <td>
                <div class="action-buttons">
                  <router-link :to="`/tickets/${ticket.id}`" class="action-btn action-btn--view">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </router-link>
                  <router-link
                    v-if="canEditOrDelete"
                    :to="`/tickets/${ticket.id}/edit`"
                    class="action-btn action-btn--edit"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </router-link>
                  <button
                    v-if="canEditOrDelete"
                    @click="deleteTicket(ticket.id)"
                    class="action-btn action-btn--delete"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      <line x1="10" y1="11" x2="10" y2="17"/>
                      <line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import apiClient from '../api';

interface Ticket {
  id: number;
  title: string;
  status: string;
  priority: string;
  assigneeId: number | null;
}

const tickets = ref<Ticket[]>([]);
const searchTerm = ref('');
const userRole = ref<string>('');

onMounted(async () => {
  try {
    const response = await apiClient.get('/tickets');
    tickets.value = response.data;

    // Get current user role
    const userResponse = await apiClient.get('/auth/me');
    userRole.value = userResponse.data.role;
  } catch (error) {
    console.error('Error getting tickets', error);
  }
});

const canEditOrDelete = computed(() => {
  return ['admin', 'super_admin', 'manager'].includes(userRole.value?.toLowerCase());
});

const filteredTickets = computed<Ticket[]>(() => {
  if (!searchTerm.value) {
    return tickets.value;
  }
  const lowerCaseSearchTerm = searchTerm.value.toLowerCase();
  return tickets.value.filter(ticket =>
    ticket.title.toLowerCase().includes(lowerCaseSearchTerm) ||
    ticket.id.toString().includes(lowerCaseSearchTerm)
  );
});

const updateTicketStatus = async (ticket: Ticket) => {
  try {
    await apiClient.patch(`/tickets/${ticket.id}`, {
      status: ticket.status
    });
    // Show success message (you can add a toast notification here)
    console.log('Status updated successfully');
  } catch (error) {
    console.error('Error updating ticket status', error);
    // Revert the status change on error
    const response = await apiClient.get('/tickets');
    tickets.value = response.data;
  }
};

const deleteTicket = async (ticketId: number) => {
  if (!confirm('Are you sure you want to delete this ticket?')) {
    return;
  }

  try {
    await apiClient.delete(`/tickets/${ticketId}`);
    tickets.value = tickets.value.filter(t => t.id !== ticketId);
    console.log('Ticket deleted successfully');
  } catch (error) {
    console.error('Error deleting ticket', error);
    alert('Failed to delete ticket');
  }
};
</script>

<style scoped>
.ticket-list {
  max-width: 1600px;
  margin: 0 auto;
  padding: var(--spacing-xl);
  min-height: 100vh;
  background-color: var(--color-background);
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: var(--spacing-2xl) var(--spacing-3xl);
  border-radius: var(--radius-2xl);
  margin-bottom: var(--spacing-2xl);
  box-shadow: 0 20px 25px -5px rgba(102, 126, 234, 0.3), 0 10px 10px -5px rgba(118, 75, 162, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  animation: slideInDown 0.5s ease-out;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  border-radius: 50%;
}

.page-header__content {
  z-index: 1;
}

.page-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-black);
  margin: 0 0 var(--spacing-sm) 0;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
  letter-spacing: -0.025em;
}

.page-subtitle {
  font-size: var(--font-size-lg);
  opacity: 0.95;
  font-weight: 400;
  letter-spacing: 0.01em;
  margin: 0;
}

.page-header__actions {
  z-index: 1;
  display: flex;
  gap: var(--spacing-md);
}

.search-section {
  margin-bottom: var(--spacing-xl);
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.search-input-wrapper {
  position: relative;
  max-width: 500px;
}

.search-icon {
  position: absolute;
  left: var(--spacing-lg);
  top: 50%;
  transform: translateY(-50%);
  color: #667eea;
  z-index: 1;
}

.search-input {
  padding-left: 48px;
  height: 52px;
  border-radius: var(--radius-xl);
  border: 2px solid var(--color-border);
  background: var(--color-surface);
  font-size: var(--font-size-base);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
}

.search-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  outline: none;
}

.table-container {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-2xl);
  overflow: hidden;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  animation: fadeInUp 0.7s ease-out;
}

.table-wrapper {
  overflow-x: auto;
}

.modern-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.modern-table th {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  padding: var(--spacing-lg) var(--spacing-xl);
  text-align: left;
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  border-bottom: 2px solid rgba(102, 126, 234, 0.2);
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.modern-table td {
  padding: var(--spacing-lg) var(--spacing-xl);
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
  vertical-align: middle;
}

.table-row {
  transition: all 0.2s ease;
}

.table-row:hover {
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  transform: scale(1.01);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.table-row:last-child td {
  border-bottom: none;
}

.ticket-id {
  font-weight: var(--font-weight-bold);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
}

.ticket-title {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  max-width: 400px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.025em;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.status-badge--open {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.status-badge--in-progress {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.status-badge--resolved {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
}

.status-badge--closed {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  color: white;
}

.priority-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.025em;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.priority-badge--low {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
}

.priority-badge--medium {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.priority-badge--high {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.priority-badge--urgent {
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
  color: white;
  animation: pulse 2s infinite;
}

.btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-lg);
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.025em;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  cursor: pointer;
  font-size: var(--font-size-sm);
  text-decoration: none;
}

.btn--primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn--primary:hover {
  background: linear-gradient(135deg, #5568d3 0%, #63408b 100%);
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -5px rgba(102, 126, 234, 0.4);
}

.btn--outline {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.5);
  color: white;
  backdrop-filter: blur(10px);
}

.btn--outline:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: white;
  transform: translateY(-2px);
}

.btn--sm {
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: var(--font-size-xs);
}

.me-2 {
  margin-right: var(--spacing-sm);
}

/* Status Select Dropdown */
.status-select {
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.025em;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='white' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  padding-right: 28px;
}

.status-select:focus {
  outline: none;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2);
}

.status-select--open {
  background-color: #3b82f6;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='white' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
}

.status-select--in-progress {
  background-color: #f59e0b;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='white' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
}

.status-select--resolved {
  background-color: #22c55e;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='white' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
}

.status-select--closed {
  background-color: #6b7280;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='white' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
}

/* Dropdown options styling */
.status-select option {
  background-color: white;
  color: #1f2937;
  padding: var(--spacing-md);
  font-weight: var(--font-weight-semibold);
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-lg);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  cursor: pointer;
  text-decoration: none;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.3);
}

.action-btn--view {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.action-btn--view:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
}

.action-btn--edit {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.action-btn--edit:hover {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
}

.action-btn--delete {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.action-btn--delete:hover {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
}

.text-muted {
  color: var(--color-text-tertiary);
}

/* Responsive design */
@media (max-width: 768px) {
  .ticket-list {
    padding: var(--spacing-md);
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-lg);
    padding: var(--spacing-xl);
  }

  .page-title {
    font-size: var(--font-size-2xl);
  }

  .page-header__actions {
    width: 100%;
  }

  .btn {
    flex: 1;
  }

  .search-input-wrapper {
    max-width: none;
  }

  .modern-table th,
  .modern-table td {
    padding: var(--spacing-md);
  }

  .ticket-title {
    max-width: 200px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: var(--font-size-xl);
  }

  .page-header__actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .modern-table th,
  .modern-table td {
    padding: var(--spacing-sm);
    font-size: var(--font-size-sm);
  }

  .ticket-title {
    max-width: 120px;
  }
}
</style>

<style>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .7;
  }
}
</style>