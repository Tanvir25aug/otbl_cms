<template>
  <div class="admin-dashboard">
    <!-- Header Section -->
    <div class="admin-header">
      <div class="header-content">
        <h1 class="page-title">
          <svg class="page-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          Admin Dashboard
        </h1>
        <p class="page-subtitle">Manage users, system settings, and monitor activities</p>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="stats-grid">
      <div class="stat-card total-users">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div class="stat-content">
          <h3>{{ stats.totalUsers }}</h3>
          <p>Total Users</p>
        </div>
      </div>
      
      <div class="stat-card active-users">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
        </div>
        <div class="stat-content">
          <h3>{{ stats.activeUsers }}</h3>
          <p>Active Users</p>
        </div>
      </div>
      
      <div class="stat-card total-tickets">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
          </svg>
        </div>
        <div class="stat-content">
          <h3>{{ stats.totalTickets }}</h3>
          <p>Total Tickets</p>
        </div>
      </div>
      
      <div class="stat-card system-health">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
        </div>
        <div class="stat-content">
          <h3>{{ stats.systemHealth }}%</h3>
          <p>System Health</p>
        </div>
      </div>
    </div>

    <!-- Action Bar -->
    <div class="action-bar">
      <div class="action-group">
        <router-link to="/users/create" class="btn btn-primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <line x1="19" y1="8" x2="19" y2="14"/>
            <line x1="22" y1="11" x2="16" y2="11"/>
          </svg>
          Create User
        </router-link>
        <button class="btn btn-secondary" @click="exportUsers">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export Users
        </button>
        <button class="btn btn-outline" @click="refreshData">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="1,4 1,10 7,10"/>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
          </svg>
          Refresh
        </button>
      </div>
      
      <div class="search-group">
        <div class="input-with-icon">
          <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input 
            type="text" 
            class="form-control" 
            placeholder="Search users..." 
            v-model="searchQuery"
            @input="filterUsers"
          >
        </div>
        <select class="form-control" v-model="roleFilter" @change="filterUsers">
          <option value="">All Roles</option>
          <option v-for="role in roles" :key="role" :value="role">{{ role }}</option>
        </select>
      </div>
    </div>

    <!-- Users Table -->
    <div class="table-section">
      <div class="table-header">
        <div>
          <h3>User Management</h3>
          <p class="results-count">{{ filteredUsers.length }} users found</p>
        </div>
      </div>
      <div class="table-container">
        <table class="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading" class="loading-row">
              <td colspan="5" class="text-center">
                <div class="loading-spinner">
                  <div class="spinner-ring"></div>
                  <div class="spinner-ring"></div>
                  <div class="spinner-ring"></div>
                </div>
                <p>Loading users...</p>
              </td>
            </tr>
            <tr v-else-if="paginatedUsers.length === 0" class="no-data-row">
              <td colspan="5" class="text-center">
                <svg class="no-data-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <p>No users found</p>
              </td>
            </tr>
            <tr v-else v-for="user in paginatedUsers" :key="user.id" class="user-row">
              <td>
                <div class="user-info">
                  <div class="user-avatar">
                    <img v-if="user.profilePicture" :src="user.profilePicture" :alt="user.fullName">
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <div class="user-details">
                    <h4>{{ user.fullName }}</h4>
                    <p>{{ user.email }}</p>
                  </div>
                </div>
              </td>
              <td>
                <span class="role-badge" :class="getRoleClass(user.role)">
                  {{ user.role }}
                </span>
              </td>
              <td>
                <button
                  v-if="canEdit(user)"
                  @click="toggleStatus(user)"
                  class="status-btn"
                  :class="getStatusClass(user.status)"
                >
                  {{ user.status }}
                </button>
                <span v-else class="status-badge" :class="getStatusClass(user.status)">
                  {{ user.status }}
                </span>
              </td>
              <td class="last-login">{{ formatDate(user.lastLogin) }}</td>
              <td class="actions-cell">
                <div class="action-buttons">
                  <button
                    v-if="canEdit(user)"
                    @click.stop="editUser(user)"
                    class="btn btn-sm btn-outline"
                  >
                    Edit
                  </button>
                  <button
                    v-if="canEdit(user)"
                    @click.stop="openProjectsModal(user)"
                    class="btn btn-sm btn-primary"
                  >
                    Projects
                  </button>
                  <button
                    v-if="canEdit(user)"
                    @click.stop="handleDeleteUser(user.id)"
                    class="btn btn-sm btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination" v-if="totalPages > 1">
        <button
          class="btn btn-outline"
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
        >
          Previous
        </button>
        <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
        <button
          class="btn btn-outline"
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Complaint Category Management -->
    <div class="table-section mt-8">
      <div class="table-header">
        <h3>Complaint Category Management</h3>
        <div class="table-actions">
          <button class="btn btn-primary" @click.stop="openCategoryModal">Add Category</button>
        </div>
      </div>
      <div class="table-container">
        <table class="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="category in complaintCategories" :key="category.id">
              <td>{{ category.name }}</td>
              <td class="actions-cell">
                <div class="action-buttons">
                  <button @click.stop="editCategory(category)" class="btn btn-sm btn-outline">Edit</button>
                  <button @click.stop="deleteCategory(category.id)" class="btn btn-sm btn-danger">Delete</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>

  <!-- Create/Edit Category Modal -->
  <Teleport to="body">
    <div
      v-if="showCategoryModal"
      class="modal-overlay category-modal-overlay"
      @click.self="closeCategoryModal"
      :style="{
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }"
    >
      <div class="modal category-modal" @click.stop :style="{
        background: '#ffffff',
        color: '#000000',
        position: 'relative',
        zIndex: 10001
      }">
        <div class="modal-header">
          <h3>{{ editingCategory ? 'Edit' : 'Add' }} Category</h3>
          <button class="btn btn-ghost" @click.stop="closeCategoryModal">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveCategory">
            <div class="form-group">
              <label>Category Name</label>
              <input type="text" class="form-control" v-model="categoryForm.name" required>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click.stop="closeCategoryModal">Cancel</button>
          <button class="btn btn-primary" @click.stop="saveCategory">Save</button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Edit User Modal -->
  <Teleport to="body">
    <div
      v-if="showEditUserModal"
      class="modal-overlay edit-user-modal-overlay"
      @click.self="closeEditModal"
      :style="{
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        zIndex: '10001',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.5)'
      }"
    >
      <div class="modal edit-user-modal" @click.stop :style="{
        background: '#ffffff',
        color: '#000000',
        position: 'relative',
        zIndex: '10002',
        display: 'block',
        visibility: 'visible',
        opacity: '1'
      }">
        <div class="modal-header">
          <h3>Edit User</h3>
          <button class="btn btn-ghost" @click="closeEditModal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="updateUserHandler" v-if="editingUser">
            <div class="form-group">
              <label>Full Name</label>
              <input type="text" class="form-control" v-model="editingUser.fullName" required>
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" class="form-control" v-model="editingUser.email" required>
            </div>
            <div class="form-group">
              <label>Role</label>
              <select class="form-control" v-model="editingUser.role" required>
                <option v-for="role in roles" :key="role" :value="role">{{ role }}</option>
              </select>
            </div>
          </form>
          <div v-else style="padding: 2rem; text-align: center; color: red;">
            <p>ERROR: No user data loaded!</p>
            <p>editingUser is: {{ editingUser }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeEditModal">Cancel</button>
          <button class="btn btn-primary" @click="updateUserHandler" :disabled="isCreating">
            {{ isCreating ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Project Assignment Modal -->
  <Teleport to="body">
    <div
      v-if="showProjectsModal"
      class="modal-overlay projects-modal-overlay"
      @click.self="closeProjectsModal"
      :style="{
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        zIndex: '10003',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.5)'
      }"
    >
      <div class="modal projects-modal" @click.stop :style="{
        background: '#ffffff',
        color: '#000000',
        position: 'relative',
        zIndex: '10004',
        maxWidth: '700px',
        width: '90%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '1rem',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }">
        <div class="modal-header" style="display: flex; justify-content: space-between; align-items: flex-start; padding: 1.5rem 2rem; border-bottom: 1px solid #e5e7eb;">
          <div>
            <h3 style="font-size: 1.25rem; font-weight: 600; color: var(--color-text); margin: 0 0 0.25rem 0;">
              Manage Project Assignment
            </h3>
            <p v-if="projectsUser" class="modal-subtitle" style="font-size: 0.875rem; color: var(--color-text-secondary); margin: 0;">
              Assign projects for {{ projectsUser.fullName }}
            </p>
          </div>
          <button class="btn btn-ghost" @click="closeProjectsModal" style="padding: 0.5rem; background: transparent; border: none; cursor: pointer; color: #6b7280;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 1.25rem; height: 1.25rem;">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body" style="padding: 2rem; overflow-y: auto; flex: 1;">
          <ProjectAssignment
            v-if="projectsUser"
            v-model="selectedProjects"
            :disabled="isAssigningProjects"
          />
        </div>
        <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 1rem; padding: 1.5rem 2rem; border-top: 1px solid #e5e7eb;">
          <button class="btn btn-secondary" @click="closeProjectsModal" :disabled="isAssigningProjects">
            Cancel
          </button>
          <button class="btn btn-primary" @click="saveProjectAssignments" :disabled="isAssigningProjects">
            {{ isAssigningProjects ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import api from '@/api';
import { getUsers, updateUser, deleteUser, createUser, type UserData } from '../api';
import { useAuthStore } from '../stores/auth';
import ProjectAssignment from '../components/ProjectAssignment.vue';

// Complaint Categories
interface ComplaintCategory {
  id: number;
  name: string;
}

const complaintCategories = ref<ComplaintCategory[]>([]);
const showCategoryModal = ref(false);
const editingCategory = ref<ComplaintCategory | null>(null);
const categoryForm = ref({ name: '' });

const fetchComplaintCategories = async () => {
  try {
    const response = await api.get('/complaint-categories');
    complaintCategories.value = response.data;
  } catch (error) {
    console.error('Failed to fetch complaint categories', error);
  }
};

const openCategoryModal = () => {
  showCategoryModal.value = true;
};

const closeCategoryModal = () => {
  showCategoryModal.value = false;
  editingCategory.value = null;
  categoryForm.value = { name: '' };
};

const editCategory = (category: ComplaintCategory) => {
  editingCategory.value = category;
  categoryForm.value.name = category.name;
  showCategoryModal.value = true;
};

const saveCategory = async () => {
  try {
    if (editingCategory.value) {
      await api.put(`/complaint-categories/${editingCategory.value.id}`, categoryForm.value);
    } else {
      await api.post('/complaint-categories', categoryForm.value);
    }
    fetchComplaintCategories();
    closeCategoryModal();
  } catch (error) {
    console.error('Failed to save category', error);
  }
};

const deleteCategory = async (id: number) => {
  if (confirm('Are you sure you want to delete this category?')) {
    try {
      await api.delete(`/complaint-categories/${id}`);
      fetchComplaintCategories();
    } catch (error) {
      console.error('Failed to delete category', error);
    }
  }
};


const auth = useAuthStore();
const users = ref<User[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const searchQuery = ref('');
const roleFilter = ref('');
const isCreating = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);

const editingUser = ref<User | null>(null);
const showEditUserModal = ref(false);

// Project assignment modal state
const showProjectsModal = ref(false);
const projectsUser = ref<User | null>(null);
const selectedProjects = ref<number[]>([]);
const isAssigningProjects = ref(false);

const roles: UserData['role'][] = ['Super Admin', 'Admin', 'Manager', 'Agent', 'User'];

interface User {
  id: number;
  fullName: string;
  email: string;
  role: 'Super Admin' | 'Admin' | 'Manager' | 'Agent' | 'User';
  status: 'active' | 'inactive';
  profilePicture?: string;
  lastLogin?: string;
}

// Statistics
const stats = ref({
  totalUsers: 0,
  activeUsers: 0,
  totalTickets: 0,
  systemHealth: 95
});

// Computed properties
const filteredUsers = computed(() => {
  let filtered = users.value;
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(user => 
      user.fullName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  }
  
  if (roleFilter.value) {
    filtered = filtered.filter(user => user.role === roleFilter.value);
  }
  
  return filtered;
});

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredUsers.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredUsers.value.length / pageSize.value);
});

const fetchUsers = async () => {
  loading.value = true;
  try {
    const response = await getUsers();
    users.value = response.data;

    // Update statistics
    stats.value.totalUsers = users.value.length;
    stats.value.activeUsers = users.value.filter(u => u.status === 'active').length;
  } catch (err: any) {
    error.value = err.message;
    console.error(`Error fetching users:`, err);
  } finally {
    loading.value = false;
  }
};

const fetchTicketStats = async () => {
  try {
    const response = await api.get('/tickets');
    stats.value.totalTickets = response.data.length || 0;
  } catch (err: any) {
    console.error('Error fetching ticket stats:', err);
    stats.value.totalTickets = 0;
  }
};

const handleUserUpdate = async (userId: number, data: Partial<UserData>) => {
  try {
    const response = await updateUser(userId, data);
    const index = users.value.findIndex(u => u.id === userId);
    if (index !== -1) {
      users.value.splice(index, 1, response.data);
    }
  } catch (err: any) {
    console.error(`Error updating user:`, err);
    // Here you might want to show an error message to the user
  }
};

const handleRoleChange = (user: User, event: Event) => {
  const newRole = (event.target as HTMLSelectElement).value as NonNullable<UserData['role']>;
  handleUserUpdate(user.id, { role: newRole });
};

const toggleStatus = (user: User) => {
  const newStatus = user.status === 'active' ? 'inactive' : 'active';
  handleUserUpdate(user.id, { status: newStatus });
};

const handleDeleteUser = async (userId: number) => {
  if (confirm('Are you sure you want to delete this user?')) {
    try {
      await deleteUser(userId);
      users.value = users.value.filter(u => u.id !== userId);
    } catch (err: any) {
      console.error(`Error deleting user:`, err);
      // Here you might want to show an error message to the user
    }
  }
};

const canEdit = (user: User) => {
  if (!auth.user) return false;
  if (auth.user.role === 'Super Admin') {
    return auth.user.id !== user.id;
  }
  if (auth.user.role === 'Admin') {
    return auth.user.id !== user.id && !['Super Admin', 'Admin'].includes(user.role);
  }
  return false;
};

// New functions
const filterUsers = () => {
  currentPage.value = 1; // Reset to first page when filtering
};

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const refreshData = () => {
  fetchUsers();
  fetchTicketStats();
  fetchComplaintCategories();
};

const exportUsers = () => {
  // Mock export functionality
  const csvContent = "data:text/csv;charset=utf-8," +
    "Name,Email,Role,Status\n" +
    users.value.map(user =>
      `${user.fullName},${user.email},${user.role},${user.status}`
    ).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "users.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const openEditModal = (user: User) => {
  console.log('=== openEditModal called ===');
  console.log('User data:', user);
  editingUser.value = { ...user };
  console.log('editingUser.value set to:', editingUser.value);
  showEditUserModal.value = true;
  console.log('showEditUserModal.value set to:', showEditUserModal.value);

  // Check DOM after Vue updates
  setTimeout(() => {
    console.log('=== Checking all modals in DOM ===');
    console.log('showEditUserModal:', showEditUserModal.value);
    console.log('showCategoryModal:', showCategoryModal.value);

    const allOverlays = document.querySelectorAll('.modal-overlay');
    console.log('Total modal overlays found:', allOverlays.length);
    allOverlays.forEach((overlay, index) => {
      console.log(`Overlay ${index}:`, overlay.className, 'z-index:', window.getComputedStyle(overlay).zIndex);
    });

    const modalElement = document.querySelector('.edit-user-modal-overlay');
    console.log('Edit modal overlay exists in DOM:', !!modalElement);
    if (modalElement) {
      const styles = window.getComputedStyle(modalElement);
      console.log('Modal display:', styles.display);
      console.log('Modal visibility:', styles.visibility);
      console.log('Modal opacity:', styles.opacity);
      console.log('Modal z-index:', styles.zIndex);
      console.log('Modal position:', styles.position);

      const modalContent = document.querySelector('.edit-user-modal');
      console.log('Edit modal content exists:', !!modalContent);
      if (modalContent) {
        console.log('Modal content display:', window.getComputedStyle(modalContent).display);
      }
    } else {
      console.error('Edit modal overlay NOT found in DOM!');
    }
  }, 100);
};

const closeEditModal = () => {
  console.log('=== closeEditModal called ===');
  console.trace('Stack trace for closeEditModal:');
  showEditUserModal.value = false;
  editingUser.value = null;
};

const updateUserHandler = async () => {
  if (!editingUser.value) return;
  isCreating.value = true;
  try {
    await handleUserUpdate(editingUser.value.id, editingUser.value);
    closeEditModal();
  } catch (err: any) {
    console.error('Error updating user:', err);
  } finally {
    isCreating.value = false;
  }
};

const editUser = (user: User) => {
  openEditModal(user);
};

// Project assignment modal functions
const openProjectsModal = async (user: User) => {
  projectsUser.value = user;
  showProjectsModal.value = true;

  // Fetch user's current project assignments
  try {
    const memberResponse = await api.get(`/users/${user.id}/projects`);
    selectedProjects.value = memberResponse.data.map((p: any) => p.id);
  } catch (error) {
    console.error('Error fetching user projects:', error);
    selectedProjects.value = [];
  }
};

const closeProjectsModal = () => {
  showProjectsModal.value = false;
  projectsUser.value = null;
  selectedProjects.value = [];
};

const saveProjectAssignments = async () => {
  if (!projectsUser.value) return;

  isAssigningProjects.value = true;
  try {
    // Call backend API to update user's project assignments
    await api.put(`/users/${projectsUser.value.id}/projects`, {
      projectIds: selectedProjects.value
    });

    alert('Project assignments updated successfully!');
    closeProjectsModal();
  } catch (error: any) {
    console.error('Error saving project assignments:', error);
    alert(error.response?.data?.message || 'Error saving project assignments. Please try again.');
  } finally {
    isAssigningProjects.value = false;
  }
};

const getRoleClass = (role: string) => {
  switch (role) {
    case 'Super Admin':
      return 'role-super-admin';
    case 'Admin':
      return 'role-admin';
    case 'Manager':
      return 'role-manager';
    case 'Agent':
      return 'role-agent';
    default:
      return 'role-user';
  }
};

const getStatusClass = (status: string) => {
  return status === 'active' ? 'status-active' : 'status-inactive';
};

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { 
    year: 'numeric', 
    month: 'short', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(async () => {
  await fetchUsers();
  await fetchComplaintCategories();
  await fetchTicketStats();
});

// Debug watcher
watch(showEditUserModal, (newVal, oldVal) => {
  console.log('=== showEditUserModal changed ===');
  console.log('Old value:', oldVal);
  console.log('New value:', newVal);
  console.log('editingUser:', editingUser.value);
}, { immediate: true });
</script>

<style>
/* Main Container */
.admin-dashboard {
  padding: 2rem;
  background: var(--color-background);
  min-height: 100vh;
}

/* Header Section */
.admin-header {
  margin-bottom: 2rem;
}

.header-content {
  text-align: center;
}

.page-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.page-icon {
  width: 2.5rem;
  height: 2.5rem;
  color: #4f46e5;
}

.page-subtitle {
  color: var(--color-text-secondary);
  font-size: 1.1rem;
  margin: 0;
}

/* Statistics Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-card.total-users .stat-icon {
  background: #eff6ff;
  color: #2563eb;
}

.stat-card.active-users .stat-icon {
  background: #dcfce7;
  color: #16a34a;
}

.stat-card.total-tickets .stat-icon {
  background: #fef3c7;
  color: #d97706;
}

.stat-card.system-health .stat-icon {
  background: #fce7f3;
  color: #be185d;
}

.stat-icon svg {
  width: 1.5rem;
  height: 1.5rem;
}

.stat-content h3 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: var(--color-text);
}

.stat-content p {
  margin: 0;
  color: var(--color-text-secondary);
  font-weight: 500;
}

/* Action Bar */
.action-bar {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.action-group {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-group {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.input-with-icon {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: var(--color-text-secondary);
  pointer-events: none;
}

.input-with-icon .form-control {
  padding-left: 2.5rem;
}

/* Table Section */
.table-section {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.table-header h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.results-count {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.table-container {
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table thead {
  background: #f8fafc;
}

.users-table th {
  padding: 1rem 1.5rem;
  text-align: left;
  font-weight: 600;
  color: var(--color-text);
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}

.users-table td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}

.user-row:hover {
  background: #f8fafc;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  overflow: hidden;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-avatar svg {
  width: 1.25rem;
  height: 1.25rem;
  color: #6b7280;
}

.user-details h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 0.25rem 0;
}

.user-details p {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.role-select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: white;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.role-super-admin {
  background: #fef3c7;
  color: #92400e;
}

.role-admin {
  background: #dbeafe;
  color: #1e40af;
}

.role-manager {
  background: #dcfce7;
  color: #166534;
}

.role-agent {
  background: #e0e7ff;
  color: #3730a3;
}

.role-user {
  background: #f3f4f6;
  color: #374151;
}

.status-btn, .status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.status-btn:hover {
  transform: scale(1.05);
}

.status-active {
  background: #dcfce7;
  color: #166534;
}

.status-inactive {
  background: #fef2f2;
  color: #991b1b;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.last-login {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.text-center {
  text-align: center;
}

.loading-row, .no-data-row {
  height: 200px;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  gap: 0.25rem;
  margin-bottom: 1rem;
}

.spinner-ring {
  width: 0.5rem;
  height: 0.5rem;
  background: #4f46e5;
  border-radius: 50%;
  animation: bounce 1.4s ease-in-out infinite both;
}

.spinner-ring:nth-child(1) { animation-delay: -0.32s; }
.spinner-ring:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.no-data-icon {
  width: 3rem;
  height: 3rem;
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid #e5e7eb;
}

.page-info {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

/* Modal */
.modal-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  min-height: 100vh !important;
  background: rgba(0, 0, 0, 0.5) !important;
  backdrop-filter: blur(4px);
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  z-index: 10000 !important;
  animation: fadeIn 0.2s ease-out;
  overflow-y: auto;
  padding: 20px;
}

.category-modal-overlay {
  visibility: visible !important;
  opacity: 1 !important;
  pointer-events: all !important;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal {
  background: white !important;
  border-radius: 1rem;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: slideUp 0.3s ease-out;
  position: relative;
  z-index: 10001;
}

.category-modal {
  background: #ffffff !important;
  color: #000000 !important;
  visibility: visible !important;
  opacity: 1 !important;
  display: block !important;
}

.category-modal * {
  visibility: visible !important;
  color: inherit;
}

.category-modal .modal-header h3,
.category-modal .modal-body label,
.category-modal .modal-body input {
  color: #000000 !important;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.modal-subtitle {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0.25rem 0 0 0;
  font-weight: 400;
}

.modal-body {
  padding: 2rem;
  max-height: 60vh;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid #e5e7eb;
}

/* Form Elements */
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.btn svg {
  width: 1.25rem;
  height: 1.25rem;
}

.btn-primary {
  background: #4f46e5;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #4338ca;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #4b5563;
}

.btn-outline {
  background: transparent;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.btn-outline:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-danger {
  background: #dc2626;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #b91c1c;
}

.btn-ghost {
  background: transparent;
  color: #6b7280;
  padding: 0.5rem;
}

.btn-ghost:hover:not(:disabled) {
  background: #f3f4f6;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Utility Classes */
.mt-8 {
  margin-top: 2rem;
}

.actions-cell {
  white-space: nowrap;
}

.table-actions {
  display: flex;
  gap: 0.5rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .admin-dashboard {
    padding: 1rem;
  }
  
  .action-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-group {
    flex-direction: column;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .page-icon {
    width: 2rem;
    height: 2rem;
  }
  
  .users-table {
  font-size: 0.875rem;
  }
  
  .users-table th,
  .users-table td {
    padding: 0.75rem 1rem;
  }
  
  .modal {
    width: 95%;
    margin: 1rem;
  }
}
</style>