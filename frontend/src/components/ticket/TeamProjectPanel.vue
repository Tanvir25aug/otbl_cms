<template>
  <div class="team-project-panel">
    <h3 class="panel-title">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 4h7l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>
      </svg>
      Project & Assignment
    </h3>

    <!-- Project Info -->
    <div v-if="ticket.project" class="info-section">
      <div class="info-label">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 4h7l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>
        </svg>
        Project
      </div>
      <div class="info-value">
        <router-link :to="`/analytics/project/${ticket.project.id}`" class="project-link">
          {{ ticket.project.name }}
          <span class="project-key">({{ ticket.project.key }})</span>
        </router-link>
      </div>
    </div>

    <div v-else class="info-section">
      <div class="info-label">Project</div>
      <div class="info-value text-muted">No project assigned</div>
    </div>

    <!-- Reassign Section -->
    <div class="reassign-section">
      <button class="btn-reassign" @click="showReassignModal = true" :disabled="!canReassign">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        Reassign Ticket
      </button>
    </div>

    <!-- Reassign Modal -->
    <div v-if="showReassignModal" class="reassign-modal">
      <div class="modal-content">
        <h4>Reassign Ticket</h4>

        <!-- Assignee Selection -->
        <div class="form-group">
          <label>Assignee</label>
          <select v-model.number="newAssigneeId" class="form-select">
            <option :value="null">Unassigned</option>
            <option v-for="user in availableUsers" :key="user.id" :value="user.id">
              {{ user.fullName || user.email }}
            </option>
          </select>
        </div>

        <!-- Project Selection -->
        <div class="form-group">
          <label>Project</label>
          <select v-model.number="newProjectId" class="form-select">
            <option :value="null">No Project</option>
            <option v-for="project in availableProjects" :key="project.id" :value="project.id">
              {{ project.name }} ({{ project.key }})
            </option>
          </select>
        </div>

        <div class="modal-actions">
          <button class="btn btn-primary" @click="reassignTicket" :disabled="reassigning">
            {{ reassigning ? 'Updating...' : 'Confirm' }}
          </button>
          <button class="btn btn-secondary" @click="closeModal" :disabled="reassigning">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import apiClient from '../../api';

interface User {
  id: number;
  email: string;
  fullName?: string;
}

interface Project {
  id: number;
  name: string;
  key: string;
}

interface Ticket {
  id: number;
  assigneeId?: number;
  projectId?: number;
  project?: Project;
  [key: string]: any;
}

const props = defineProps<{
  ticket: Ticket;
  canReassign?: boolean;
}>();

const emit = defineEmits(['reassigned']);

const availableUsers = ref<User[]>([]);
const availableProjects = ref<Project[]>([]);
const showReassignModal = ref(false);
const newAssigneeId = ref<number | null>(null);
const newProjectId = ref<number | null>(null);
const reassigning = ref(false);

const fetchAvailableUsers = async () => {
  try {
    const response = await apiClient.get('/users');
    availableUsers.value = response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
  }
};

const fetchAvailableProjects = async () => {
  try {
    const response = await apiClient.get('/projects');
    availableProjects.value = response.data;
  } catch (error) {
    console.error('Error fetching projects:', error);
  }
};

const closeModal = () => {
  showReassignModal.value = false;
  // Reset values when closing
  newAssigneeId.value = props.ticket.assigneeId || null;
  newProjectId.value = props.ticket.projectId || null;
};

const reassignTicket = async () => {
  try {
    reassigning.value = true;

    // Check if values have changed
    const assigneeChanged = newAssigneeId.value !== (props.ticket.assigneeId || null);
    const projectChanged = newProjectId.value !== (props.ticket.projectId || null);

    // Update assignee if changed
    if (assigneeChanged) {
      await apiClient.put(`/tickets/${props.ticket.id}/assign`, {
        assigneeId: newAssigneeId.value
      });
    }

    // Update project if changed
    if (projectChanged) {
      await apiClient.put(`/tickets/${props.ticket.id}/assign-project`, {
        projectId: newProjectId.value
      });
    }

    emit('reassigned', newAssigneeId.value);
    showReassignModal.value = false;
  } catch (error: any) {
    console.error('Error reassigning ticket:', error);
    alert(error.response?.data?.message || 'Failed to update ticket');
  } finally {
    reassigning.value = false;
  }
};

// Initialize modal values when opening
watch(showReassignModal, (isOpen) => {
  if (isOpen) {
    newAssigneeId.value = props.ticket.assigneeId || null;
    newProjectId.value = props.ticket.projectId || null;
  }
});

onMounted(() => {
  fetchAvailableUsers();
  fetchAvailableProjects();
});
</script>

<style scoped>
.team-project-panel {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  border: 1px solid var(--color-border);
  margin-bottom: var(--spacing-xl);
}

.panel-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-lg);
  color: var(--color-text-primary);
}

.panel-title svg {
  color: #667eea;
}

.info-section {
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
}

.info-section:last-of-type {
  border-bottom: none;
}

.info-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
}

.info-value {
  font-size: var(--font-size-md);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

.text-muted {
  color: var(--color-text-tertiary);
  font-style: italic;
}

.project-link {
  color: #667eea;
  text-decoration: none;
  transition: color 0.2s;
}

.project-link:hover {
  color: #5568d3;
  text-decoration: underline;
}

.project-key {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-sm);
}

.reassign-section {
  margin-top: var(--spacing-lg);
}

.btn-reassign {
  width: 100%;
  padding: var(--spacing-md);
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  transition: all 0.2s;
}

.btn-reassign:hover:not(:disabled) {
  background: #667eea;
  color: white;
}

.btn-reassign:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.reassign-modal {
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

.modal-content {
  background: white;
  padding: var(--spacing-2xl);
  border-radius: var(--radius-lg);
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
}

.modal-content h4 {
  margin-bottom: var(--spacing-lg);
  color: var(--color-text-primary);
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-group label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-xs);
  color: var(--color-text-secondary);
}

.form-select {
  width: 100%;
  padding: var(--spacing-sm);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
}

.modal-actions {
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
</style>
