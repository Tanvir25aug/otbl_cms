<template>
  <div class="sidebar d-flex flex-column flex-shrink-0 p-3" :class="{ 'open': isOpen }">
    <a href="/" class="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
      <span class="fs-4">OTBL CMS</span>
    </a>
    <hr>
    <ul class="nav nav-pills flex-column mb-auto">
      <li class="nav-item">
        <router-link class="nav-link" to="/">Home</router-link>
      </li>
      <li v-if="auth.isAuthenticated">
        <router-link class="nav-link" to="/dashboard">Dashboard</router-link>
      </li>
      <li v-if="auth.isAuthenticated">
        <router-link class="nav-link" to="/tickets">Tickets</router-link>
      </li>
      <li v-if="auth.isAuthenticated && auth.user?.role === 'Manager'">
        <router-link class="nav-link" to="/manager">👨‍💼 Manager</router-link>
      </li>
      <li v-if="auth.isAuthenticated && (auth.user?.role === 'Manager' || auth.user?.role === 'Admin' || auth.user?.role === 'Super Admin')">
        <router-link class="nav-link" to="/analytics">📊 Analytics Dashboard</router-link>
      </li>
      <li v-if="auth.isAuthenticated && auth.canManageUsers">
        <router-link class="nav-link" to="/data-fetching">📥 Data-Fetching</router-link>
      </li>
      <li v-if="auth.isAuthenticated">
        <router-link class="nav-link" to="/content">Content</router-link>
      </li>
      <li v-if="auth.isAuthenticated">
        <router-link class="nav-link" to="/billing-profile">Billing Profile</router-link>
      </li>
      <li v-if="auth.isAuthenticated">
        <router-link class="nav-link" to="/customers">Customers</router-link>
      </li>
      <li v-if="auth.isAuthenticated && auth.canManageUsers">
        <router-link class="nav-link" to="/data-upload">Data Upload</router-link>
      </li>
      <li v-if="auth.isAuthenticated">
        <router-link class="nav-link" to="/bill-stop">Bill Stop</router-link>
      </li>
      <li v-if="auth.isAuthenticated">
        <router-link class="nav-link" to="/customer-support-center">Customer Support</router-link>
      </li>
      <li v-if="auth.isAuthenticated">
        <router-link class="nav-link" to="/complaints">Complaints</router-link>
      </li>
      <li v-if="auth.isAuthenticated">
        <router-link class="nav-link" to="/meter-replacement">Meter Replacement</router-link>
      </li>
      <li v-if="auth.isAuthenticated">
        <router-link class="nav-link" to="/batch-operational-report">Batch Report</router-link>
      </li>
      <li v-if="auth.isAuthenticated && auth.canManageUsers">
        <router-link class="nav-link" to="/settings">Settings</router-link>
      </li>
      <li v-if="auth.isAuthenticated">
        <router-link class="nav-link" to="/users/create">Create User</router-link>
      </li>
      <li v-if="auth.isAuthenticated && (auth.user?.role === 'Super Admin' || auth.user?.role === 'Admin')">
        <router-link class="nav-link" to="/admin">Admin Dashboard</router-link>
      </li>
      <li v-if="auth.isAuthenticated && (auth.user?.role === 'Super Admin' || auth.user?.role === 'Admin')">
        <router-link class="nav-link" to="/telegram-notifications">Telegram Notifications</router-link>
      </li>
    </ul>
    <hr>
    <div class="dropdown" v-if="auth.isAuthenticated">
      <a href="#" class="d-flex align-items-center text-white text-decoration-none dropdown-toggle" id="dropdownUser1" data-bs-toggle="dropdown" aria-expanded="false">
        <img :src="auth.user?.profilePicture || 'https://via.placeholder.com/32'" alt="" width="32" height="32" class="rounded-circle me-2">
        <strong>{{ auth.user?.fullName || 'User' }}</strong>
      </a>
      <ul class="dropdown-menu dropdown-menu-dark text-small shadow" aria-labelledby="dropdownUser1">
        <li><router-link class="dropdown-item" to="/profile">Profile</router-link></li>
        <li><hr class="dropdown-divider"></li>
        <li><a class="dropdown-item" href="#" @click.prevent="auth.logout">Sign out</a></li>
      </ul>
    </div>
     <div v-else>
        <router-link to="/login" class="btn btn-primary">Login</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth';
import { defineProps } from 'vue';

const auth = useAuthStore();
console.log('Current user role:', auth.user?.role);

const props = defineProps<{
  isOpen: boolean;
}>();
</script>

<style scoped>
.sidebar {
  width: 280px;
  height: 100vh;
  position: fixed;
  top: 0;
  left: -280px; /* Hidden by default */
  background-color: #343a40;
  transition: left 0.3s ease-in-out;
  z-index: 1020;
}

.sidebar.open {
  left: 0; /* Show sidebar */
}

.sidebar .nav-link {
  color: rgba(255, 255, 255, 0.8);
}

.sidebar .nav-link:hover {
  color: #fff;
  background-color: #495057;
}

.sidebar .router-link-exact-active {
  color: #fff;
  background-color: #0d6efd;
}

.dropdown-menu {
    position: absolute !important;
}

.dropdown-item:hover {
    background-color: #0d6efd;
}

</style>