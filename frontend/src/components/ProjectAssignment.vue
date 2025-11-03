<template>
  <div class="project-assignment">
    <div class="assignment-header">
      <label class="form-label">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 21h18"/>
          <path d="M5 21V7l8-4v18"/>
          <path d="M19 21V11l-6-4"/>
        </svg>
        Assign Projects {{ required ? '*' : '' }}
      </label>
      <p class="assignment-description">
        Select one or more projects to assign to this user
      </p>
    </div>

    <div class="project-selection">
      <!-- Select All Option -->
      <div class="project-item select-all">
        <label class="checkbox-wrapper">
          <input
            type="checkbox"
            :checked="isAllSelected"
            @change="toggleSelectAll"
            :disabled="loading || disabled"
          />
          <span class="checkbox-label">
            <span class="project-name">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 1rem; height: 1rem;">
                <path d="M3 21h18"/>
                <path d="M5 21V7l8-4v18"/>
                <path d="M19 21V11l-6-4"/>
              </svg>
              Select All Projects
            </span>
            <span class="project-info">
              {{ projects.length }} total projects
            </span>
          </span>
        </label>
      </div>

      <div class="divider"></div>

      <!-- Individual Project Selection -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading projects...</p>
      </div>

      <div v-else-if="projects.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 21h18"/>
          <path d="M5 21V7l8-4v18"/>
          <path d="M19 21V11l-6-4"/>
        </svg>
        <p>No projects available</p>
      </div>

      <div v-else class="project-list">
        <div
          v-for="project in projects"
          :key="project.id"
          class="project-item"
          :class="{ disabled: disabled }"
        >
          <label class="checkbox-wrapper">
            <input
              type="checkbox"
              :value="project.id"
              :checked="selectedProjects.includes(project.id)"
              @change="toggleProject(project.id)"
              :disabled="disabled"
            />
            <span class="checkbox-label">
              <span class="project-name">
                <span class="project-key" :style="{ background: getProjectColor(project.key) }">
                  {{ project.key }}
                </span>
                {{ project.name }}
              </span>
              <span class="project-info">
                <span v-if="project.status" class="project-status" :class="getStatusClass(project.status)">
                  {{ project.status }}
                </span>
                <span v-if="project.description" class="project-description">
                  {{ truncateText(project.description, 50) }}
                </span>
              </span>
            </span>
          </label>
        </div>
      </div>
    </div>

    <!-- Selected Projects Summary -->
    <div v-if="selectedProjects.length > 0" class="selected-summary">
      <div class="summary-header">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 12l2 2 4-4"/>
          <circle cx="12" cy="12" r="10"/>
        </svg>
        <span>{{ selectedProjects.length }} {{ selectedProjects.length === 1 ? 'project' : 'projects' }} selected</span>
      </div>
      <div class="selected-projects">
        <span
          v-for="projectId in selectedProjects"
          :key="projectId"
          class="selected-badge"
        >
          {{ getProjectName(projectId) }}
          <button
            type="button"
            class="remove-badge"
            @click="removeProject(projectId)"
            :disabled="disabled"
          >
            ×
          </button>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import api from '@/api';

interface Project {
  id: number;
  name: string;
  key: string;
  description?: string;
  status?: string;
}

const props = defineProps<{
  modelValue: number[];
  required?: boolean;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: number[]): void;
}>();

const projects = ref<Project[]>([]);
const loading = ref(true);

const selectedProjects = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const isAllSelected = computed(() => {
  return projects.value.length > 0 &&
         selectedProjects.value.length === projects.value.length;
});

// Fetch all projects
const fetchProjects = async () => {
  loading.value = true;
  try {
    const response = await api.get('/projects');

    if (!Array.isArray(response.data)) {
      console.error('Invalid projects response');
      projects.value = [];
      return;
    }

    // Show all projects
    projects.value = response.data;
  } catch (error) {
    console.error('Error fetching projects:', error);
    projects.value = [];
  } finally {
    loading.value = false;
  }
};

// Toggle select all
const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedProjects.value = [];
  } else {
    selectedProjects.value = projects.value.map(p => p.id);
  }
};

// Toggle individual project
const toggleProject = (projectId: number) => {
  const index = selectedProjects.value.indexOf(projectId);
  if (index > -1) {
    selectedProjects.value = selectedProjects.value.filter(id => id !== projectId);
  } else {
    selectedProjects.value = [...selectedProjects.value, projectId];
  }
};

// Remove project
const removeProject = (projectId: number) => {
  selectedProjects.value = selectedProjects.value.filter(id => id !== projectId);
};

// Get project name by ID
const getProjectName = (projectId: number) => {
  const project = projects.value.find(p => p.id === projectId);
  return project ? project.name : `Project #${projectId}`;
};

// Get project color based on key
const getProjectColor = (key: string) => {
  const colors = [
    '#4f46e5', '#7c3aed', '#db2777', '#dc2626',
    '#ea580c', '#d97706', '#16a34a', '#0891b2'
  ];
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// Get status class
const getStatusClass = (status: string) => {
  return `status-${status.toLowerCase().replace(' ', '-')}`;
};

// Truncate text
const truncateText = (text: string, length: number) => {
  return text.length > length ? text.substring(0, length) + '...' : text;
};

onMounted(() => {
  fetchProjects();
});
</script>

<style scoped>
.project-assignment {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  background: #ffffff;
  padding: 0;
}

.assignment-header {
  margin-bottom: 0.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-weight: 600;
  color: #1f2937;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.form-label svg {
  width: 1rem;
  height: 1rem;
  color: #4f46e5;
  flex-shrink: 0;
}

.assignment-description {
  margin: 0;
  font-size: 0.75rem;
  color: #6b7280;
  line-height: 1.3;
}

.project-selection {
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  background: #ffffff;
  overflow: hidden;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.select-all {
  background: #f8fafc;
  border-bottom: 2px solid #e5e7eb;
}

.select-all .project-name {
  font-weight: 600;
  color: #4f46e5;
}

.divider {
  height: 1px;
  background: #e5e7eb;
}

.project-list {
  max-height: 400px;
  overflow-y: auto;
}

.project-item {
  padding: 0.75rem 0.875rem;
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.2s;
}

.project-item:last-child {
  border-bottom: none;
}

.project-item:not(.disabled):hover {
  background: #f9fafb;
}

.project-item.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.checkbox-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
}

.checkbox-wrapper input[type="checkbox"] {
  width: 1.125rem;
  height: 1.125rem;
  accent-color: #4f46e5;
  cursor: pointer;
  margin-top: 0.125rem;
  flex-shrink: 0;
}

.checkbox-wrapper input[type="checkbox"]:disabled {
  cursor: not-allowed;
}

.checkbox-label {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  flex: 1;
}

.project-name {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-weight: 500;
  color: #1f2937;
  font-size: 0.875rem;
}

.project-key {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.125rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.6875rem;
  font-weight: 700;
  color: white;
  letter-spacing: 0.025em;
  text-transform: uppercase;
}

.project-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  font-size: 0.8125rem;
}

.project-status {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.status-active {
  background: #dcfce7;
  color: #166534;
}

.status-completed {
  background: #dbeafe;
  color: #1e40af;
}

.status-on-hold {
  background: #fef3c7;
  color: #92400e;
}

.status-cancelled {
  background: #fee2e2;
  color: #991b1b;
}

.project-description {
  color: #6b7280;
  font-size: 0.8125rem;
  line-height: 1.4;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  color: #6b7280;
}

.loading-state .spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #e5e7eb;
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state svg {
  width: 2rem;
  height: 2rem;
  color: #d1d5db;
  margin-bottom: 0.5rem;
}

.empty-state p {
  margin: 0;
  font-size: 0.9375rem;
}

.selected-summary {
  padding: 1rem;
  background: #f0f9ff;
  border: 2px solid #4f46e5;
  border-radius: 0.75rem;
  margin-top: 0.5rem;
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #4f46e5;
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
}

.summary-header svg {
  width: 0.875rem;
  height: 0.875rem;
  flex-shrink: 0;
}

.selected-projects {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.selected-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 9999px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #1f2937;
}

.remove-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.125rem;
  height: 1.125rem;
  border-radius: 50%;
  background: #ef4444;
  color: white;
  border: none;
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
}

.remove-badge:hover:not(:disabled) {
  background: #dc2626;
  transform: scale(1.1);
}

.remove-badge:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Scrollbar Styling */
.project-list::-webkit-scrollbar {
  width: 8px;
}

.project-list::-webkit-scrollbar-track {
  background: #f3f4f6;
}

.project-list::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

.project-list::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Responsive Design */
@media (max-width: 640px) {
  .project-item {
    padding: 0.75rem;
  }

  .project-name {
    font-size: 0.875rem;
  }

  .project-key {
    font-size: 0.625rem;
    padding: 0.125rem 0.375rem;
  }

  .project-list {
    max-height: 300px;
  }

  .selected-summary {
    padding: 0.75rem;
  }
}
</style>
