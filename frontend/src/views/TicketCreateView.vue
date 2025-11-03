<script lang="ts">
import { Ckeditor } from '@ckeditor/ckeditor5-vue';

export default {
  components: {
    ckeditor: Ckeditor
  }
}
</script>

<template>
  <div class="ticket-create-view">
    <!-- Page Header -->
    <div class="page-header">
      <div class="page-header__content">
        <h1 class="page-header__title">Create New Ticket</h1>
        <p class="page-header__subtitle">Fill in the details below to create a support ticket</p>
      </div>
      <router-link to="/tickets" class="btn btn--outline-white">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back to Tickets
      </router-link>
    </div>

    <!-- Form Card -->
    <div class="form-card">
      <form @submit.prevent="createTicket" class="ticket-form">

        <!-- Title Field (from Complaint Category) -->
        <div class="form-group">
          <label for="categoryId" class="form-label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
            Ticket Title (Select Category)
          </label>
          <select
            class="form-select"
            :class="{ 'is-invalid': titleError }"
            id="categoryId"
            v-model.number="categoryId"
            @change="onCategoryChange"
          >
            <option :value="null">Select Ticket Category</option>
            <option v-for="cat in complaintCategories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
          <div class="error-message" v-if="titleError">
            {{ titleError }}
          </div>
        </div>

        <!-- Description Field -->
        <div class="form-group">
          <label for="description" class="form-label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
            Description
          </label>
          <ckeditor
            v-model="description"
            :editor="editor"
            :config="editorConfig"
          />
          <div class="error-message" v-if="descriptionError">
            {{ descriptionError }}
          </div>
        </div>

        <!-- Priority -->
        <div class="form-group">
          <label for="priority" class="form-label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Priority
          </label>
          <select class="form-select" id="priority" v-model="priority">
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <!-- Type and Severity Row -->
        <div class="form-row">
          <div class="form-group">
            <label for="type" class="form-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
              Type
            </label>
            <select class="form-select" id="type" v-model="type">
              <option value="Task">Task</option>
              <option value="Bug">Bug</option>
              <option value="Story">Story</option>
              <option value="Epic">Epic</option>
              <option value="Subtask">Subtask</option>
              <option value="Improvement">Improvement</option>
              <option value="New Feature">New Feature</option>
            </select>
          </div>

          <div class="form-group">
            <label for="severity" class="form-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              Severity
            </label>
            <select class="form-select" id="severity" v-model="severity">
              <option value="">None</option>
              <option value="Trivial">Trivial</option>
              <option value="Minor">Minor</option>
              <option value="Major">Major</option>
              <option value="Critical">Critical</option>
              <option value="Blocker">Blocker</option>
            </select>
          </div>
        </div>

        <!-- Project Row -->
        <div class="form-group">
          <label for="projectId" class="form-label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h7l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>
            </svg>
            Project <span class="required">*</span>
          </label>
          <select
            class="form-select"
            :class="{ 'is-invalid': projectError }"
            id="projectId"
            v-model.number="projectId"
            @change="onProjectChange"
          >
            <option :value="null">Select Project (Required)</option>
            <option v-for="project in projects" :key="project.id" :value="project.id">
              {{ project.name }} ({{ project.key }})
            </option>
          </select>
          <div class="error-message" v-if="projectError">
            {{ projectError }}
          </div>
          <small class="form-hint" v-if="projects.length === 0 && !loadingProjects">
            No projects available. Please contact your administrator.
          </small>
        </div>

        <!-- Assignee -->
        <div class="form-group">
          <label for="assigneeId" class="form-label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Assignee
          </label>
          <select class="form-select" id="assigneeId" v-model.number="assigneeId" :disabled="!projectId">
            <option :value="null">{{ projectId ? 'Select Assignee (Optional)' : 'Select a project first' }}</option>
            <option v-for="user in (projectMembers.length > 0 ? projectMembers : users)" :key="user.id" :value="user.id">
              {{ user.fullName || user.username || user.email }}
            </option>
          </select>
          <small class="form-hint" v-if="projectId && projectMembers.length > 0">
            Showing project members only
          </small>
        </div>

        <!-- File Upload Section -->
        <div class="form-group file-upload-group">
          <label class="file-upload-label">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Attach Files (Optional)
          </label>
          <input
            type="file"
            ref="fileInput"
            @change="handleFileChange"
            multiple
            class="file-input"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          <div v-if="attachedFiles.length > 0" class="file-list">
            <div v-for="(file, index) in attachedFiles" :key="index" class="file-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                <polyline points="13 2 13 9 20 9"/>
              </svg>
              <span class="file-name">{{ file.name }}</span>
              <span class="file-size">({{ formatFileSize(file.size) }})</span>
              <button type="button" @click="removeFile(index)" class="remove-file-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button type="submit" class="btn btn--primary" :disabled="isSubmitting">
            <svg v-if="!isSubmitting" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            <div v-else class="spinner"></div>
            {{ isSubmitting ? 'Creating...' : 'Create Ticket' }}
          </button>
          <router-link to="/tickets" class="btn btn--outline">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Cancel
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import apiClient from '../api';
import { useRouter } from 'vue-router';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
}

interface ComplaintCategory {
  id: number;
  name: string;
}

interface Project {
  id: number;
  name: string;
  key: string;
  status: string;
}

const categoryId = ref<number | null>(null);
const title = ref('');
const description = ref('');
const priority = ref('Medium');
const type = ref('Task');
const severity = ref('');
const dueDate = ref<string | null>(null);
const assigneeId = ref<number | null>(null);
const projectId = ref<number | null>(null);
const titleError = ref('');
const descriptionError = ref('');
const projectError = ref('');
const isSubmitting = ref(false);
const loadingProjects = ref(false);
const users = ref<User[]>([]);
const projects = ref<Project[]>([]);
const projectMembers = ref<User[]>([]);
const complaintCategories = ref<ComplaintCategory[]>([]);
const attachedFiles = ref<File[]>([]);
const fileInput = ref<HTMLInputElement | null>(null);
const router = useRouter();

// CKEditor configuration
const editor = ClassicEditor as any;
const editorConfig = {
  toolbar: [
    'heading', '|',
    'bold', 'italic', 'underline', 'strikethrough', '|',
    'link', 'imageUpload', 'blockQuote', '|',
    'bulletedList', 'numberedList', '|',
    'insertTable', '|',
    'undo', 'redo'
  ]
};

const onCategoryChange = () => {
  // Set title to selected category name
  if (categoryId.value) {
    const selectedCategory = complaintCategories.value.find(cat => cat.id === categoryId.value);
    if (selectedCategory) {
      title.value = selectedCategory.name;
    }
  } else {
    title.value = '';
  }
};

const onProjectChange = async () => {
  // Fetch project members when project is selected
  projectError.value = '';
  assigneeId.value = null; // Reset assignee
  projectMembers.value = [];

  if (projectId.value) {
    try {
      const response = await apiClient.get(`/projects/${projectId.value}/members`);
      projectMembers.value = response.data.map((pm: any) => pm.user);
    } catch (error) {
      console.error('Error fetching project members:', error);
    }
  }
};

// Fetch data on component mount
onMounted(async () => {
  try {
    loadingProjects.value = true;

    // Fetch all required data in parallel
    const [usersRes, projectsRes, categoriesRes] = await Promise.all([
      apiClient.get('/users'),
      apiClient.get('/projects/my-projects'), // Fetch only user's assigned projects
      apiClient.get('/complaint-categories')
    ]);

    users.value = usersRes.data;
    projects.value = projectsRes.data;
    complaintCategories.value = categoriesRes.data;

    // Auto-select project if user has only one
    if (projects.value.length === 1) {
      projectId.value = projects.value[0].id;
      await onProjectChange();
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    projectError.value = 'Failed to load projects. Please refresh the page.';
  } finally {
    loadingProjects.value = false;
  }
});

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    attachedFiles.value = Array.from(target.files);
  }
};

const removeFile = (index: number) => {
  attachedFiles.value.splice(index, 1);
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const validateForm = () => {
  titleError.value = '';
  descriptionError.value = '';
  projectError.value = '';
  let isValid = true;

  if (!categoryId.value) {
    titleError.value = 'Please select a ticket category.';
    isValid = false;
  }

  if (!description.value) {
    descriptionError.value = 'Description is required.';
    isValid = false;
  }

  if (!projectId.value) {
    projectError.value = 'Project is required. Please select a project.';
    isValid = false;
  }

  return isValid;
};

const createTicket = async () => {
  if (!validateForm()) {
    return;
  }

  isSubmitting.value = true;

  try {
    const formData = new FormData();
    formData.append('title', title.value);
    formData.append('description', description.value);
    formData.append('priority', priority.value);
    formData.append('category', categoryId.value?.toString() || '');
    formData.append('type', type.value);

    if (severity.value) {
      formData.append('severity', severity.value);
    }

    if (dueDate.value) {
      formData.append('dueDate', dueDate.value);
    }

    if (assigneeId.value) {
      formData.append('assigneeId', assigneeId.value.toString());
    }

    if (projectId.value) {
      formData.append('projectId', projectId.value.toString());
    }

    // Append files if any
    attachedFiles.value.forEach((file) => {
      formData.append('files', file);
    });

    await apiClient.post('/tickets', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    router.push('/tickets');
  } catch (error: any) {
    console.error('Error creating ticket', error);
    if (error.response && error.response.data && error.response.data.message) {
      titleError.value = error.response.data.message;
    } else {
      titleError.value = 'An unexpected error occurred.';
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
/* General Styles */
.ticket-create-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-xl);
  min-height: 100vh;
  background-color: var(--color-background);
}

/* Page Header */
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

.page-header__title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-black);
  margin-bottom: var(--spacing-sm);
  text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
  letter-spacing: -0.025em;
}

.page-header__subtitle {
  font-size: var(--font-size-lg);
  opacity: 0.95;
  font-weight: 400;
  letter-spacing: 0.01em;
  margin: 0;
}

.btn--outline-white {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.5);
  color: white;
  backdrop-filter: blur(10px);
  z-index: 1;
}

.btn--outline-white:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: white;
  color: white;
}

/* Form Card */
.form-card {
  background: var(--color-surface);
  border-radius: var(--radius-2xl);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  padding: var(--spacing-3xl);
  border: 1px solid var(--color-border);
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

/* Form Styles */
.ticket-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.form-label {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  letter-spacing: 0.025em;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.form-label svg {
  color: #667eea;
}

.form-control,
.form-select {
  padding: var(--spacing-md) var(--spacing-lg);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--color-surface);
  color: var(--color-text-primary);
}

.form-control:focus,
.form-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  outline: none;
}

.form-control.is-invalid {
  border-color: #ef4444;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-xl);
}

.error-message {
  color: #ef4444;
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-xs);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: var(--spacing-md);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-border);
}

.btn {
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--radius-lg);
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.025em;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  cursor: pointer;
  font-size: var(--font-size-base);
}

.btn--primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn--primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #5568d3 0%, #63408b 100%);
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -5px rgba(102, 126, 234, 0.4);
}

.btn--primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.btn--outline {
  background: transparent;
  border: 2px solid var(--color-border);
  color: var(--color-text-primary);
}

.btn--outline:hover {
  background: var(--color-surface-hover);
  border-color: #667eea;
  color: #667eea;
}

/* Spinner */
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Form Hints */
.form-hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  margin-top: var(--spacing-xs);
  font-style: italic;
  display: block;
}

/* Required Field Indicator */
.required {
  color: #ef4444;
  margin-left: 0.25rem;
}

/* CKEditor Customization */
:deep(.ck-editor__editable) {
  min-height: 300px;
  max-height: 500px;
}

:deep(.ck.ck-toolbar) {
  border-top-left-radius: var(--radius-lg);
  border-top-right-radius: var(--radius-lg);
  background: var(--color-surface-soft);
}

:deep(.ck.ck-editor__main > .ck-editor__editable) {
  background: var(--color-surface);
  border-bottom-left-radius: var(--radius-lg);
  border-bottom-right-radius: var(--radius-lg);
}

/* File Upload Section */
.file-upload-group {
  margin-top: var(--spacing-xl);
}

.file-upload-label {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-sm);
  cursor: pointer;
}

.file-upload-label svg {
  color: #667eea;
}

.file-input {
  display: block;
  width: 100%;
  padding: var(--spacing-md);
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: var(--font-size-sm);
}

.file-input:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.file-list {
  margin-top: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.file-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
}

.file-item svg {
  color: #667eea;
  flex-shrink: 0;
}

.file-name {
  flex: 1;
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
}

.remove-file-btn {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: var(--spacing-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.remove-file-btn:hover {
  background: rgba(239, 68, 68, 0.1);
}

/* Responsive Design */
@media (max-width: 768px) {
  .ticket-create-view {
    padding: var(--spacing-md);
  }

  .page-header {
    flex-direction: column;
    gap: var(--spacing-lg);
    padding: var(--spacing-xl);
    align-items: flex-start;
  }

  .page-header__title {
    font-size: var(--font-size-2xl);
  }

  .form-card {
    padding: var(--spacing-xl);
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .page-header__title {
    font-size: var(--font-size-xl);
  }

  .form-card {
    padding: var(--spacing-lg);
  }
}
</style>
