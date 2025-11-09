<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <router-link to="/" class="navbar-brand">
          Municipal Waste Management
        </router-link>

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <router-link to="/map" class="nav-link">Map View</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/dashboard" class="nav-link">Dashboard</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/reports" class="nav-link">Reports</router-link>
            </li>
          </ul>

          <ul class="navbar-nav" v-if="isAuthenticated">
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                {{ user?.username }}
              </a>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="#" @click="logout">Logout</a></li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <main class="container mt-4">
      <router-view />
    </main>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useAuthStore } from './store/auth'

export default {
  name: 'App',
  setup() {
    const authStore = useAuthStore()

    const isAuthenticated = computed(() => authStore.isAuthenticated)
    const user = computed(() => authStore.user)

    const logout = () => {
      authStore.logout()
    }

    return {
      isAuthenticated,
      user,
      logout
    }
  }
}
</script>

<style>
/* Global styles */
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f8f9fa;
}

.navbar-brand {
  font-weight: bold;
}

.container {
  max-width: 1200px;
}

/* Button styles */
.btn {
  border-radius: 0.375rem;
  font-weight: 500;
}

.btn-primary {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.btn-secondary {
  background-color: #6c757d;
  border-color: #6c757d;
}

.btn-success {
  background-color: #198754;
  border-color: #198754;
}

.btn-danger {
  background-color: #dc3545;
  border-color: #dc3545;
}

/* Form styles */
.form-control {
  border-radius: 0.375rem;
}

.form-control:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

/* Card styles */
.card {
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: 1px solid rgba(0, 0, 0, 0.125);
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
  font-weight: 600;
}

/* Table styles */
.table {
  margin-bottom: 0;
}

.table thead th {
  border-top: none;
  font-weight: 600;
  color: #495057;
}

/* Alert styles */
.alert {
  border-radius: 0.375rem;
  border: none;
}

.alert-success {
  background-color: #d1edff;
  color: #0c63e4;
}

.alert-danger {
  background-color: #f8d7da;
  color: #721c24;
}

/* Loading spinner */
.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}
</style>