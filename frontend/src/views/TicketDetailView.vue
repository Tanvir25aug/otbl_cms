<template>
  <div class="ticket-detail-view">
    <div v-if="ticket">
      <!-- Page Header -->
      <div class="page-header">
        <div class="page-header__content">
          <div class="ticket-header">
            <div class="ticket-id-badge">#{{ ticket.id }}</div>
            <h1 class="ticket-title">{{ ticket.title }}</h1>
          </div>
          <div class="ticket-meta">
            <div class="meta-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              Created {{ formatDate(ticket.createdAt) }}
            </div>
            <div class="meta-item" v-if="ticket.assigneeId">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Assigned to: {{ ticket.assignee?.fullName || ticket.assignee?.email || 'Unassigned' }}
            </div>
          </div>
        </div>

        <!-- Header Actions with Export Options -->
        <div class="header-actions">
          <ExportOptions :ticketId="ticket.id" />
          <router-link to="/tickets" class="btn btn--outline-white">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Tickets
          </router-link>
        </div>
      </div>

      <!-- Status Workflow Component -->
      <StatusWorkflow
        :ticket="ticket"
        :canChangeStatus="canChangeStatus"
        @statusChanged="handleStatusChange"
      />

      <!-- Info Cards -->
      <div class="info-cards">
        <div class="info-card status-card">
          <div class="info-card__icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
            </svg>
          </div>
          <div class="info-card__content">
            <div class="info-card__label">Status</div>
            <span class="status-badge" :class="`status-badge--${ticket.status?.toLowerCase().replace(' ', '-')}`">
              {{ ticket.status }}
            </span>
          </div>
        </div>

        <div class="info-card priority-card">
          <div class="info-card__icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div class="info-card__content">
            <div class="info-card__label">Priority</div>
            <span class="priority-badge" :class="`priority-badge--${ticket.priority?.toLowerCase()}`">
              {{ ticket.priority }}
            </span>
          </div>
        </div>

        <div class="info-card project-card">
          <div class="info-card__icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h7l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>
            </svg>
          </div>
          <div class="info-card__content">
            <div class="info-card__label">Project</div>
            <span class="project-badge">{{ ticket.project?.name || 'General' }}</span>
          </div>
        </div>

        <div class="info-card type-card">
          <div class="info-card__icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          </div>
          <div class="info-card__content">
            <div class="info-card__label">Type</div>
            <span class="type-badge">{{ ticket.type || 'Task' }}</span>
          </div>
        </div>

        <div class="info-card creator-card">
          <div class="info-card__icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div class="info-card__content">
            <div class="info-card__label">Created By</div>
            <span class="creator-badge">{{ ticket.reporter?.fullName || ticket.reporter?.email || 'Unknown' }}</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions Component -->
      <QuickActions
        :ticket="ticket"
        @actionComplete="handleQuickAction"
      />

      <!-- Description Card -->
      <div class="content-card description-card">
        <div class="content-card__header">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10,9 9,9 8,9"/>
          </svg>
          <h2>Description</h2>
        </div>
        <div class="content-card__body">
          <div v-html="ticket.description"></div>

          <!-- Ticket Attachments -->
          <div v-if="ticket.attachments && ticket.attachments.length > 0" class="attachments-section">
            <h3 class="attachments-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
              </svg>
              Attachments ({{ ticket.attachments.length }})
            </h3>
            <div class="attachments-grid">
              <a
                v-for="attachment in ticket.attachments"
                :key="attachment.id"
                :href="getAttachmentUrl(attachment.filePath)"
                target="_blank"
                class="attachment-card"
              >
                <div class="attachment-icon">
                  <svg v-if="isImage(attachment.mimeType)" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <svg v-else-if="isPDF(attachment.mimeType)" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="9" y1="15" x2="15" y2="15"/>
                    <line x1="9" y1="11" x2="15" y2="11"/>
                  </svg>
                  <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                    <polyline points="13 2 13 9 20 9"/>
                  </svg>
                </div>
                <div class="attachment-info">
                  <div class="attachment-name">{{ attachment.originalName || attachment.fileName }}</div>
                  <div class="attachment-meta">
                    <span>{{ formatFileSize(attachment.fileSize) }}</span>
                    <span>•</span>
                    <span>{{ formatDate(attachment.createdAt) }}</span>
                  </div>
                </div>
                <div class="attachment-download">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Two Column Layout: Main Content & Sidebar -->
      <div class="ticket-content-grid">
        <!-- Left Column: Main Content -->
        <div class="ticket-main-content">
          <!-- Comments Section -->
          <div class="content-card comments-card">
        <div class="content-card__header">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <h2>Comments ({{ comments.length }})</h2>
        </div>

        <div class="content-card__body">
          <!-- Comments List -->
          <div v-if="comments.length > 0" class="comments-list">
            <div v-for="comment in comments" :key="comment.id" class="comment-item">
              <div class="comment-avatar">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div class="comment-content">
                <div class="comment-header">
                  <span class="comment-author">{{ comment.User?.email || 'Unknown User' }}</span>
                  <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
                </div>
                <div class="comment-body" v-html="comment.content"></div>

                <!-- Comment Attachments -->
                <div v-if="comment.attachments && comment.attachments.length > 0" class="comment-attachments">
                  <div class="comment-attachments-header">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                    </svg>
                    <span>{{ comment.attachments.length }} attachment{{ comment.attachments.length > 1 ? 's' : '' }}</span>
                  </div>
                  <div class="comment-attachments-list">
                    <a
                      v-for="attachment in comment.attachments"
                      :key="attachment.id"
                      :href="getAttachmentUrl(attachment.filePath)"
                      target="_blank"
                      class="comment-attachment-item"
                    >
                      <div class="comment-attachment-icon">
                        <svg v-if="isImage(attachment.mimeType)" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                        <svg v-else-if="isPDF(attachment.mimeType)" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                        </svg>
                        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                          <polyline points="13 2 13 9 20 9"/>
                        </svg>
                      </div>
                      <span class="comment-attachment-name">{{ attachment.originalName || attachment.fileName }}</span>
                      <span class="comment-attachment-size">{{ formatFileSize(attachment.fileSize) }}</span>
                      <svg class="comment-attachment-download" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-comments">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <p>No comments yet. Be the first to comment!</p>
          </div>

          <!-- Add Comment -->
          <div v-if="ticket.status !== 'Closed'" class="add-comment-section">
            <h3 class="add-comment-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add a Comment
            </h3>
            <ckeditor
              v-model="commentContent"
              :editor="editor"
              :config="editorConfig"
              class="comment-editor"
            />

            <!-- File Upload Section -->
            <div class="file-upload-section">
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
                ref="commentFileInput"
                @change="handleCommentFileChange"
                multiple
                class="file-input"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              <div v-if="commentFiles.length > 0" class="file-list">
                <div v-for="(file, index) in commentFiles" :key="index" class="file-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                    <polyline points="13 2 13 9 20 9"/>
                  </svg>
                  <span class="file-name">{{ file.name }}</span>
                  <span class="file-size">({{ formatFileSize(file.size) }})</span>
                  <button type="button" @click="removeCommentFile(index)" class="remove-file-btn">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div class="error-message" v-if="commentError">
              {{ commentError }}
            </div>
            <button @click="addComment" class="btn btn--primary" :disabled="isSubmitting">
              <svg v-if="!isSubmitting" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
              <div v-else class="spinner"></div>
              {{ isSubmitting ? 'Posting...' : 'Post Comment' }}
            </button>
          </div>
          <div v-else class="closed-notice">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <span>Ticket is closed. No new comments can be added.</span>
          </div>
        </div>
          </div>
        </div>

        <!-- Right Column: Sidebar -->
        <div class="ticket-sidebar">
          <!-- Project & Assignment Panel -->
          <TeamProjectPanel
            :ticket="ticket"
            :canReassign="canReassign"
            @reassigned="handleReassigned"
          />

          <!-- Time Tracking -->
          <TimeTracking
            :ticketId="ticket.id"
            @timeLogged="handleTimeLogged"
          />

          <!-- Activity Timeline -->
          <ActivityTimeline
            ref="activityTimelineRef"
            :ticketId="ticket.id"
          />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else class="loading-state">
      <div class="loader"></div>
      <p>Loading ticket details...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import apiClient from '../api';
import { API_ORIGIN } from '../config';
import { useRoute, useRouter } from 'vue-router';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

// Import new ticket components
import ActivityTimeline from '../components/ticket/ActivityTimeline.vue';
import StatusWorkflow from '../components/ticket/StatusWorkflow.vue';
import QuickActions from '../components/ticket/QuickActions.vue';
import TimeTracking from '../components/ticket/TimeTracking.vue';
import TeamProjectPanel from '../components/ticket/TeamProjectPanel.vue';
import ExportOptions from '../components/ticket/ExportOptions.vue';

const ticket = ref<any>(null);
const comments = ref<any[]>([]);
const commentContent = ref('');
const commentError = ref('');
const isSubmitting = ref(false);
const commentFiles = ref<File[]>([]);
const commentFileInput = ref<HTMLInputElement | null>(null);
const route = useRoute();
const router = useRouter();
let pollingInterval: any;

// Refs for new components
const activityTimelineRef = ref<InstanceType<typeof ActivityTimeline> | null>(null);
const canChangeStatus = computed(() => true); // Adjust based on user permissions
const canReassign = computed(() => true); // Adjust based on user permissions

// CKEditor configuration
const editor = ClassicEditor as any;
const editorConfig = {
  toolbar: [
    'heading', '|',
    'bold', 'italic', '|',
    'link', 'blockQuote', '|',
    'bulletedList', 'numberedList', '|',
    'insertTable', '|',
    'undo', 'redo'
  ]
};

const formatDate = (date: string) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const fetchTicketDetails = async () => {
  try {
    const ticketResponse = await apiClient.get(`/tickets/${route.params.id}`);
    ticket.value = ticketResponse.data;

    const commentsResponse = await apiClient.get(`/tickets/${route.params.id}/comments`);
    comments.value = commentsResponse.data;
  } catch (error) {
    console.error('Error getting ticket details or comments', error);
  }
};

// Event handlers for new components
const handleStatusChange = (newStatus: string) => {
  // Refresh ticket data
  fetchTicketDetails();
  // Refresh activity timeline
  activityTimelineRef.value?.refresh();
};

const handleQuickAction = () => {
  // Refresh ticket data
  fetchTicketDetails();
  // Refresh activity timeline
  activityTimelineRef.value?.refresh();
};

const handleTimeLogged = () => {
  // Refresh activity timeline
  activityTimelineRef.value?.refresh();
};

const handleReassigned = (newAssigneeId: number | null) => {
  // Refresh ticket data
  fetchTicketDetails();
  // Refresh activity timeline
  activityTimelineRef.value?.refresh();
};

onMounted(() => {
  // Validate that the ticket ID is a number
  const ticketId = route.params.id;

  if (!ticketId || isNaN(Number(ticketId))) {
    console.error('Invalid ticket ID:', ticketId);

    // If user tried to go to /tickets/analytics, redirect to /analytics
    if (ticketId === 'analytics') {
      router.push('/analytics');
      return;
    }

    // Otherwise redirect to tickets list
    router.push('/tickets');
    return;
  }

  fetchTicketDetails();
  pollingInterval = setInterval(fetchTicketDetails, 5000);
});

onUnmounted(() => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }
});

const handleCommentFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    commentFiles.value = Array.from(target.files);
  }
};

const removeCommentFile = (index: number) => {
  commentFiles.value.splice(index, 1);
  if (commentFileInput.value) {
    commentFileInput.value.value = '';
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const getAttachmentUrl = (filePath: string): string => {
  // Extract the filename from the full path (handles both Unix and Windows paths)
  const filename = filePath.split(/[/\\]/).pop() || filePath;
  return `${API_ORIGIN}/uploads/tickets/${filename}`;
};

const isImage = (mimeType: string): boolean => {
  return mimeType?.startsWith('image/') || false;
};

const isPDF = (mimeType: string): boolean => {
  return mimeType === 'application/pdf';
};

const addComment = async () => {
  commentError.value = '';
  if (!commentContent.value.trim()) {
    commentError.value = 'Comment cannot be empty.';
    return;
  }

  isSubmitting.value = true;

  try {
    const formData = new FormData();
    formData.append('content', commentContent.value);

    // Append files if any
    commentFiles.value.forEach((file) => {
      formData.append('files', file);
    });

    const response = await apiClient.post(`/tickets/${route.params.id}/comments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    comments.value.push(response.data);
    commentContent.value = '';
    commentFiles.value = [];
    if (commentFileInput.value) {
      commentFileInput.value.value = '';
    }
  } catch (error) {
    console.error('Error adding comment', error);
    commentError.value = 'Failed to add comment.';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
/* General Styles */
.ticket-detail-view {
  max-width: 1400px;
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
  align-items: flex-start;
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
  flex: 1;
}

.ticket-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
}

.ticket-id-badge {
  background: rgba(255, 255, 255, 0.3);
  color: white;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-lg);
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  backdrop-filter: blur(10px);
}

.ticket-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-black);
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
  letter-spacing: -0.025em;
}

.ticket-meta {
  display: flex;
  gap: var(--spacing-xl);
  font-size: var(--font-size-sm);
  opacity: 0.95;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.btn--outline-white {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.5);
  color: white;
  backdrop-filter: blur(10px);
  z-index: 1;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-lg);
  font-weight: var(--font-weight-semibold);
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn--outline-white:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: white;
  color: white;
  transform: translateY(-2px);
}

/* Info Cards */
.info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
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

.info-card {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.info-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -8px rgba(102, 126, 234, 0.3);
  border-color: #667eea;
}

.info-card__icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  color: #667eea;
}

.info-card__content {
  flex: 1;
}

.info-card__label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-badge {
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.025em;
  display: inline-block;
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
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.025em;
  display: inline-block;
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

.project-badge,
.type-badge {
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: inline-block;
}

.creator-badge {
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  display: inline-block;
}

/* Content Cards */
.content-card {
  background: var(--color-surface);
  border-radius: var(--radius-2xl);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  margin-bottom: var(--spacing-2xl);
  overflow: hidden;
  border: 1px solid var(--color-border);
  animation: fadeInUp 0.7s ease-out;
}

.content-card__header {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
  border-bottom: 2px solid rgba(102, 126, 234, 0.2);
  padding: var(--spacing-lg) var(--spacing-xl);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.content-card__header svg {
  color: #667eea;
}

.content-card__header h2 {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.content-card__body {
  padding: var(--spacing-xl);
}

/* Comments */
.comments-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
}

.comment-item {
  display: flex;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border);
  transition: all 0.3s ease;
}

.comment-item:hover {
  border-color: #667eea;
  box-shadow: 0 4px 6px -1px rgba(102, 126, 234, 0.1);
}

.comment-avatar {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.comment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
}

.comment-author {
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.comment-date {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
}

.comment-body {
  color: var(--color-text-secondary);
  line-height: 1.6;
  word-break: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
  overflow: hidden;
}

/* Comment Attachments */
.comment-attachments {
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background: rgba(102, 126, 234, 0.03);
  border-radius: var(--radius-md);
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.comment-attachments-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-sm);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.comment-attachments-header svg {
  color: #667eea;
}

.comment-attachments-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.comment-attachment-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
  text-decoration: none;
  color: inherit;
  font-size: var(--font-size-sm);
}

.comment-attachment-item:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
  transform: translateX(4px);
}

.comment-attachment-icon {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.comment-attachment-name {
  flex: 1;
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.comment-attachment-size {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  flex-shrink: 0;
}

.comment-attachment-download {
  color: #667eea;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.comment-attachment-item:hover .comment-attachment-download {
  color: #764ba2;
  transform: translateY(2px);
}

.empty-comments {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-3xl);
  color: var(--color-text-tertiary);
  text-align: center;
}

.empty-comments svg {
  opacity: 0.3;
  margin-bottom: var(--spacing-lg);
}

.empty-comments p {
  margin: 0;
  font-size: var(--font-size-lg);
}

.add-comment-section {
  margin-top: var(--spacing-2xl);
  padding-top: var(--spacing-2xl);
  border-top: 2px solid var(--color-border);
}

.add-comment-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.add-comment-title svg {
  color: #667eea;
}

.btn {
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--radius-lg);
  font-weight: var(--font-weight-semibold);
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
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
}

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

.error-message {
  color: #ef4444;
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.closed-notice {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius-lg);
  color: #991b1b;
  margin-top: var(--spacing-2xl);
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: var(--spacing-lg);
}

.loader {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(102, 126, 234, 0.2);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* CKEditor */
.comment-editor {
  margin-bottom: var(--spacing-lg);
}

/* File Upload Section */
.file-upload-section {
  margin-bottom: var(--spacing-lg);
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

/* Attachments Section */
.attachments-section {
  margin-top: var(--spacing-2xl);
  padding-top: var(--spacing-xl);
  border-top: 2px solid var(--color-border);
}

.attachments-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-lg);
}

.attachments-title svg {
  color: #667eea;
}

.attachments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-md);
}

.attachment-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;
}

.attachment-card:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
}

.attachment-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.attachment-info {
  flex: 1;
  min-width: 0;
}

.attachment-name {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: var(--spacing-xs);
}

.attachment-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.attachment-download {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: rgba(102, 126, 234, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.attachment-card:hover .attachment-download {
  background: #667eea;
  color: white;
}

:deep(.ck-editor__editable) {
  min-height: 200px;
  max-height: 400px;
  border-radius: var(--radius-lg);
}

:deep(.ck.ck-toolbar) {
  border-top-left-radius: var(--radius-lg);
  border-top-right-radius: var(--radius-lg);
  background: var(--color-surface-soft);
}

/* Table Styling */
:deep(.content-card__body table) {
  border-collapse: collapse;
  width: 100%;
  margin: var(--spacing-md) 0;
}

:deep(.content-card__body table td),
:deep(.content-card__body table th) {
  border: 1px solid var(--color-border);
  padding: var(--spacing-sm);
  min-width: 50px;
}

:deep(.content-card__body table th) {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  font-weight: var(--font-weight-semibold);
}

/* Two-column grid layout */
.ticket-content-grid {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: var(--spacing-xl);
  margin-top: var(--spacing-xl);
}

.ticket-main-content {
  min-width: 0; /* Prevents grid overflow */
}

.ticket-sidebar {
  position: sticky;
  top: var(--spacing-xl);
  align-self: start;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .ticket-content-grid {
    grid-template-columns: 1fr;
  }

  .ticket-sidebar {
    position: static;
    max-height: none;
  }
}

@media (max-width: 768px) {
  .ticket-detail-view {
    padding: var(--spacing-md);
  }

  .page-header {
    flex-direction: column;
    gap: var(--spacing-lg);
    padding: var(--spacing-xl);
  }

  .ticket-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .ticket-title {
    font-size: var(--font-size-2xl);
  }

  .ticket-meta {
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .info-cards {
    grid-template-columns: 1fr;
  }

  .comment-item {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .ticket-title {
    font-size: var(--font-size-xl);
  }
}
</style>
