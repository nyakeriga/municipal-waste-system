<template>
  <div>
    <div class="row mb-4">
      <div class="col-12">
        <h2>Reports & Analytics</h2>
        <p class="text-muted">Generate and export comprehensive waste management reports</p>
      </div>
    </div>

    <!-- Report Filters -->
    <div class="card mb-4">
      <div class="card-header">
        <h5 class="mb-0">Report Filters</h5>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-3">
            <label class="form-label">Start Date</label>
            <input
              type="date"
              class="form-control"
              v-model="filters.startDate"
            />
          </div>
          <div class="col-md-3">
            <label class="form-label">End Date</label>
            <input
              type="date"
              class="form-control"
              v-model="filters.endDate"
            />
          </div>
          <div class="col-md-3">
            <label class="form-label">Local Government Area</label>
            <select
              class="form-select"
              v-model="filters.localGovernmentArea"
            >
              <option value="">All Areas</option>
              <option
                v-for="area in lgas"
                :key="area"
                :value="area"
              >
                {{ area }}
              </option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">&nbsp;</label>
            <div>
              <button
                class="btn btn-primary me-2"
                @click="generateReport"
                :disabled="loading"
              >
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                Generate Report
              </button>
              <button
                class="btn btn-outline-secondary"
                @click="exportReport"
                :disabled="!reportData.length || loading"
              >
                <i class="fas fa-download me-1"></i>Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Report Tabs -->
    <div class="card">
      <div class="card-header">
        <ul class="nav nav-tabs card-header-tabs">
          <li class="nav-item">
            <a
              class="nav-link"
              :class="{ active: activeTab === 'summary' }"
              href="#"
              @click.prevent="activeTab = 'summary'"
            >
              Waste Collection Summary
            </a>
          </li>
          <li class="nav-item">
            <a
              class="nav-link"
              :class="{ active: activeTab === 'subscriber' }"
              href="#"
              @click.prevent="activeTab = 'subscriber'"
            >
              Subscriber Activity
            </a>
          </li>
          <li class="nav-item">
            <a
              class="nav-link"
              :class="{ active: activeTab === 'performance' }"
              href="#"
              @click.prevent="activeTab = 'performance'"
            >
              Collection Point Performance
            </a>
          </li>
          <li class="nav-item" v-if="canViewAuditLogs">
            <a
              class="nav-link"
              :class="{ active: activeTab === 'audit' }"
              href="#"
              @click.prevent="activeTab = 'audit'"
            >
              Audit Log
            </a>
          </li>
        </ul>
      </div>

      <div class="card-body">
        <!-- Waste Collection Summary -->
        <div v-if="activeTab === 'summary'">
          <div v-if="reportData.length === 0" class="text-center text-muted py-5">
            <i class="fas fa-chart-bar fa-3x mb-3"></i>
            <p>No data available. Generate a report to view results.</p>
          </div>
          <div v-else>
            <div class="table-responsive">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Local Government Area</th>
                    <th>Waste Type</th>
                    <th>Collections</th>
                    <th>Total Volume (m³)</th>
                    <th>Total Weight (tons)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in reportData" :key="`${row.period}-${row.local_government_area}-${row.waste_type}`">
                    <td>{{ formatPeriod(row.period) }}</td>
                    <td>{{ row.local_government_area }}</td>
                    <td>{{ row.waste_type }}</td>
                    <td>{{ row.collection_count }}</td>
                    <td>{{ formatNumber(row.total_volume) }}</td>
                    <td>{{ formatNumber(row.total_weight) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Subscriber Activity -->
        <div v-if="activeTab === 'subscriber'">
          <div class="row mb-3">
            <div class="col-md-4">
              <label class="form-label">Business Type</label>
              <select
                class="form-select"
                v-model="filters.businessType"
                @change="generateReport"
              >
                <option value="">All Types</option>
                <option
                  v-for="type in businessTypes"
                  :key="type"
                  :value="type"
                >
                  {{ type }}
                </option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label">Service Category</label>
              <select
                class="form-select"
                v-model="filters.serviceCategory"
                @change="generateReport"
              >
                <option value="">All Categories</option>
                <option
                  v-for="category in serviceCategories"
                  :key="category"
                  :value="category"
                >
                  {{ category }}
                </option>
              </select>
            </div>
          </div>

          <div v-if="reportData.length === 0" class="text-center text-muted py-5">
            <i class="fas fa-building fa-3x mb-3"></i>
            <p>No subscriber data available.</p>
          </div>
          <div v-else>
            <div class="table-responsive">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>Business Name</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Collection Point</th>
                    <th>Collections</th>
                    <th>Total Volume (m³)</th>
                    <th>Total Weight (tons)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in reportData" :key="row.business_name">
                    <td>{{ row.business_name }}</td>
                    <td>{{ row.business_type }}</td>
                    <td>{{ row.service_category }}</td>
                    <td>{{ row.collection_point_name }}</td>
                    <td>{{ row.collection_count }}</td>
                    <td>{{ formatNumber(row.total_volume) }}</td>
                    <td>{{ formatNumber(row.total_weight) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Collection Point Performance -->
        <div v-if="activeTab === 'performance'">
          <div v-if="reportData.length === 0" class="text-center text-muted py-5">
            <i class="fas fa-tachometer-alt fa-3x mb-3"></i>
            <p>No performance data available.</p>
          </div>
          <div v-else>
            <div class="table-responsive">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>Collection Point</th>
                    <th>Local Government Area</th>
                    <th>Subscribers</th>
                    <th>Collections</th>
                    <th>Total Volume (m³)</th>
                    <th>Total Weight (tons)</th>
                    <th>Avg Weight/Collection</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in reportData" :key="row.collection_point_name">
                    <td>{{ row.collection_point_name }}</td>
                    <td>{{ row.local_government_area }}</td>
                    <td>{{ row.subscriber_count }}</td>
                    <td>{{ row.collection_count }}</td>
                    <td>{{ formatNumber(row.total_volume) }}</td>
                    <td>{{ formatNumber(row.total_weight) }}</td>
                    <td>{{ formatNumber(row.avg_weight_per_collection) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Audit Log -->
        <div v-if="activeTab === 'audit'">
          <div class="row mb-3">
            <div class="col-md-4">
              <label class="form-label">User</label>
              <select
                class="form-select"
                v-model="filters.userId"
                @change="generateReport"
              >
                <option value="">All Users</option>
                <option
                  v-for="user in users"
                  :key="user.id"
                  :value="user.id"
                >
                  {{ user.username }}
                </option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label">Action</label>
              <select
                class="form-select"
                v-model="filters.action"
                @change="generateReport"
              >
                <option value="">All Actions</option>
                <option value="POST">Create</option>
                <option value="PUT">Update</option>
                <option value="DELETE">Delete</option>
              </select>
            </div>
          </div>

          <div v-if="reportData.length === 0" class="text-center text-muted py-5">
            <i class="fas fa-history fa-3x mb-3"></i>
            <p>No audit log entries found.</p>
          </div>
          <div v-else>
            <div class="table-responsive">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Table</th>
                    <th>Record ID</th>
                    <th>IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in reportData" :key="row.id">
                    <td>{{ formatDateTime(row.created_at) }}</td>
                    <td>{{ row.user_name }}</td>
                    <td>
                      <span
                        class="badge"
                        :class="getActionBadgeClass(row.action)"
                      >
                        {{ row.action }}
                      </span>
                    </td>
                    <td>{{ row.table_name }}</td>
                    <td>{{ row.record_id }}</td>
                    <td>{{ row.ip_address }}</td>
                  </tr>
                </tbody>
              </table>
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
  name: 'Reports',
  setup() {
    const authStore = useAuthStore()

    const activeTab = ref('summary')
    const reportData = ref([])
    const loading = ref(false)
    const lgas = ref([])
    const businessTypes = ref([])
    const serviceCategories = ref([])
    const users = ref([])

    const filters = ref({
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      localGovernmentArea: '',
      businessType: '',
      serviceCategory: '',
      userId: '',
      action: ''
    })

    const canViewAuditLogs = computed(() => authStore.canViewAuditLogs)

    const generateReport = async () => {
      loading.value = true

      try {
        let endpoint, params

        switch (activeTab.value) {
          case 'summary':
            endpoint = '/reports/waste-collection-summary'
            params = {
              startDate: filters.value.startDate,
              endDate: filters.value.endDate,
              localGovernmentArea: filters.value.localGovernmentArea || undefined
            }
            break

          case 'subscriber':
            endpoint = '/reports/subscriber-activity'
            params = {
              startDate: filters.value.startDate,
              endDate: filters.value.endDate,
              businessType: filters.value.businessType || undefined,
              serviceCategory: filters.value.serviceCategory || undefined,
              localGovernmentArea: filters.value.localGovernmentArea || undefined
            }
            break

          case 'performance':
            endpoint = '/reports/collection-point-performance'
            params = {
              startDate: filters.value.startDate,
              endDate: filters.value.endDate,
              localGovernmentArea: filters.value.localGovernmentArea || undefined
            }
            break

          case 'audit':
            endpoint = '/reports/audit'
            params = {
              startDate: filters.value.startDate,
              endDate: filters.value.endDate,
              userId: filters.value.userId || undefined,
              action: filters.value.action || undefined
            }
            break
        }

        const response = await api.get(endpoint, { params })
        reportData.value = response.data

      } catch (error) {
        console.error('Failed to generate report:', error)
        reportData.value = []
      } finally {
        loading.value = false
      }
    }

    const exportReport = async () => {
      if (!reportData.value.length) return

      try {
        const endpoint = activeTab.value === 'summary' ? '/reports/waste-collection-summary' :
                        activeTab.value === 'subscriber' ? '/reports/subscriber-activity' :
                        activeTab.value === 'performance' ? '/reports/collection-point-performance' :
                        '/reports/audit'

        const params = { ...filters.value, format: 'csv' }

        // Remove empty filters
        Object.keys(params).forEach(key => {
          if (!params[key]) delete params[key]
        })

        const response = await api.get(endpoint, {
          params,
          responseType: 'blob'
        })

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `${activeTab.value}_report.csv`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)

      } catch (error) {
        console.error('Failed to export report:', error)
      }
    }

    const formatPeriod = (period) => {
      if (!period) return ''
      const date = new Date(period)
      return date.toLocaleDateString()
    }

    const formatNumber = (num) => {
      if (!num && num !== 0) return '0.0'
      return Number(num).toFixed(1)
    }

    const formatDateTime = (dateString) => {
      return new Date(dateString).toLocaleString()
    }

    const getActionBadgeClass = (action) => {
      switch (action) {
        case 'POST': return 'bg-success'
        case 'PUT': return 'bg-warning'
        case 'DELETE': return 'bg-danger'
        default: return 'bg-secondary'
      }
    }

    onMounted(async () => {
      // Load filter options
      try {
        const [pointsRes, subscribersRes] = await Promise.all([
          api.get('/collection-points'),
          api.get('/subscribers')
        ])

        lgas.value = [...new Set([
          ...pointsRes.data.map(p => p.local_government_area),
          ...subscribersRes.data.map(s => s.local_government_area)
        ])].filter(Boolean).sort()

        businessTypes.value = [...new Set(subscribersRes.data.map(s => s.business_type))].filter(Boolean).sort()
        serviceCategories.value = [...new Set(subscribersRes.data.map(s => s.service_category))].filter(Boolean).sort()

        // Generate initial report
        generateReport()
      } catch (error) {
        console.error('Failed to load filter options:', error)
      }
    })

    return {
      activeTab,
      reportData,
      loading,
      lgas,
      businessTypes,
      serviceCategories,
      users,
      filters,
      canViewAuditLogs,
      generateReport,
      exportReport,
      formatPeriod,
      formatNumber,
      formatDateTime,
      getActionBadgeClass
    }
  }
}
</script>

<style scoped>
.nav-tabs .nav-link {
  border: none;
  color: #6c757d;
}

.nav-tabs .nav-link.active {
  background-color: #0d6efd;
  color: white;
  border-color: #0d6efd;
}

.table-responsive {
  max-height: 600px;
  overflow-y: auto;
}

.badge {
  font-size: 0.75em;
}
</style>