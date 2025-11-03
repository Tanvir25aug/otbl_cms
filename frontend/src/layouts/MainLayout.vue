<template>
  <div id="app" class="main-layout-root">
    <!-- Sidebar + Main Content Grid -->
    <div class="main-layout-grid">
      <!-- Sidebar -->
      <aside class="sidebar" :class="{ 'sidebar--closed': !isSidebarOpen }">
        <div class="sidebar__header">
          <div class="sidebar__logo-container">
            <svg class="sidebar__logo-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            <h6 class="sidebar__title">OTBL CMS</h6>
          </div>
          <div v-if="auth.isAuthenticated" class="user-info-sidebar">
            <div class="user-avatar-sidebar">
              <img v-if="auth.user?.profilePicture" :src="auth.user.profilePicture" :alt="auth.user.fullName">
              <svg v-else viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div class="user-details-sidebar">
              <div class="user-name-sidebar">{{ auth.user?.fullName || 'User' }}</div>
              <div class="user-designation-sidebar">{{ auth.user?.designation || auth.user?.role || 'User' }}</div>
            </div>
          </div>
        </div>
        <nav class="sidebar__nav">
          <ul class="sidebar__menu">
            <li class="sidebar__item" v-if="auth.isAuthenticated">
              <router-link to="/dashboard" class="sidebar__link" :class="{ 'sidebar__link--active': $route.path === '/dashboard' }" @click="closeSidebarOnMobile">
                <svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9,22 9,12 15,12 15,22"/>
                </svg>
                Dashboard
              </router-link>
            </li>

            <li class="sidebar__item" v-if="auth.isAuthenticated">
              <router-link to="/tickets" class="sidebar__link" :class="{ 'sidebar__link--active': $route.path.startsWith('/tickets') }" @click="closeSidebarOnMobile">
                <svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                Tickets
              </router-link>
            </li>

            <li class="sidebar__item" v-if="auth.isAuthenticated && auth.user?.role === 'Manager'">
              <router-link to="/manager" class="sidebar__link" :class="{ 'sidebar__link--active': $route.path.startsWith('/manager') }" @click="closeSidebarOnMobile">
                <svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                  <path d="M12 14v7"/>
                  <path d="M9 18h6"/>
                </svg>
                👨‍💼 Manager
              </router-link>
            </li>

            <li class="sidebar__item" v-if="auth.isAuthenticated && (auth.user?.role === 'Manager' || auth.user?.role === 'Admin' || auth.user?.role === 'Super Admin')">
              <router-link to="/analytics" class="sidebar__link" :class="{ 'sidebar__link--active': $route.path.startsWith('/analytics') }" @click="closeSidebarOnMobile">
                <svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 3v18h18"/>
                  <path d="M18 17V9"/>
                  <path d="M13 17V5"/>
                  <path d="M8 17v-3"/>
                </svg>
                📊 Analytics Dashboard
              </router-link>
            </li>

            <li class="sidebar__item" v-if="auth.isAuthenticated && auth.canManageUsers">
              <router-link to="/data-fetching" class="sidebar__link" :class="{ 'sidebar__link--active': $route.path.startsWith('/data-fetching') }" @click="closeSidebarOnMobile">
                <svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                📥 Data-Fetching
              </router-link>
            </li>

            <li class="sidebar__item" v-if="auth.isAuthenticated">
              <router-link to="/content" class="sidebar__link" :class="{ 'sidebar__link--active': $route.path.startsWith('/content') }" @click="closeSidebarOnMobile">
                <svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
                Content
              </router-link>
            </li>

            <li class="sidebar__item" v-if="auth.isAuthenticated">
              <router-link to="/customers" class="sidebar__link" :class="{ 'sidebar__link--active': $route.path.startsWith('/customers') }" @click="closeSidebarOnMobile">
                <svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                Customers
              </router-link>
            </li>

            <li class="sidebar__item" v-if="auth.isAuthenticated">
              <router-link to="/complaints" class="sidebar__link" :class="{ 'sidebar__link--active': $route.path.startsWith('/complaints') }" @click="closeSidebarOnMobile">
                <svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                Complaints
              </router-link>
            </li>

            <li class="sidebar__item" v-if="auth.isAuthenticated">
              <router-link to="/billing-profile" class="sidebar__link" :class="{ 'sidebar__link--active': $route.path.startsWith('/billing-profile') }" @click="closeSidebarOnMobile">
                <svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                Billing Profile
              </router-link>
            </li>

            <li class="sidebar__item" v-if="auth.isAuthenticated && auth.canManageUsers">
              <router-link to="/data-upload" class="sidebar__link" :class="{ 'sidebar__link--active': $route.path.startsWith('/data-upload') }" @click="closeSidebarOnMobile">
                <svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17,8 12,3 7,8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                Data Upload
              </router-link>
            </li>

            <li class="sidebar__item" v-if="auth.isAuthenticated">
              <router-link to="/bill-stop" class="sidebar__link" :class="{ 'sidebar__link--active': $route.path.startsWith('/bill-stop') }" @click="closeSidebarOnMobile">
                <svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                Bill Stop
              </router-link>
            </li>

            <li class="sidebar__item" v-if="auth.isAuthenticated">
              <router-link to="/meter-replacement" class="sidebar__link" :class="{ 'sidebar__link--active': $route.path.startsWith('/meter-replacement') }" @click="closeSidebarOnMobile">
                <svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m6.24 6.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m6.24-6.24l4.24-4.24"/>
                </svg>
                Meter Replacement
              </router-link>
            </li>

            <li class="sidebar__item" v-if="auth.isAuthenticated">
              <router-link to="/batch-report" class="sidebar__link" :class="{ 'sidebar__link--active': $route.path.startsWith('/batch-report') }" @click="closeSidebarOnMobile">
                <svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
                Batch Report
              </router-link>
            </li>

            <li class="sidebar__item" v-if="auth.isAuthenticated">
              <router-link to="/meter-estimator" class="sidebar__link" :class="{ 'sidebar__link--active': $route.path.startsWith('/meter-estimator') }" @click="closeSidebarOnMobile">
                <svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
                Meter Estimator
              </router-link>
            </li>

            <li class="sidebar__item" v-if="auth.isAuthenticated">
              <router-link to="/c2m-upload" class="sidebar__link" :class="{ 'sidebar__link--active': $route.path.startsWith('/c2m-upload') }" @click="closeSidebarOnMobile">
                <svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                C2M Upload
              </router-link>
            </li>

            <li class="sidebar__item sidebar__item--divider" v-if="auth.isAuthenticated && (auth.user?.role === 'Super Admin' || auth.user?.role === 'Admin')"></li>

            <li class="sidebar__item" v-if="auth.isAuthenticated && (auth.user?.role === 'Super Admin' || auth.user?.role === 'Admin')">
              <router-link to="/admin" class="sidebar__link" :class="{ 'sidebar__link--active': $route.path.startsWith('/admin') }" @click="closeSidebarOnMobile">
                <svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Admin Panel
              </router-link>
            </li>

            <li class="sidebar__item" v-if="auth.isAuthenticated && (auth.user?.role === 'Super Admin' || auth.user?.role === 'Admin')">
              <router-link to="/users/create" class="sidebar__link" :class="{ 'sidebar__link--active': $route.path.startsWith('/users/create') }" @click="closeSidebarOnMobile">
                <svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <line x1="19" y1="8" x2="19" y2="14"/>
                  <line x1="22" y1="11" x2="16" y2="11"/>
                </svg>
                Create User
              </router-link>
            </li>

            <li class="sidebar__item sidebar__item--divider"></li>

            <li class="sidebar__item sidebar__item--logout" v-if="auth.isAuthenticated">
              <button class="sidebar__link" @click="logout">
                <svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16,17 21,12 16,7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      <!-- Main Content Area -->
      <div class="main-content-area">
        <!-- Top Navbar -->
        <nav class="navbar" :class="{ 'navbar--sidebar-open': isSidebarOpen }">
          <div class="navbar__container">
            <!-- Left Section - Toggle Button -->
            <button class="navbar__toggle" @click="toggleSidebar" aria-label="Toggle sidebar">
              <svg v-if="!isSidebarOpen" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
              <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            <!-- Center Section - Brand (on mobile) -->
            <router-link to="/" class="navbar__brand">
              <div class="navbar__logo">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span class="navbar__brand-text">OTBL CMS</span>
            </router-link>

            <!-- Right Section -->
            <div class="navbar__right">
              <!-- Theme Toggle -->
              <ThemeToggle v-model="theme" class="navbar__theme-toggle" />

              <!-- Notifications -->
              <div class="navbar__notifications" v-if="auth.isAuthenticated">
                <button class="navbar__icon-btn" @click="goToNotifications" aria-label="Notifications">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                  <span v-if="unreadNotifications > 0" class="navbar__badge">{{ unreadNotifications }}</span>
                </button>
              </div>

              <!-- User Menu -->
              <div class="navbar__user-menu" ref="userMenu" v-if="auth.isAuthenticated">
                <button class="navbar__user-btn" @click="toggleUserMenu">
                  <div class="navbar__user-avatar">
                    <img v-if="auth.user?.profilePicture" :src="auth.user.profilePicture" :alt="auth.user.fullName">
                    <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <span class="navbar__user-name">{{ auth.user?.fullName || 'User' }}</span>
                  <svg class="navbar__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6,9 12,15 18,9"/>
                  </svg>
                </button>

                <div class="user-menu__dropdown" v-show="isUserMenuOpen">
                  <div class="user-menu__header">
                    <div class="user-info">
                      <div class="user-avatar">
                        <img v-if="auth.user?.profilePicture" :src="auth.user.profilePicture" :alt="auth.user.fullName">
                        <svg v-else width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                      </div>
                      <div>
                        <div class="user-name">{{ auth.user?.fullName || 'User' }}</div>
                        <div class="user-email">{{ auth.user?.email || 'user@example.com' }}</div>
                        <div class="user-role-badge">{{ auth.user?.role || 'User' }}</div>
                      </div>
                    </div>
                  </div>

                  <div class="user-menu__items">
                    <router-link to="/profile" class="user-menu__item" @click="closeUserMenu">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      <span>My Profile</span>
                    </router-link>
                    <button class="user-menu__item user-menu__item--danger" @click="logout">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16,17 21,12 16,7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Auth Links (Not Authenticated) -->
              <div v-else class="navbar__auth-links">
                <router-link to="/login" class="navbar__auth-btn navbar__auth-btn--login">Login</router-link>
                <router-link to="/register" class="navbar__auth-btn navbar__auth-btn--register">Register</router-link>
              </div>
            </div>
          </div>
        </nav>

        <!-- Main Content -->
        <main class="main-content">
          <div class="container">
            <router-view />
          </div>
        </main>
      </div>
    </div>

    <!-- Overlay for mobile sidebar -->
    <div
      v-if="isSidebarOpen && isMobile"
      class="sidebar-overlay"
      @click="closeSidebar"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import api from '../api';
import ThemeToggle from '../components/ThemeToggle.vue';

// Reactive state
const theme = ref<'light' | 'dark'>('light');
const isSidebarOpen = ref(true);
const isUserMenuOpen = ref(false);
const userMenu = ref<HTMLElement | null>(null);
const windowWidth = ref(window.innerWidth);

// Notifications
const unreadNotifications = ref(0);

// Store and router
const router = useRouter();
const auth = useAuthStore();

// Computed
const isMobile = computed(() => windowWidth.value < 768);

// Theme management
const applyTheme = (newTheme: 'light' | 'dark') => {
  document.body.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
};

const loadTheme = () => {
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
  if (savedTheme) {
    theme.value = savedTheme;
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    theme.value = prefersDark ? 'dark' : 'light';
  }
  applyTheme(theme.value);
};

watch(theme, (newTheme) => {
  applyTheme(newTheme);
});

// Sidebar management
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const closeSidebar = () => {
  isSidebarOpen.value = false;
};

const closeSidebarOnMobile = () => {
  if (isMobile.value) {
    closeSidebar();
  }
};

const handleResize = () => {
  windowWidth.value = window.innerWidth;
  if (window.innerWidth >= 768) {
    isSidebarOpen.value = true;
  } else {
    isSidebarOpen.value = false;
  }
};

// User menu management
const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value;
};

const closeUserMenu = () => {
  isUserMenuOpen.value = false;
};

const handleClickOutsideUserMenu = (event: MouseEvent) => {
  if (userMenu.value && !userMenu.value.contains(event.target as Node)) {
    isUserMenuOpen.value = false;
  }
};

// Notification management
const goToNotifications = () => {
  router.push('/notifications');
};

const loadUnreadCount = async () => {
  if (!auth.isAuthenticated) return;
  try {
    const res = await api.get('/notifications');
    unreadNotifications.value = (res.data || []).filter((n: any) => !n.isRead).length;
  } catch {
    // Silently fail
  }
};

// Auth management
const logout = () => {
  auth.logout();
  router.push('/login');
  isUserMenuOpen.value = false;
};

// Lifecycle hooks
onMounted(() => {
  loadTheme();
  handleResize();
  loadUnreadCount();
  window.addEventListener('resize', handleResize);
  document.addEventListener('click', handleClickOutsideUserMenu);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  document.removeEventListener('click', handleClickOutsideUserMenu);
});
</script>

<style>
/* ========== CSS Variables ========== */
:root {
  --color-background: #f8fafc;
  --color-surface: #ffffff;
  --color-text: #0f172a;
  --color-text-secondary: #64748b;
  --color-border: #e2e8f0;
  --color-primary: #4f46e5;
  --color-primary-hover: #4338ca;
  --color-primary-light: #eef2ff;
  --color-accent: #06b6d4;
  --color-success: #10b981;
  --color-danger: #ef4444;
  --color-warning: #f59e0b;
  --sidebar-width: 280px;
  --navbar-height: 64px;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
}

[data-theme='dark'] {
  --color-background: #0f172a;
  --color-surface: #1e293b;
  --color-text: #f1f5f9;
  --color-text-secondary: #94a3b8;
  --color-border: #334155;
  --color-primary: #6366f1;
  --color-primary-hover: #4f46e5;
  --color-primary-light: #1e1b4b;
}

/* ========== Global Styles ========== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background-color: var(--color-background);
  color: var(--color-text);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.main-layout-root {
  min-height: 100vh;
  background: var(--color-background);
}

.main-layout-grid {
  display: flex;
  min-height: 100vh;
}

/* ========== Sidebar Styles ========== */
.sidebar {
  width: var(--sidebar-width);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
}

.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.sidebar--closed {
  transform: translateX(-100%);
}

.sidebar__header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar__logo-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.sidebar__logo-icon {
  width: 32px;
  height: 32px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.sidebar__title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.025em;
}

.user-info-sidebar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  backdrop-filter: blur(10px);
}

.user-avatar-sidebar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.user-avatar-sidebar img,
.user-avatar-sidebar svg {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-details-sidebar {
  flex: 1;
  min-width: 0;
}

.user-name-sidebar {
  font-weight: 600;
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-designation-sidebar {
  font-size: 0.75rem;
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar__nav {
  flex: 1;
  padding: 1rem 0;
}

.sidebar__menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar__item {
  margin-bottom: 0.25rem;
}

.sidebar__link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9375rem;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
  background: transparent;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
}

.sidebar__link:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border-left-color: rgba(255, 255, 255, 0.5);
}

.sidebar__link--active {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  border-left-color: #ffffff;
  font-weight: 600;
}

.sidebar__icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.sidebar__item--divider {
  height: 1px;
  margin: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
}

.sidebar__item--logout .sidebar__link {
  color: #fecaca;
}

.sidebar__item--logout .sidebar__link:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  border-left-color: #fca5a5;
}

/* ========== Main Content Area ========== */
.main-content-area {
  flex: 1;
  margin-left: var(--sidebar-width);
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar--closed ~ .main-content-area {
  margin-left: 0;
}

/* ========== Navbar Styles ========== */
.navbar {
  height: var(--navbar-height);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.9);
}

[data-theme='dark'] .navbar {
  background: rgba(30, 41, 59, 0.9);
}

.navbar__container {
  height: 100%;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  max-width: 100%;
}

.navbar__toggle {
  width: 40px;
  height: 40px;
  border-radius: 0.5rem;
  border: none;
  background: transparent;
  color: var(--color-text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.navbar__toggle:hover {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.navbar__brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: var(--color-text);
  font-weight: 700;
  font-size: 1.125rem;
}

.navbar__logo {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.navbar__brand-text {
  display: none;
}

.navbar__right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.navbar__theme-toggle {
  margin-right: 0.5rem;
}

.navbar__icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 0.5rem;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.2s ease;
}

.navbar__icon-btn:hover {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.navbar__badge {
  position: absolute;
  top: 6px;
  right: 6px;
  background: var(--color-danger);
  color: white;
  border-radius: 999px;
  min-width: 18px;
  height: 18px;
  font-size: 0.625rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  box-shadow: 0 0 0 2px var(--color-surface);
}

.navbar__user-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  border-radius: 0.5rem;
  border: none;
  background: transparent;
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
}

.navbar__user-btn:hover {
  background: var(--color-primary-light);
}

.navbar__user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: var(--color-primary);
}

.navbar__user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.navbar__user-name {
  display: none;
}

.navbar__chevron {
  color: var(--color-text-secondary);
}

.navbar__auth-links {
  display: flex;
  gap: 0.5rem;
}

.navbar__auth-btn {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.navbar__auth-btn--login {
  color: var(--color-text);
  background: transparent;
  border: 1px solid var(--color-border);
}

.navbar__auth-btn--login:hover {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.navbar__auth-btn--register {
  color: white;
  background: var(--color-primary);
}

.navbar__auth-btn--register:hover {
  background: var(--color-primary-hover);
}

/* ========== User Menu Dropdown ========== */
.navbar__user-menu {
  position: relative;
}

.user-menu__dropdown {
  position: absolute;
  top: calc(100% + 0.75rem);
  right: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  box-shadow: var(--shadow-xl);
  width: 280px;
  z-index: 9999;
  overflow: hidden;
}

.user-menu__header {
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background);
}

.user-info {
  display: flex;
  gap: 0.75rem;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--color-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: var(--color-primary);
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name {
  font-weight: 600;
  font-size: 0.9375rem;
  color: var(--color-text);
  margin-bottom: 0.25rem;
}

.user-email {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.5rem;
}

.user-role-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.user-menu__items {
  padding: 0.5rem;
}

.user-menu__item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  border-radius: 0.5rem;
  color: var(--color-text);
  cursor: pointer;
  font-size: 0.9375rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
}

.user-menu__item:hover {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.user-menu__item--danger {
  color: var(--color-danger);
}

.user-menu__item--danger:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-danger);
}

/* ========== Main Content ========== */
.main-content {
  flex: 1;
  padding: 2rem 1rem;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

/* ========== Overlay ========== */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  backdrop-filter: blur(2px);
}

/* ========== Responsive Design ========== */
@media (min-width: 640px) {
  .navbar__brand-text {
    display: inline;
  }

  .navbar__user-name {
    display: inline;
  }
}

@media (min-width: 768px) {
  .sidebar-overlay {
    display: none !important;
  }

  .main-content {
    padding: 2rem;
  }

  .navbar__toggle {
    display: flex;
  }
}

@media (max-width: 767px) {
  .sidebar {
    position: fixed;
    z-index: 1000;
  }

  .main-content-area {
    margin-left: 0 !important;
  }

  .navbar__user-btn {
    padding: 0.375rem;
  }

  .navbar__container {
    padding: 0 1rem;
  }
}
</style>
