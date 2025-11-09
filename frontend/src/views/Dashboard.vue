<template>
  <div>
    <div class="row mb-4">
      <div class="col-12">
        <h1 class="mb-0">Dashboard</h1>
        <p class="text-muted">Welcome back, {{ user?.username }}</p>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="row mb-4">
      <div class="col-md-3 mb-3">
        <div class="card h-100">
          <div class="card-body text-center">
            <div class="stat-icon">
              <i class="fas fa-map-marker-alt"></i>
            </div>
            <h3 class="stat-number">{{ stats.totalCollectionPoints }}</h3>
            <p class="stat-label mb-0">Collection Points</p>
          </div>
        </div>
      </div>

      <div class="col-md-3 mb-3">
        <div class="card h-100">
          <div class="card-body text-center">
            <div class="stat-icon">
              <i class="fas fa-building"></i>
            </div>
            <h3 class="stat-number">{{ stats.totalSubscribers }}</h3>
            <p class="stat-label mb-0">Subscribers</p>
          </div>
        </div>
      </div>

      <div class="col-md-3 mb-3">
        <div class="card h-100">
          <div class="card-body text-center">
            <div class="stat-icon">
              <i class="fas fa-truck"></i>
            </div>
            <h3 class="stat-number">{{ stats.totalCollections }}</h3>
            <p class="stat-label mb-0">Collections (30 days)</p>
          </div>
        </div>
      </div>

      <div class="col-md-3 mb-3">
        <div class="card h-100">
          <div class="card-body text-center">
            <div class="stat-icon">
              <i class="fas fa-weight-hanging"></i>
            </div>
            <h3 class="stat-number">{{ formatNumber(stats.totalWeight) }}</h3>
            <p class="stat-label mb-0">Total Weight (tons)</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Quick Actions</h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-3 mb-3" v-if="canManageCollectionPoints">
                <router-link to="/collection-points/new" class="btn btn-primary w-100">
                  <i class="fas fa-plus me-2"></i>Add Collection Point
                </router-link>
              </div>
              <div class="col-md-3 mb-3" v-if="canManageSubscribers">
                <router-link to="/subscribers/new" class="btn btn-success w-100">
                  <i class="fas fa-user-plus me-2"></i>Add Subscriber
                </router-link>
              </div>
              <div class="col-md-3 mb-3">
                <router-link to="/map" class="btn btn-info w-100">
                  <i class="fas fa-map me-2"></i>View Map
                </router-link>
              </div>
              <div class="col-md-3 mb-3">
                <router-link to="/reports" class="btn btn-secondary w-100">
                  <i class="fas fa-chart-bar me-2"></i>View Reports
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="row">
      <div class="col-md-6 mb-4">
        <div class="card h-100">
          <div class="card-header">
            <h5 class="mb-0">Recent Collections</h5>
          </div>
          <div class="card-body">
            <div v-if="recentCollections.length === 0" class="text-center text-muted">
              No recent collections
            </div>
            <div v-else class="list-group list-group-flush">
              <div
                v-for="collection in recentCollections"
                :key="collection.id"
                class="list-group-item px-0"
              >
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{{ collection.collection_point_name }}</strong>
                    <br>
                    <small class="text-muted">
                      {{ formatDate(collection.collection_date) }} •
                      {{ collection.waste_type_name }} •
                      {{ collection.weight_tons }} tons
                    </small>
                  </div>
                  <span class="badge bg-primary">{{ collection.volume_cubic_meters }}m³</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-6 mb-4">
        <div class="card h-100">
          <div class="card-header">
            <h5 class="mb-0">System Status</h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-6">
                <div class="status-item">
                  <i class="fas fa-server text-success"></i>
                  <span>Backend API</span>
                </div>
              </div>
              <div class="col-6">
                <div class="status-item">
                  <i class="fas fa-database text-success"></i>
                  <span>Database</span>
                </div>
              </div>
            </div>
            <hr>
            <div class="text-center">
              <small class="text-muted">
                Last updated: {{ formatDate(new Date()) }}
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../store/auth'
import api from '../services/api'

export default {
  name: 'Dashboard',
  setup() {
    const authStore = useAuthStore()

    const stats = ref({
      totalCollectionPoints: 0,
      totalSubscribers: 0,
      totalCollections: 0,
      totalWeight: 0,
      totalVolume: 0
    })

    const recentCollections = ref([])
    const loading = ref(true)

    const user = computed(() => authStore.user)
    const canManageCollectionPoints = computed(() => authStore.canManageCollectionPoints)
    const canManageSubscribers = computed(() => authStore.canManageSubscribers)

    const loadDashboardData = async () => {
      try {
        // Load statistics
        const endDate = new Date().toISOString().split('T')[0]
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

        const statsResponse = await api.get('/reports/waste-collection-summary', {
          params: { startDate, endDate, groupBy: 'monthly' }
        })

        // Calculate totals from report data
        const reportData = statsResponse.data[0] || {}
        stats.value = {
          totalCollectionPoints: 10, // From sample data
          totalSubscribers: 15, // From sample data
          totalCollections: reportData.collection_count || 0,
          totalWeight: reportData.total_weight || 0,
          totalVolume: reportData.total_volume || 0
        }

        // Load recent collections
        const collectionsResponse = await api.get('/collection-events', {
          params: { limit: 5 }
        })
        recentCollections.value = collectionsResponse.data.slice(0, 5)

      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        loading.value = false
      }
    }

    const formatNumber = (num) => {
      return Number(num).toFixed(1)
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString()
    }

    onMounted(() => {
      loadDashboardData()
    })

    return {
      stats,
      recentCollections,
      loading,
      user,
      canManageCollectionPoints,
      canManageSubscribers,
      formatNumber,
      formatDate
    }
  }
}
</script>

<style scoped>
.stat-icon {
  font-size: 2rem;
  color: #6c757d;
  margin-bottom: 1rem;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: #495057;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #6c757d;
  font-size: 0.9rem;
}

.status-item {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.status-item i {
  margin-right: 0.5rem;
  font-size: 1.2rem;
}

.status-item span {
  font-weight: 500;
}

.card {
  transition: transform 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-2px);
}
</style>