<template>
  <div class="manager-dashboard">
    <!-- Header Section -->
    <div class="manager-header">
      <div class="header-content">
        <h1 class="page-title">
          <svg class="page-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          Manager Dashboard
        </h1>
        <p class="page-subtitle">Manage projects, tickets, and complaints</p>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
          </svg>
        </div>
        <div class="stat-content">
          <h3>{{ stats.totalProjects }}</h3>
          <p>Active Projects</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
          </svg>
        </div>
        <div class="stat-content">
          <h3>{{ stats.activeTickets }}</h3>
          <p>Active Tickets</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <div class="stat-content">
          <h3>{{ stats.pendingComplaints }}</h3>
          <p>Pending Complaints</p>
        </div>
      </div>
    </div>

    <!-- Tabs Navigation -->
    <div class="tabs-container">
      <div class="tabs">
        <button class="tab" :class="{ active: activeTab === 'projects' }" @click="activeTab = 'projects'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
          </svg>
          Projects
        </button>
        <button class="tab" :class="{ active: activeTab === 'tickets' }" @click="activeTab = 'tickets'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
          </svg>
          Tickets
        </button>
        <button class="tab" :class="{ active: activeTab === 'complaints' }" @click="activeTab = 'complaints'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          Complaints
        </button>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- Projects Tab -->
      <div v-if="activeTab === 'projects'" class="table-section">
        <div class="table-header">
          <div>
            <h3>Projects</h3>
            <p class="results-count">{{ projects.length }} projects</p>
          </div>
          <div class="table-actions">
            <button class="btn btn-primary" @click="openCreateProjectModal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Create Project
            </button>
          </div>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Created By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loadingProjects" class="loading-row">
                <td colspan="5" class="text-center">
                  <div class="loading-spinner">
                    <div class="spinner-ring"></div>
                  </div>
                  <p>Loading projects...</p>
                </td>
              </tr>
              <tr v-else-if="projects.length === 0" class="no-data-row">
                <td colspan="5" class="text-center">
                  <p>No projects found. Create your first project!</p>
                </td>
              </tr>
              <tr v-else v-for="project in projects" :key="project.id" class="data-row">
                <td><strong>{{ project.name }}</strong></td>
                <td>{{ project.description || 'No description' }}</td>
                <td>
                  <span class="status-badge" :class="getProjectStatusClass(project.status)">
                    {{ project.status }}
                  </span>
                </td>
                <td>{{ project.creator?.fullName || 'Unknown' }}</td>
                <td>
                  <div class="action-buttons">
                    <button class="btn btn-sm btn-secondary" @click="viewProject(project)" title="View Details">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    </button>
                    <button class="btn btn-sm btn-danger" @click="deleteProject(project)" title="Delete">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tickets Tab (existing implementation) -->
      <div v-if="activeTab === 'tickets'" class="table-section">
        <div class="table-header">
          <div>
            <h3>Tickets</h3>
            <p class="results-count">{{ filteredTickets.length }} tickets</p>
          </div>
          <div class="table-actions">
            <select class="form-control" v-model="ticketStatusFilter" @change="filterTickets">
              <option value="">All Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>
        <div class="table-container">
          <table class="data-table">
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
              <tr v-if="loadingTickets" class="loading-row">
                <td colspan="6" class="text-center">
                  <div class="loading-spinner"><div class="spinner-ring"></div></div>
                  <p>Loading tickets...</p>
                </td>
              </tr>
              <tr v-else-if="filteredTickets.length === 0" class="no-data-row">
                <td colspan="6" class="text-center"><p>No tickets found</p></td>
              </tr>
              <tr v-else v-for="ticket in filteredTickets" :key="ticket.id" class="data-row">
                <td>#{{ ticket.id }}</td>
                <td>{{ ticket.title }}</td>
                <td><span class="status-badge" :class="getStatusClass(ticket.status)">{{ ticket.status }}</span></td>
                <td><span class="priority-badge" :class="getPriorityClass(ticket.priority)">{{ ticket.priority }}</span></td>
                <td>{{ ticket.assignee?.fullName || 'Unassigned' }}</td>
                <td>
                  <button class="btn btn-sm btn-primary" @click="openAssignModal(ticket)">Assign</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Complaints Tab (existing implementation) -->
      <div v-if="activeTab === 'complaints'" class="table-section">
        <div class="table-header">
          <div>
            <h3>Complaints</h3>
            <p class="results-count">{{ filteredComplaints.length }} complaints</p>
          </div>
          <div class="table-actions">
            <select class="form-control" v-model="complaintStatusFilter" @change="filterComplaints">
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Close">Closed</option>
            </select>
          </div>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Category</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loadingComplaints" class="loading-row">
                <td colspan="6" class="text-center">
                  <div class="loading-spinner"><div class="spinner-ring"></div></div>
                  <p>Loading complaints...</p>
                </td>
              </tr>
              <tr v-else-if="filteredComplaints.length === 0" class="no-data-row">
                <td colspan="6" class="text-center"><p>No complaints found</p></td>
              </tr>
              <tr v-else v-for="complaint in filteredComplaints" :key="complaint.id" class="data-row">
                <td>#{{ complaint.id }}</td>
                <td>{{ complaint.customerId }}</td>
                <td>{{ complaint.category || 'N/A' }}</td>
                <td><span class="status-badge" :class="getStatusClass(complaint.status)">{{ complaint.status }}</span></td>
                <td><span class="priority-badge" :class="getPriorityClass(complaint.priority)">{{ complaint.priority }}</span></td>
                <td>
                  <button class="btn btn-sm btn-primary" @click="openAssignComplaintModal(complaint)">Assign</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <!-- Create Project Modal -->
  <Teleport to="body">
    <div
      v-if="showCreateProjectModal"
      class="modal-overlay create-project-modal-overlay"
      @click.self="closeCreateProjectModal"
      :style="{
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        width: '100%',
        height: '100%',
        zIndex: '10000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.6)'
      }"
    >
      <div class="modal" @click.stop :style="{ display: 'flex', flexDirection: 'column', visibility: 'visible', opacity: '1' }">
        <div class="modal-header">
          <h3>Create New Project</h3>
          <button class="btn btn-ghost" @click="closeCreateProjectModal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Project Name *</label>
            <input type="text" class="form-control" v-model="newProject.name" placeholder="Enter project name" required>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea class="form-control" v-model="newProject.description" placeholder="Enter project description" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>Status</label>
            <select class="form-control" v-model="newProject.status">
              <option value="Active">Active</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeCreateProjectModal">Cancel</button>
          <button class="btn btn-primary" @click="createProject" :disabled="!newProject.name">Create Project</button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Assign Ticket Modal (existing) -->
  <Teleport to="body">
    <div
      v-if="showAssignTicketModal"
      class="modal-overlay assign-ticket-modal-overlay"
      @click.self="closeAssignTicketModal"
      :style="{
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        width: '100%',
        height: '100%',
        zIndex: '10004',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.6)'
      }"
    >
      <div class="modal" @click.stop :style="{ display: 'flex', flexDirection: 'column', visibility: 'visible', opacity: '1' }">
        <div class="modal-header">
          <h3>Assign Ticket</h3>
          <button class="btn btn-ghost" @click="closeAssignTicketModal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Ticket: {{ selectedTicket?.title }}</label>
          </div>
          <div class="form-group">
            <label>Assign To</label>
            <select class="form-control" v-model="assignTicketTo" required>
              <option value="">Select User</option>
              <option v-for="user in availableUsers" :key="user.id" :value="user.id">{{ user.fullName }}</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeAssignTicketModal">Cancel</button>
          <button class="btn btn-primary" @click="assignTicket" :disabled="!assignTicketTo">Assign</button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Assign Complaint Modal (existing) -->
  <Teleport to="body">
    <div
      v-if="showAssignComplaintModal"
      class="modal-overlay assign-complaint-modal-overlay"
      @click.self="closeAssignComplaintModal"
      :style="{
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        width: '100%',
        height: '100%',
        zIndex: '10005',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.6)'
      }"
    >
      <div class="modal" @click.stop :style="{ display: 'flex', flexDirection: 'column', visibility: 'visible', opacity: '1' }">
        <div class="modal-header">
          <h3>Assign Complaint</h3>
          <button class="btn btn-ghost" @click="closeAssignComplaintModal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Complaint ID: {{ selectedComplaint?.id }}</label>
            <label>Customer: {{ selectedComplaint?.customerId }}</label>
          </div>
          <div class="form-group">
            <label>Assign To</label>
            <select class="form-control" v-model="assignComplaintTo" required>
              <option value="">Select User</option>
              <option v-for="user in availableUsers.filter(u => u.role === 'Agent')" :key="user.id" :value="user.id">
                {{ user.fullName }}
              </option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeAssignComplaintModal">Cancel</button>
          <button class="btn btn-primary" @click="assignComplaint" :disabled="!assignComplaintTo">Assign</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import api from '@/api';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const activeTab = ref('projects');

// Loading states
const loadingProjects = ref(true);
const loadingTickets = ref(true);
const loadingComplaints = ref(true);

// Data
const projects = ref<any[]>([]);
const tickets = ref<any[]>([]);
const complaints = ref<any[]>([]);
const availableUsers = ref<any[]>([]);

// Filters
const ticketStatusFilter = ref('');
const complaintStatusFilter = ref('');

// Modals
const showCreateProjectModal = ref(false);
const showAssignTicketModal = ref(false);
const showAssignComplaintModal = ref(false);

// Selected items
const selectedTicket = ref<any>(null);
const selectedComplaint = ref<any>(null);

// Form data
const newProject = ref({
  name: '',
  description: '',
  status: 'Active'
});

const assignTicketTo = ref('');
const assignComplaintTo = ref('');

// Stats
const stats = ref({
  totalProjects: 0,
  activeTickets: 0,
  pendingComplaints: 0
});

const filteredTickets = computed(() => {
  if (!ticketStatusFilter.value) return tickets.value;
  return tickets.value.filter(t => t.status === ticketStatusFilter.value);
});

const filteredComplaints = computed(() => {
  if (!complaintStatusFilter.value) return complaints.value;
  return complaints.value.filter(c => c.status === complaintStatusFilter.value);
});

// Fetch functions
const fetchProjects = async () => {
  loadingProjects.value = true;
  try {
    const response = await api.get('/projects');
    projects.value = Array.isArray(response.data) ? response.data : (response.data.rows || []);
    stats.value.totalProjects = projects.value.filter(p => p.status === 'Active').length;
  } catch (error) {
    console.error('Error fetching projects:', error);
    projects.value = [];
  } finally {
    loadingProjects.value = false;
  }
};

const fetchTickets = async () => {
  loadingTickets.value = true;
  try {
    const response = await api.get('/tickets');
    tickets.value = Array.isArray(response.data) ? response.data : (response.data.rows || []);
    stats.value.activeTickets = tickets.value.filter(t => t.status !== 'Closed').length;
  } catch (error) {
    console.error('Error fetching tickets:', error);
    tickets.value = [];
  } finally {
    loadingTickets.value = false;
  }
};

const fetchComplaints = async () => {
  loadingComplaints.value = true;
  try {
    const response = await api.get('/complaints');
    complaints.value = Array.isArray(response.data) ? response.data : (response.data.rows || []);
    stats.value.pendingComplaints = complaints.value.filter(c => c.status !== 'Close').length;
  } catch (error) {
    console.error('Error fetching complaints:', error);
    complaints.value = [];
  } finally {
    loadingComplaints.value = false;
  }
};

const fetchAvailableUsers = async () => {
  try {
    const response = await api.get('/users');
    availableUsers.value = Array.isArray(response.data) ? response.data : (response.data.rows || []);
  } catch (error) {
    console.error('Error fetching users:', error);
    availableUsers.value = [];
  }
};

// Modal functions - Projects
const openCreateProjectModal = () => {
  newProject.value = { name: '', description: '', status: 'Active' };
  showCreateProjectModal.value = true;
};

const closeCreateProjectModal = () => {
  showCreateProjectModal.value = false;
};

const createProject = async () => {
  try {
    await api.post('/projects', newProject.value);
    await fetchProjects();
    closeCreateProjectModal();
  } catch (error: any) {
    console.error('Error creating project:', error);
    alert(error.response?.data?.message || 'Failed to create project');
  }
};

const viewProject = (project: any) => {
  alert(`Viewing project: ${project.name}\n\nDescription: ${project.description}\nStatus: ${project.status}`);
};

const deleteProject = async (project: any) => {
  if (!confirm(`Are you sure you want to delete project "${project.name}"?`)) return;

  try {
    await api.delete(`/projects/${project.id}`);
    await fetchProjects();
  } catch (error: any) {
    console.error('Error deleting project:', error);
    alert(error.response?.data?.message || 'Failed to delete project');
  }
};

// Ticket assignment
const openAssignModal = (ticket: any) => {
  selectedTicket.value = ticket;
  assignTicketTo.value = ticket.assigneeId || '';
  showAssignTicketModal.value = true;
};

const closeAssignTicketModal = () => {
  showAssignTicketModal.value = false;
  selectedTicket.value = null;
  assignTicketTo.value = '';
};

const assignTicket = async () => {
  if (!selectedTicket.value || !assignTicketTo.value) return;

  try {
    await api.put(`/tickets/${selectedTicket.value.id}`, { assigneeId: assignTicketTo.value });
    await fetchTickets();
    closeAssignTicketModal();
  } catch (error) {
    console.error('Error assigning ticket:', error);
    alert('Failed to assign ticket');
  }
};

// Complaint assignment
const openAssignComplaintModal = (complaint: any) => {
  selectedComplaint.value = complaint;
  assignComplaintTo.value = '';
  showAssignComplaintModal.value = true;
};

const closeAssignComplaintModal = () => {
  showAssignComplaintModal.value = false;
  selectedComplaint.value = null;
  assignComplaintTo.value = '';
};

const assignComplaint = async () => {
  if (!selectedComplaint.value || !assignComplaintTo.value) return;

  try {
    await api.put(`/complaints/${selectedComplaint.value.id}`, { assignedTo: assignComplaintTo.value });
    await fetchComplaints();
    closeAssignComplaintModal();
  } catch (error) {
    console.error('Error assigning complaint:', error);
    alert('Failed to assign complaint');
  }
};

// Filter functions
const filterTickets = () => {
  // Computed property handles this
};

const filterComplaints = () => {
  // Computed property handles this
};

// Helper functions
const getProjectStatusClass = (status: string) => {
  const map: any = {
    'Active': 'status-active',
    'Completed': 'status-resolved',
    'On Hold': 'status-pending',
    'Cancelled': 'status-closed'
  };
  return map[status] || '';
};

const getStatusClass = (status: string) => {
  const map: any = {
    'Open': 'status-open',
    'In Progress': 'status-in-progress',
    'Resolved': 'status-resolved',
    'Closed': 'status-closed',
    'Pending': 'status-pending',
    'Close': 'status-closed'
  };
  return map[status] || '';
};

const getPriorityClass = (priority: string) => {
  const map: any = {
    'Low': 'priority-low',
    'Medium': 'priority-medium',
    'High': 'priority-high',
    'Critical': 'priority-critical'
  };
  return map[priority] || '';
};

const getRoleClass = (role: string) => {
  const map: any = {
    'Super Admin': 'role-super-admin',
    'Admin': 'role-admin',
    'Manager': 'role-manager',
    'Agent': 'role-agent',
    'User': 'role-user'
  };
  return map[role] || '';
};

const formatDate = (date: string) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString();
};

// Initialize
onMounted(() => {
  fetchProjects();
  fetchTickets();
  fetchComplaints();
  fetchAvailableUsers();
});
</script>

<style scoped>
/* Keep all existing styles from the original file */
.manager-dashboard {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.manager-header {
  margin-bottom: 2rem;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.page-icon {
  width: 2rem;
  height: 2rem;
  color: #4f46e5;
}

.page-subtitle {
  margin-top: 0.5rem;
  color: #6b7280;
  font-size: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon svg {
  width: 1.75rem;
  height: 1.75rem;
  color: white;
}

.stat-content h3 {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.stat-content p {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0.25rem 0 0 0;
}

.tabs-container {
  background: white;
  border-radius: 12px 12px 0 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 1.5rem 0;
  border-bottom: 2px solid #f3f4f6;
}

.tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  color: #6b7280;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.tab svg {
  width: 1.25rem;
  height: 1.25rem;
}

.tab:hover {
  color: #4f46e5;
  background: #f9fafb;
}

.tab.active {
  color: #4f46e5;
  border-bottom-color: #4f46e5;
}

.tab-content {
  background: white;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.table-section {
  padding: 1.5rem;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.table-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.results-count {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0.25rem 0 0 0;
}

.table-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.table-container {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background: #f9fafb;
}

.data-table th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.875rem;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.data-table tbody tr {
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.2s;
}

.data-table tbody tr:hover {
  background: #f9fafb;
}

.data-table td {
  padding: 1rem;
  font-size: 0.875rem;
  color: #1f2937;
}

.loading-row, .no-data-row {
  text-align: center;
}

.loading-spinner {
  display: inline-flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  padding: 1rem;
}

.spinner-ring {
  width: 12px;
  height: 12px;
  border: 3px solid transparent;
  border-top-color: #667eea;
  border-right-color: #764ba2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-ring:nth-child(2) {
  animation-delay: 0.15s;
  border-top-color: #764ba2;
  border-right-color: #667eea;
}

.spinner-ring:nth-child(3) {
  animation-delay: 0.3s;
  border-top-color: #667eea;
  border-right-color: #764ba2;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

.loading-row p, .no-data-row p {
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
}

.modal-body .loading-row td,
.modal-body .no-data-row td {
  padding: 3rem 1rem;
}

.modal-body .loading-spinner {
  justify-content: center;
}

.btn {
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  font-size: 0.875rem;
  letter-spacing: 0.025em;
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.btn:active::before {
  width: 300px;
  height: 300px;
}

.btn svg {
  width: 1rem;
  height: 1rem;
  transition: transform 0.3s ease;
}

.btn:hover svg {
  transform: scale(1.1);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 6px rgba(102, 126, 234, 0.25);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-primary:disabled {
  background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
  cursor: not-allowed;
  opacity: 0.6;
  transform: none;
  box-shadow: none;
}

.btn-secondary {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  color: white;
  box-shadow: 0 4px 6px rgba(107, 114, 128, 0.25);
}

.btn-secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(107, 114, 128, 0.4);
}

.btn-secondary:active {
  transform: translateY(0);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 4px 6px rgba(239, 68, 68, 0.25);
}

.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(239, 68, 68, 0.4);
}

.btn-danger:active {
  transform: translateY(0);
}

.btn-sm {
  padding: 0.5rem 0.875rem;
  font-size: 0.8125rem;
  border-radius: 8px;
}

.btn-ghost {
  background: transparent;
  color: #6b7280;
  padding: 0.5rem;
}

.btn-ghost:hover {
  background: rgba(243, 244, 246, 0.8);
  color: #1f2937;
}

.btn-ghost svg {
  width: 1.25rem;
  height: 1.25rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.status-badge, .priority-badge, .role-badge {
  padding: 0.375rem 0.875rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.status-badge:hover, .priority-badge:hover, .role-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.status-active {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #065f46;
  border: 1px solid #6ee7b7;
}

.status-inactive {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
  border: 1px solid #fca5a5;
}

.status-open {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
  border: 1px solid #93c5fd;
}

.status-in-progress {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
  border: 1px solid #fcd34d;
}

.status-resolved {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #065f46;
  border: 1px solid #6ee7b7;
}

.status-closed {
  background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
  color: #374151;
  border: 1px solid #9ca3af;
}

.status-pending {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
  border: 1px solid #fcd34d;
}

.priority-low {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
  border: 1px solid #93c5fd;
}

.priority-medium {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
  border: 1px solid #fcd34d;
}

.priority-high {
  background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%);
  color: #9a3412;
  border: 1px solid #fb923c;
}

.priority-critical {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
  border: 1px solid #fca5a5;
}

.role-super-admin {
  background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);
  color: #831843;
  border: 1px solid #f9a8d4;
}

.role-admin {
  background: linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%);
  color: #5b21b6;
  border: 1px solid #a78bfa;
}

.role-manager {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
  border: 1px solid #93c5fd;
}

.role-agent {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #065f46;
  border: 1px solid #6ee7b7;
}

.role-user {
  background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
  color: #374151;
  border: 1px solid #9ca3af;
}

.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  background: #f9fafb;
  font-family: inherit;
}

.form-control:hover {
  border-color: #d1d5db;
  background: white;
}

.form-control:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.form-control::placeholder {
  color: #9ca3af;
}

textarea.form-control {
  resize: vertical;
  min-height: 80px;
}

select.form-control {
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.75rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
  appearance: none;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #374151;
  font-size: 0.875rem;
  letter-spacing: 0.025em;
}

.form-group label::after {
  content: '';
  display: inline-block;
  width: 4px;
  height: 4px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  margin-left: 4px;
  vertical-align: middle;
}

.modal-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  z-index: 10000;
  padding: 1rem;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal {
  background: white;
  border-radius: 16px;
  max-width: 540px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: slideUp 0.3s ease-out;
  display: flex !important;
  flex-direction: column !important;
  position: relative;
  margin: 0 !important;
}

.modal-large {
  max-width: 960px;
  width: 90%;
}

.modal-header {
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.modal-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.1) 75%, transparent 75%, transparent);
  background-size: 50px 50px;
  opacity: 0.1;
  pointer-events: none;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  position: relative;
  z-index: 1;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.modal-header .btn-ghost {
  color: white;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  transition: all 0.2s;
  position: relative;
  z-index: 1;
}

.modal-header .btn-ghost:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

.modal-body {
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
}

.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #5568d3 0%, #6a4190 100%);
}

/* Enhanced table styles for modals */
.modal-body .data-table {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.modal-body .data-table thead {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.modal-body .data-table th {
  color: white;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  padding: 1rem;
  border: none;
}

.modal-body .data-table tbody tr {
  transition: all 0.2s ease;
}

.modal-body .data-table tbody tr:hover {
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  transform: scale(1.01);
}

.modal-body .user-info {
  padding: 0.5rem 0;
}

.modal-body .user-details h4 {
  font-weight: 600;
  color: #1f2937;
}

.modal-body .user-details p {
  color: #6b7280;
  font-size: 0.75rem;
}

.modal-footer {
  padding: 1.5rem 2rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-avatar svg {
  width: 1.5rem;
  height: 1.5rem;
  color: #9ca3af;
}

.user-details h4 {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
}

.user-details p {
  margin: 0.125rem 0 0 0;
  font-size: 0.75rem;
  color: #6b7280;
}

.text-center {
  text-align: center;
}
</style>
