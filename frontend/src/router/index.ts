import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Public routes (no authentication required)
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { requiresAuth: false }
    },
    // Protected routes (authentication required)
    {
      path: '/',
      component: () => import('../layouts/MainLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', name: 'home', component: () => import('../views/HomeView.vue') },
        { path: 'dashboard', name: 'dashboard', component: () => import('../views/DashboardView.vue') },
        { path: 'sop', name: 'sop', component: () => import('../views/SopView.vue') },
        {
          path: '/customer-support-center',
          name: 'customer-support-center',
          component: () => import('../views/CustomerSupportCenterView.vue'),
          meta: { requiresAuth: true, roles: ['Admin', 'Agent'] } // Example roles
        },
        {
          path: '/profile',
          name: 'profile',
          component: () => import('../views/ProfileView.vue'),
          meta: { requiresAuth: true }
        },
        { path: 'settings', name: 'settings', component: () => import('../views/SettingsView.vue'), meta: { roles: ['Super Admin', 'Admin', 'Manager'] } },
        { path: 'admin', name: 'admin-dashboard', component: () => import('../views/AdminPageView.vue'), meta: { roles: ['Super Admin', 'Admin'] } },
        { path: 'manager', name: 'manager-dashboard', component: () => import('../views/ManagerPageView.vue'), meta: { roles: ['Manager','Super Admin', 'Admin'] } },
        { path: 'tickets', name: 'ticket-list', component: () => import('../views/TicketListView.vue') },
        { path: 'tickets/board', name: 'ticket-board', component: () => import('../views/TicketBoardView.vue') },
        { path: 'tickets/create', name: 'ticket-create', component: () => import('../views/TicketCreateView.vue') },
        { path: 'tickets/:id', name: 'ticket-detail', component: () => import('../views/TicketDetailView.vue') },
        { path: 'notifications', name: 'notifications', component: () => import('../views/NotificationsView.vue') },
        { path: 'content', name: 'content-list', component: () => import('../views/ContentListView.vue') },
        { path: 'content/create', name: 'content-create', component: () => import('../views/ContentCreateView.vue'), meta: { roles: ['Super Admin', 'Admin', 'Manager'] } },
        { path: 'content/:id', name: 'content-detail', component: () => import('../views/ContentDetailView.vue') },
        { path: 'billing-profile', name: 'billing-profile', component: () => import('../views/BillingProfileView.vue') },
        { path: 'customers', name: 'customers', component: () => import('../views/CustomerView.vue') },
        { path: 'data-upload', name: 'data-upload', component: () => import('../views/DataUploadView.vue'), meta: { roles: ['Super Admin', 'Admin'] } },
        { path: 'data-fetching', name: 'data-fetching', component: () => import('../views/DataFetchingView.vue') },
        { path: 'bill-stop', name: 'bill-stop', component: () => import('../views/BillStopView.vue') },
        { path: 'users/create', name: 'user-create', component: () => import('../views/UserCreateView.vue'), meta: { roles: ['Super Admin', 'Admin'] } },
        { path: 'meter-replacement', name: 'meter-replacement', component: () => import('../views/MeterReplacementView.vue'), meta: { roles: ['Super Admin', 'Admin', 'Manager'] } },
        { path: 'batch-report', name: 'batch-operational-report', component: () => import('../views/BatchOperationalReportView.vue'), meta: { roles: ['Super Admin', 'Admin', 'Manager'] } },
        { path: 'meter-estimator', name: 'meter-estimator', component: () => import('../views/MeterEstimatorView.vue'), meta: { roles: ['Super Admin', 'Admin', 'Manager'] } },
        { path: 'c2m-upload', name: 'c2m-upload', component: () => import('../views/C2MUploadView.vue'), meta: { roles: ['Super Admin', 'Admin', 'Manager'] } },
        { path: 'customer-support-center', name: 'customer-support-center', component: () => import('../views/CustomerSupportCenterView.vue'), meta: { requiresAuth: true, roles: ['Super Admin', 'Admin', 'Manager', 'Agent'] } },
        { path: 'complaints', name: 'complaints', component: () => import('../views/ComplaintsView.vue'), meta: { requiresAuth: true } },
        { path: 'telegram-notifications', name: 'telegram-notifications', component: () => import('../views/TelegramNotificationsView.vue'), meta: { requiresAuth: true, roles: ['Super Admin', 'Admin'] } },
        { path: 'cmo', name: 'cmo', component: () => import('../views/CmoView.vue'), meta: { requiresAuth: true, roles: ['Super Admin', 'Admin'] } },
        // Analytics routes
        { path: 'analytics', name: 'analytics-dashboard', component: () => import('../views/analytics/OrganizationDashboard.vue'), meta: { requiresAuth: true, roles: ['Manager', 'Admin', 'Super Admin'] } },
        { path: 'analytics/project/:id', name: 'project-analytics', component: () => import('../views/analytics/ProjectAnalytics.vue'), meta: { requiresAuth: true, roles: ['Manager', 'Admin', 'Super Admin'] } },
        { path: 'analytics/sprint/:id', name: 'sprint-analytics', component: () => import('../views/analytics/SprintAnalytics.vue'), meta: { requiresAuth: true, roles: ['Manager', 'Admin', 'Super Admin', 'Agent'] } },
        { path: 'analytics/rc-dc', name: 'rc-dc-analytics', component: () => import('../views/analytics/RCDCAnalytics.vue'), meta: { requiresAuth: true, roles: ['Manager', 'Admin', 'Super Admin'] } }
      ]
    },
    // Legacy auth routes (redirect to new routes)
    {
      path: '/auth/login',
      redirect: '/login'
    },
    {
      path: '/auth/register',
      redirect: '/register'
    },
    // 404 page
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue')
    }
  ]
});

export default router;
