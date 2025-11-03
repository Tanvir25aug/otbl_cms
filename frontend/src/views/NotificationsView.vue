<template>
  <div class="notifications-view">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-title">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <h1>Notifications</h1>
          <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount }}</span>
        </div>
        <p class="header-subtitle">Stay updated with your tickets and activities</p>
      </div>
      <div class="header-actions">
        <button class="btn btn--primary" @click="markAllAsRead" :disabled="unreadCount === 0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Mark All as Read
        </button>
        <button class="btn btn--outline" @click="clearReadNotifications">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          Clear Read
        </button>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="controls-section">
      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <button
          :class="['filter-tab', { active: activeFilter === 'all' }]"
          @click="activeFilter = 'all'"
        >
          All
        </button>
        <button
          :class="['filter-tab', { active: activeFilter === 'unread' }]"
          @click="activeFilter = 'unread'"
        >
          Unread
          <span v-if="unreadCount > 0" class="tab-badge">{{ unreadCount }}</span>
        </button>
        <button
          :class="['filter-tab', { active: activeFilter === 'ticket' }]"
          @click="activeFilter = 'ticket'"
        >
          Tickets
        </button>
        <button
          :class="['filter-tab', { active: activeFilter === 'comment' }]"
          @click="activeFilter = 'comment'"
        >
          Comments
        </button>
        <button
          :class="['filter-tab', { active: activeFilter === 'assignment' }]"
          @click="activeFilter = 'assignment'"
        >
          Assignments
        </button>
        <button
          :class="['filter-tab', { active: activeFilter === 'status' }]"
          @click="activeFilter = 'status'"
        >
          Status
        </button>
      </div>

      <!-- Search Bar -->
      <div class="search-bar">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search notifications..."
          class="search-input"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loader"></div>
      <p>Loading notifications...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredNotifications.length === 0" class="empty-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      <h3>No notifications</h3>
      <p v-if="activeFilter !== 'all'">Try changing your filter or search</p>
    </div>

    <!-- Notifications List Grouped by Date -->
    <div v-else class="notifications-container">
      <div v-for="group in groupedNotifications" :key="group.label" class="notification-group">
        <h2 class="group-label">{{ group.label }}</h2>
        <div class="notifications-list">
          <div
            v-for="notif in group.notifications"
            :key="notif.id"
            :class="['notification-card', { unread: !notif.isRead }]"
            @click="handleNotificationClick(notif)"
          >
            <!-- Icon -->
            <div class="notification-icon" :style="{ backgroundColor: notif.color || '#6b7280' }">
              <div v-html="getIcon(notif.icon)"></div>
            </div>

            <!-- Content -->
            <div class="notification-content">
              <div class="notification-header">
                <h3 class="notification-title">{{ notif.title }}</h3>
                <span class="notification-time">{{ formatRelativeTime(notif.createdAt) }}</span>
              </div>
              <p class="notification-message">{{ notif.message }}</p>

              <!-- Priority Badge -->
              <span
                v-if="notif.priority === 'high' || notif.priority === 'urgent'"
                :class="['priority-badge', `priority-${notif.priority}`]"
              >
                {{ notif.priority }}
              </span>
            </div>

            <!-- Actions -->
            <div class="notification-actions">
              <button
                v-if="!notif.isRead"
                class="action-btn"
                @click.stop="markAsRead(notif.id)"
                title="Mark as read"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </button>
              <button
                class="action-btn"
                @click.stop="deleteNotification(notif.id)"
                title="Delete"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api';

// Icons as SVG strings
const getIcon = (iconName: string): string => {
  const icons: Record<string, string> = {
    ticket: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <path d="M3 7v4a1 1 0 001 1h3"/>
      <path d="M21 7v4a1 1 0 01-1 1h-3"/>
      <path d="M10 12h4"/>
      <path d="M10 16h4"/>
      <path d="M12 8h.01"/>
    </svg>`,
    'user-switch': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="8.5" cy="7" r="4"/>
      <polyline points="17 11 19 13 23 9"/>
    </svg>`,
    refresh: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <polyline points="23 4 23 10 17 10"/>
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>`,
    alert: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>`,
    message: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>`,
    at: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <circle cx="12" cy="12" r="4"/>
      <path d="M16 8v5a3 3 0 006 0v-1a10 10 0 10-3.92 7.94"/>
    </svg>`,
    clock: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>`,
    warning: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>`,
    users: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/>
      <path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>`,
    folder: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
    </svg>`,
    'plus-circle': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="16"/>
      <line x1="8" y1="12" x2="16" y2="12"/>
    </svg>`,
    bell: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>`
  };
  return icons[iconName] || icons.bell;
};

const router = useRouter();
const notifications = ref<any[]>([]);
const loading = ref(false);
const activeFilter = ref('all');
const searchQuery = ref('');
const unreadCount = ref(0);
let pollingInterval: any = null;

// Filtered notifications
const filteredNotifications = computed(() => {
  let filtered = notifications.value;

  // Filter by category
  if (activeFilter.value !== 'all') {
    if (activeFilter.value === 'unread') {
      filtered = filtered.filter(n => !n.isRead);
    } else {
      filtered = filtered.filter(n => n.category === activeFilter.value);
    }
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(n =>
      n.title.toLowerCase().includes(query) ||
      n.message.toLowerCase().includes(query)
    );
  }

  return filtered;
});

// Group notifications by date
const groupedNotifications = computed(() => {
  const groups: Record<string, any[]> = {
    today: [],
    yesterday: [],
    thisWeek: [],
    older: []
  };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  filteredNotifications.value.forEach(notif => {
    const notifDate = new Date(notif.createdAt);
    const notifDay = new Date(notifDate.getFullYear(), notifDate.getMonth(), notifDate.getDate());

    if (notifDay.getTime() === today.getTime()) {
      groups.today.push(notif);
    } else if (notifDay.getTime() === yesterday.getTime()) {
      groups.yesterday.push(notif);
    } else if (notifDate >= weekAgo) {
      groups.thisWeek.push(notif);
    } else {
      groups.older.push(notif);
    }
  });

  const result = [];
  if (groups.today.length > 0) result.push({ label: 'Today', notifications: groups.today });
  if (groups.yesterday.length > 0) result.push({ label: 'Yesterday', notifications: groups.yesterday });
  if (groups.thisWeek.length > 0) result.push({ label: 'This Week', notifications: groups.thisWeek });
  if (groups.older.length > 0) result.push({ label: 'Older', notifications: groups.older });

  return result;
});

// Fetch notifications
const fetchNotifications = async () => {
  try {
    loading.value = true;
    const res = await api.get('/notifications');
    notifications.value = res.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
  } finally {
    loading.value = false;
  }
};

// Fetch unread count
const fetchUnreadCount = async () => {
  try {
    const res = await api.get('/notifications/unread/count');
    unreadCount.value = res.data.count;
  } catch (error) {
    console.error('Error fetching unread count:', error);
  }
};

// Mark single notification as read
const markAsRead = async (id: number) => {
  try {
    await api.put(`/notifications/${id}/read`);
    const notif = notifications.value.find(n => n.id === id);
    if (notif) {
      notif.isRead = true;
      notif.readAt = new Date();
    }
    fetchUnreadCount();
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

// Mark all notifications as read
const markAllAsRead = async () => {
  try {
    await api.put('/notifications/mark-all-read');
    notifications.value.forEach(n => {
      n.isRead = true;
      n.readAt = new Date();
    });
    unreadCount.value = 0;
  } catch (error) {
    console.error('Error marking all as read:', error);
  }
};

// Delete notification
const deleteNotification = async (id: number) => {
  try {
    await api.delete(`/notifications/${id}`);
    notifications.value = notifications.value.filter(n => n.id !== id);
    fetchUnreadCount();
  } catch (error) {
    console.error('Error deleting notification:', error);
  }
};

// Clear read notifications
const clearReadNotifications = async () => {
  try {
    await api.delete('/notifications/clear-all');
    notifications.value = notifications.value.filter(n => !n.isRead);
  } catch (error) {
    console.error('Error clearing notifications:', error);
  }
};

// Handle notification click
const handleNotificationClick = async (notif: any) => {
  // Mark as read if unread
  if (!notif.isRead) {
    await markAsRead(notif.id);
  }

  // Navigate to action URL if available
  if (notif.actionUrl) {
    router.push(notif.actionUrl);
  }
};

// Format relative time
const formatRelativeTime = (date: string): string => {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return then.toLocaleDateString();
};

// Start polling
const startPolling = () => {
  pollingInterval = setInterval(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, 30000); // Poll every 30 seconds
};

// Stop polling
const stopPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }
};

// Lifecycle
onMounted(() => {
  fetchNotifications();
  fetchUnreadCount();
  startPolling();
});

onUnmounted(() => {
  stopPolling();
});
</script>

<style scoped>
.notifications-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-xl);
  min-height: 100vh;
  background-color: var(--color-background);
}

/* Page Header */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: var(--spacing-2xl);
  padding: var(--spacing-2xl);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: var(--radius-2xl);
  color: white;
  box-shadow: 0 20px 25px -5px rgba(102, 126, 234, 0.3);
}

.header-content {
  flex: 1;
}

.header-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
}

.header-title h1 {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  margin: 0;
}

.unread-badge {
  background: rgba(255, 255, 255, 0.3);
  color: white;
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
}

.header-subtitle {
  margin: 0;
  opacity: 0.9;
}

.header-actions {
  display: flex;
  gap: var(--spacing-md);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-lg);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
}

.btn--primary {
  background: white;
  color: #667eea;
}

.btn--primary:hover:not(:disabled) {
  background: #f3f4f6;
  transform: translateY(-2px);
}

.btn--primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn--outline {
  background: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.5);
}

.btn--outline:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Controls Section */
.controls-section {
  background: var(--color-surface);
  padding: var(--spacing-lg);
  border-radius: var(--radius-xl);
  margin-bottom: var(--spacing-xl);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.filter-tabs {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
  overflow-x: auto;
}

.filter-tab {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-lg);
  background: transparent;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-full);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-tab:hover {
  border-color: #667eea;
  color: #667eea;
}

.filter-tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: white;
}

.tab-badge {
  background: rgba(255, 255, 255, 0.3);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
}

.filter-tab.active .tab-badge {
  background: rgba(255, 255, 255, 0.4);
}

.search-bar {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--color-background);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.search-bar svg {
  color: var(--color-text-tertiary);
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: var(--font-size-md);
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-3xl);
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

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: var(--spacing-3xl);
}

.empty-state svg {
  opacity: 0.3;
  margin-bottom: var(--spacing-lg);
}

.empty-state h3 {
  font-size: var(--font-size-xl);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
}

.empty-state p {
  color: var(--color-text-tertiary);
}

/* Notifications */
.notifications-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xl);
}

.notification-group {
  animation: fadeInUp 0.5s ease-out;
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

.group-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-tertiary);
  margin-bottom: var(--spacing-md);
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.notification-card {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-xl);
  cursor: pointer;
  transition: all 0.3s ease;
}

.notification-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
  transform: translateY(-2px);
}

.notification-card.unread {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border-color: #667eea;
}

.notification-icon {
  width: 48px;
  height: 48px;
  min-width: 48px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  background: #667eea;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-xs);
}

.notification-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.notification-time {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  white-space: nowrap;
}

.notification-message {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-xs) 0;
  line-height: 1.5;
}

.priority-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
}

.priority-high {
  background: #fef3c7;
  color: #92400e;
}

.priority-urgent {
  background: #fee2e2;
  color: #991b1b;
}

.notification-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.action-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--color-text-tertiary);
}

.action-btn:hover {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

@media (max-width: 768px) {
  .notifications-view {
    padding: var(--spacing-md);
  }

  .page-header {
    flex-direction: column;
    gap: var(--spacing-lg);
  }

  .header-actions {
    width: 100%;
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .filter-tabs {
    flex-wrap: nowrap;
    overflow-x: auto;
  }

  .notification-card {
    flex-direction: column;
  }

  .notification-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
