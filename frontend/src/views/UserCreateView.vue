<template>
  <div class="user-create-view">
    <!-- Header Section -->
    <div class="create-header">
      <div class="header-content">
        <h1 class="page-title">
          <svg class="page-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <line x1="19" y1="8" x2="19" y2="14"/>
            <line x1="22" y1="11" x2="16" y2="11"/>
          </svg>
          Create New User
        </h1>
        <p class="page-subtitle">Add a new user to the system with appropriate permissions and details</p>
      </div>
    </div>

    <!-- Success/Error Messages -->
    <div v-if="successMessage" class="alert alert-success">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22,4 12,14.01 9,11.01"/>
      </svg>
      {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="alert alert-danger">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
      {{ errorMessage }}
    </div>

    <!-- Form Section -->
    <div class="form-section">
      <div class="form-container">
        <form @submit.prevent="createUser" class="user-form">
          <!-- Personal Information -->
          <div class="form-section-header">
            <h3>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Personal Information
            </h3>
            <p>Basic user details and contact information</p>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label for="fullName" class="form-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Full Name *
              </label>
              <input 
                type="text" 
                id="fullName" 
                class="form-control" 
                v-model="user.fullName" 
                placeholder="Enter full name"
                required
                :class="{ 'error': errors.fullName }"
              >
              <span v-if="errors.fullName" class="error-message">{{ errors.fullName }}</span>
            </div>

            <div class="form-group">
              <label for="email" class="form-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                Email Address *
              </label>
              <input 
                type="email" 
                id="email" 
                class="form-control" 
                v-model="user.email" 
                placeholder="Enter email address"
                required
                :class="{ 'error': errors.email }"
              >
              <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
            </div>

            <div class="form-group">
              <label for="phoneNumber" class="form-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                Phone Number
              </label>
              <input 
                type="tel" 
                id="phoneNumber" 
                class="form-control" 
                v-model="user.phoneNumber" 
                placeholder="Enter phone number"
              >
            </div>

            <div class="form-group">
              <label for="profilePicture" class="form-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                Profile Picture
              </label>
              <div class="profile-picture-upload">
                <div class="upload-preview" v-if="profilePicturePreview">
                  <img :src="profilePicturePreview" alt="Profile Preview" />
                  <button type="button" class="remove-image" @click="removeProfilePicture">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
                <div class="upload-area" v-else @click="triggerFileInput">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                  <p>Click to upload profile picture</p>
                  <span class="upload-hint">Max 5MB, JPG, PNG, or GIF</span>
                </div>
                <input
                  type="file"
                  ref="fileInput"
                  id="profilePictureInput"
                  @change="handleFileUpload"
                  accept="image/*"
                  class="file-input-hidden"
                >
              </div>
            </div>
          </div>

          <!-- Professional Information -->
          <div class="form-section-header">
            <h3>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
              </svg>
              Professional Information
            </h3>
            <p>Work-related details and role assignment</p>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label for="role" class="form-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Role *
              </label>
              <select 
                id="role" 
                class="form-control" 
                v-model="user.role" 
                required
                :class="{ 'error': errors.role }"
              >
                <option value="">Select a role</option>
                <option v-for="role in availableRoles" :key="role.value" :value="role.value">
                  {{ role.label }}
                </option>
              </select>
              <span v-if="errors.role" class="error-message">{{ errors.role }}</span>
              <div class="role-description">
                <p>{{ getRoleDescription(user.role) }}</p>
              </div>
            </div>

            <div class="form-group">
              <label for="designation" class="form-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                </svg>
                Designation
              </label>
              <input 
                type="text" 
                id="designation" 
                class="form-control" 
                v-model="user.designation" 
                placeholder="Enter job designation"
              >
            </div>

            <div class="form-group">
              <label for="division" class="form-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 21h18"/>
                  <path d="M5 21V7l8-4v18"/>
                  <path d="M19 21V11l-6-4"/>
                </svg>
                Division
              </label>
              <input 
                type="text" 
                id="division" 
                class="form-control" 
                v-model="user.division" 
                placeholder="Enter department/division"
              >
            </div>

            <div class="form-group">
              <label for="manager" class="form-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                Reporting Manager
              </label>
              <select id="manager" class="form-control" v-model="user.managerId">
                <option value="">Select reporting manager</option>
                <option v-for="manager in managers" :key="manager.id" :value="manager.id">
                  {{ manager.fullName }} ({{ manager.role }})
                </option>
              </select>
            </div>
          </div>

          <!-- Project Assignment -->
          <div class="form-section-header">
            <h3>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 21h18"/>
                <path d="M5 21V7l8-4v18"/>
                <path d="M19 21V11l-6-4"/>
              </svg>
              Project Assignment
            </h3>
            <p>Assign the user to one or more projects</p>
          </div>

          <div class="form-grid full-width">
            <ProjectAssignment
              v-model="user.projects"
            />
          </div>

          <!-- Security Information -->
          <div class="form-section-header">
            <h3>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <circle cx="12" cy="16" r="1"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Security Settings
            </h3>
            <p>Password and access control settings</p>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label for="password" class="form-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <circle cx="12" cy="16" r="1"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Password *
              </label>
              <div class="password-input">
                <input 
                  :type="showPassword ? 'text' : 'password'" 
                  id="password" 
                  class="form-control" 
                  v-model="user.password" 
                  placeholder="Enter password"
                  required
                  :class="{ 'error': errors.password }"
                >
                <button type="button" class="password-toggle" @click="togglePassword">
                  <svg v-if="showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>
              <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
              <div class="password-strength">
                <div class="strength-bar" :class="passwordStrength.class">
                  <div class="strength-fill" :style="{ width: passwordStrength.percentage + '%' }"></div>
                </div>
                <span class="strength-text">{{ passwordStrength.text }}</span>
              </div>
            </div>

            <div class="form-group">
              <label for="confirmPassword" class="form-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <circle cx="12" cy="16" r="1"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Confirm Password *
              </label>
              <input 
                type="password" 
                id="confirmPassword" 
                class="form-control" 
                v-model="confirmPassword" 
                placeholder="Confirm password"
                required
                :class="{ 'error': errors.confirmPassword }"
              >
              <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
            </div>

            <div class="form-group">
              <label class="form-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
                Account Status
              </label>
              <div class="status-options">
                <label class="status-option">
                  <input type="radio" v-model="user.status" value="active">
                  <span class="status-indicator active"></span>
                  <span class="status-text">Active</span>
                </label>
                <label class="status-option">
                  <input type="radio" v-model="user.status" value="inactive">
                  <span class="status-indicator inactive"></span>
                  <span class="status-text">Inactive</span>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 12l2 2 4-4"/>
                  <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
                  <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
                  <path d="M13 12h3a2 2 0 0 1 2 2v1"/>
                  <path d="M9 21v-1a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1"/>
                </svg>
                Permissions
              </label>
              <div class="permissions-grid">
                <label v-for="permission in availablePermissions" :key="permission.key" class="permission-item">
                  <input type="checkbox" v-model="user.permissions" :value="permission.key">
                  <span class="permission-text">{{ permission.label }}</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="resetForm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="1,4 1,10 7,10"/>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
              </svg>
              Reset Form
            </button>
            <button type="submit" class="btn btn-primary" :disabled="isLoading">
              <svg v-if="!isLoading" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/>
                <line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
              <div v-else class="spinner"></div>
              {{ isLoading ? 'Creating User...' : 'Create User' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import apiClient from '../api';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import ProjectAssignment from '../components/ProjectAssignment.vue';

const router = useRouter();
const authStore = useAuthStore();

const user = ref({
  fullName: '',
  email: '',
  password: '',
  role: '' as 'Super Admin' | 'Admin' | 'Manager' | 'Agent' | 'User',
  designation: '',
  division: '',
  phoneNumber: '',
  profilePicture: '',
  managerId: '',
  status: 'active' as 'active' | 'inactive',
  permissions: [] as string[],
  projects: [] as number[]
});

const confirmPassword = ref('');
const showPassword = ref(false);
const isLoading = ref(false);
const successMessage = ref('');
const errorMessage = ref('');
const errors = ref<Record<string, string>>({});
const profilePicturePreview = ref('');
const fileInput = ref<HTMLInputElement | null>(null);

// Available roles based on current user's permissions
const availableRoles = computed(() => {
  const currentUserRole = authStore.user?.role;
  const roles = [
    { value: 'User', label: 'User' },
    { value: 'Agent', label: 'Agent' },
    { value: 'Manager', label: 'Manager' }
  ];
  
  if (currentUserRole === 'Super Admin') {
    roles.push(
      { value: 'Admin', label: 'Admin' },
      { value: 'Super Admin', label: 'Super Admin' }
    );
  } else if (currentUserRole === 'Admin') {
    roles.push({ value: 'Admin', label: 'Admin' });
  }
  
  return roles;
});

// Available permissions
const availablePermissions = ref([
  { key: 'read_tickets', label: 'Read Tickets' },
  { key: 'create_tickets', label: 'Create Tickets' },
  { key: 'update_tickets', label: 'Update Tickets' },
  { key: 'delete_tickets', label: 'Delete Tickets' },
  { key: 'manage_users', label: 'Manage Users' },
  { key: 'view_reports', label: 'View Reports' },
  { key: 'manage_settings', label: 'Manage Settings' },
  { key: 'access_admin', label: 'Access Admin Panel' }
]);

// Managers list
const managers = ref<any[]>([]);

// Password strength calculation
const passwordStrength = computed(() => {
  const password = user.value.password;
  if (!password) return { class: '', percentage: 0, text: '' };
  
  let score = 0;
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 10;
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 10;
  if (/[^A-Za-z0-9]/.test(password)) score += 10;
  if (password.length >= 16) score += 20;
  if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password)) score += 10;
  
  if (score < 30) return { class: 'weak', percentage: score, text: 'Weak' };
  if (score < 60) return { class: 'medium', percentage: score, text: 'Medium' };
  if (score < 80) return { class: 'strong', percentage: score, text: 'Strong' };
  return { class: 'very-strong', percentage: score, text: 'Very Strong' };
});

// Role descriptions
const getRoleDescription = (role: string) => {
  const descriptions: Record<string, string> = {
    'Super Admin': 'Full system access with all permissions',
    'Admin': 'Administrative access to manage users and system settings',
    'Manager': 'Can manage team members and view reports',
    'Agent': 'Can handle tickets and customer interactions',
    'User': 'Basic access to view and create tickets'
  };
  return descriptions[role] || 'Select a role to see description';
};

// Form validation
const validateForm = () => {
  errors.value = {};
  
  if (!user.value.fullName.trim()) {
    errors.value.fullName = 'Full name is required';
  }
  
  if (!user.value.email.trim()) {
    errors.value.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.value.email)) {
    errors.value.email = 'Please enter a valid email address';
  }
  
  if (!user.value.role) {
    errors.value.role = 'Please select a role';
  }
  
  if (!user.value.password) {
    errors.value.password = 'Password is required';
  } else if (user.value.password.length < 8) {
    errors.value.password = 'Password must be at least 8 characters long';
  }
  
  if (!confirmPassword.value) {
    errors.value.confirmPassword = 'Please confirm your password';
  } else if (user.value.password !== confirmPassword.value) {
    errors.value.confirmPassword = 'Passwords do not match';
  }
  
  return Object.keys(errors.value).length === 0;
};

// Toggle password visibility
const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

// File upload functions
const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      errorMessage.value = 'Please select an image file.';
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      errorMessage.value = 'Image size should be less than 5MB.';
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      profilePicturePreview.value = e.target?.result as string;
      user.value.profilePicture = e.target?.result as string;
    };
    reader.readAsDataURL(file);
    errorMessage.value = '';
  }
};

const removeProfilePicture = () => {
  profilePicturePreview.value = '';
  user.value.profilePicture = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

// Create user
const createUser = async () => {
  if (!validateForm()) {
    errorMessage.value = 'Please fix the errors below';
    return;
  }
  
  isLoading.value = true;
  successMessage.value = '';
  errorMessage.value = '';
  
  try {
    const userData = {
      ...user.value,
      permissions: user.value.permissions.join(',')
    };
    
    await apiClient.post('/users', userData);
    successMessage.value = 'User created successfully!';
    
    // Reset form after successful creation
    setTimeout(() => {
      resetForm();
      router.push('/admin');
    }, 2000);
  } catch (error: any) {
    console.error('Error creating user:', error);
    errorMessage.value = error.response?.data?.message || 'Error creating user. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

// Reset form
const resetForm = () => {
  user.value = {
    fullName: '',
    email: '',
    password: '',
    role: '' as any,
    designation: '',
    division: '',
    phoneNumber: '',
    profilePicture: '',
    managerId: '',
    status: 'active',
    permissions: [],
    projects: []
  };
  confirmPassword.value = '';
  errors.value = {};
  successMessage.value = '';
  errorMessage.value = '';
};

// Load managers
const loadManagers = async () => {
  try {
    const response = await apiClient.get('/users');
    managers.value = response.data.filter((u: any) => 
      ['Manager', 'Admin', 'Super Admin'].includes(u.role)
    );
  } catch (error) {
    console.error('Error loading managers:', error);
  }
};

onMounted(() => {
  loadManagers();
});
</script>

<style scoped>
/* Main Container */
.user-create-view {
  padding: 2rem;
  background: var(--color-background);
  min-height: 100vh;
}

/* Header Section */
.create-header {
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

/* Alerts */
.alert {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-radius: 0.75rem;
  margin-bottom: 1.5rem;
  font-weight: 500;
}

.alert svg {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.alert-success {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.alert-danger {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

/* Form Section */
.form-section {
  max-width: 1000px;
  margin: 0 auto;
}

.form-container {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.user-form {
  padding: 2rem;
}

.form-section-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f3f4f6;
}

.form-section-header h3 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 0.5rem 0;
}

.form-section-header h3 svg {
  width: 1.5rem;
  height: 1.5rem;
  color: #4f46e5;
}

.form-section-header p {
  color: var(--color-text-secondary);
  margin: 0;
  font-size: 0.875rem;
}

/* Form Grid */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-grid.full-width {
  grid-template-columns: 1fr;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: var(--color-text);
  font-size: 0.875rem;
}

.form-label svg {
  width: 1rem;
  height: 1rem;
  color: #6b7280;
}

.form-control {
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  background: white;
}

.form-control:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.form-control.error {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.error-message {
  color: #dc2626;
  font-size: 0.75rem;
  font-weight: 500;
}

/* Password Input */
.password-input {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: #6b7280;
  transition: color 0.2s;
}

.password-toggle:hover {
  color: #374151;
}

.password-toggle svg {
  width: 1.25rem;
  height: 1.25rem;
}

/* Password Strength */
.password-strength {
  margin-top: 0.5rem;
}

.strength-bar {
  width: 100%;
  height: 4px;
  background: #f3f4f6;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.strength-fill {
  height: 100%;
  transition: width 0.3s, background-color 0.3s;
}

.strength-bar.weak .strength-fill {
  background: #dc2626;
}

.strength-bar.medium .strength-fill {
  background: #d97706;
}

.strength-bar.strong .strength-fill {
  background: #16a34a;
}

.strength-bar.very-strong .strength-fill {
  background: #059669;
}

.strength-text {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

/* Role Description */
.role-description {
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 0.5rem;
  border-left: 3px solid #4f46e5;
}

.role-description p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

/* Status Options */
.status-options {
  display: flex;
  gap: 1rem;
}

.status-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: background 0.2s;
}

.status-option:hover {
  background: #f8fafc;
}

.status-option input[type="radio"] {
  display: none;
}

.status-indicator {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  border: 2px solid #d1d5db;
  position: relative;
  transition: all 0.2s;
}

.status-indicator.active {
  border-color: #16a34a;
  background: #16a34a;
}

.status-indicator.inactive {
  border-color: #dc2626;
  background: #dc2626;
}

.status-indicator::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: white;
  opacity: 0;
  transition: opacity 0.2s;
}

.status-option input[type="radio"]:checked + .status-indicator::after {
  opacity: 1;
}

.status-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
}

/* Permissions Grid */
.permissions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.permission-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.permission-item:hover {
  background: #f8fafc;
  border-color: #d1d5db;
}

.permission-item input[type="checkbox"] {
  width: 1rem;
  height: 1rem;
  accent-color: #4f46e5;
}

.permission-text {
  font-size: 0.875rem;
  color: var(--color-text);
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
  margin-top: 2rem;
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
  font-size: 1rem;
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

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Spinner */
.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .user-create-view {
    padding: 1rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .permissions-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .status-options {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .page-icon {
    width: 2rem;
    height: 2rem;
  }
  
  .user-form {
    padding: 1.5rem;
  }
}

/* Profile Picture Upload */
.profile-picture-upload {
  width: 100%;
}

.upload-preview {
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 0.75rem;
  overflow: hidden;
  border: 2px solid #e5e7eb;
  background: #f9fafb;
}

.upload-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: rgba(220, 38, 38, 0.9);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  padding: 0.25rem;
}

.remove-image:hover {
  background: #dc2626;
  transform: scale(1.1);
}

.remove-image svg {
  width: 1rem;
  height: 1rem;
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  border: 2px dashed #d1d5db;
  border-radius: 0.75rem;
  background: #f9fafb;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  min-height: 150px;
}

.upload-area:hover {
  border-color: #4f46e5;
  background: #f8fafc;
}

.upload-area svg {
  width: 3rem;
  height: 3rem;
  color: #6b7280;
  margin-bottom: 0.75rem;
}

.upload-area p {
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
}

.upload-hint {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.file-input-hidden {
  display: none;
}

@media (max-width: 480px) {
  .user-form {
    padding: 1rem;
  }

  .form-section-header h3 {
    font-size: 1.25rem;
  }

  .upload-preview {
    width: 120px;
    height: 120px;
  }

  .upload-area {
    padding: 1.5rem;
    min-height: 120px;
  }

  .upload-area svg {
    width: 2.5rem;
    height: 2.5rem;
  }
}
</style>