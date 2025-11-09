<template>
  <div class="map-view">
    <div class="row mb-3">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <h2>City Map</h2>
          <div class="btn-group" role="group">
            <button
              type="button"
              class="btn btn-outline-primary"
              :class="{ active: activeLayer === 'collection_points' }"
              @click="activeLayer = 'collection_points'"
            >
              Collection Points
            </button>
            <button
              type="button"
              class="btn btn-outline-success"
              :class="{ active: activeLayer === 'subscribers' }"
              @click="activeLayer = 'subscribers'"
            >
              Subscribers
            </button>
            <button
              type="button"
              class="btn btn-outline-info"
              :class="{ active: activeLayer === 'both' }"
              @click="activeLayer = 'both'"
            >
              Both
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-md-9">
        <div class="card">
          <div class="card-body p-0">
            <MapBase
              :collection-points="displayCollectionPoints"
              :subscribers="displaySubscribers"
              @edit="handleEdit"
            />
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="card mb-3">
          <div class="card-header">
            <h6 class="mb-0">Filters</h6>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label class="form-label">Local Government Area</label>
              <select
                class="form-select form-select-sm"
                v-model="filters.lga"
                @change="loadData"
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

            <div class="mb-3" v-if="activeLayer === 'subscribers' || activeLayer === 'both'">
              <label class="form-label">Business Type</label>
              <select
                class="form-select form-select-sm"
                v-model="filters.businessType"
                @change="loadData"
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

            <div class="mb-3" v-if="activeLayer === 'subscribers' || activeLayer === 'both'">
              <label class="form-label">Service Category</label>
              <select
                class="form-select form-select-sm"
                v-model="filters.serviceCategory"
                @change="loadData"
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
        </div>

        <div class="card">
          <div class="card-header">
            <h6 class="mb-0">Statistics</h6>
          </div>
          <div class="card-body">
            <div class="stat-item">
              <span class="stat-label">Collection Points:</span>
              <span class="stat-value">{{ collectionPoints.length }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Subscribers:</span>
              <span class="stat-value">{{ subscribers.length }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Active Points:</span>
              <span class="stat-value">{{ activeCollectionPoints }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MapBase from '../components/Map/MapBase.vue'
import api from '../services/api'

export default {
  name: 'MapView',
  components: {
    MapBase
  },
  setup() {
    const router = useRouter()

    const activeLayer = ref('both')
    const collectionPoints = ref([])
    const subscribers = ref([])
    const lgas = ref([])
    const businessTypes = ref([])
    const serviceCategories = ref([])

    const filters = ref({
      lga: '',
      businessType: '',
      serviceCategory: ''
    })

    const displayCollectionPoints = computed(() => {
      if (activeLayer.value === 'subscribers') return { type: 'FeatureCollection', features: [] }

      let filtered = collectionPoints.value
      if (filters.value.lga) {
        filtered = filtered.filter(point => point.local_government_area === filters.value.lga)
      }

      return {
        type: 'FeatureCollection',
        features: filtered.map(point => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [point.longitude, point.latitude]
          },
          properties: {
            id: point.id,
            name: point.name,
            address: point.address,
            localGovernmentArea: point.local_government_area,
            isActive: point.is_active,
            type: 'collection_point'
          }
        }))
      }
    })

    const displaySubscribers = computed(() => {
      if (activeLayer.value === 'collection_points') return { type: 'FeatureCollection', features: [] }

      let filtered = subscribers.value
      if (filters.value.lga) {
        filtered = filtered.filter(sub => sub.local_government_area === filters.value.lga)
      }
      if (filters.value.businessType) {
        filtered = filtered.filter(sub => sub.business_type === filters.value.businessType)
      }
      if (filters.value.serviceCategory) {
        filtered = filtered.filter(sub => sub.service_category === filters.value.serviceCategory)
      }

      return {
        type: 'FeatureCollection',
        features: filtered.map(subscriber => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [subscriber.longitude, subscriber.latitude]
          },
          properties: {
            id: subscriber.id,
            businessName: subscriber.business_name,
            businessType: subscriber.business_type,
            serviceCategory: subscriber.service_category,
            address: subscriber.address,
            collectionPointId: subscriber.collection_point_id,
            isActive: subscriber.is_active,
            type: 'subscriber'
          }
        }))
      }
    })

    const activeCollectionPoints = computed(() => {
      return collectionPoints.value.filter(point => point.is_active).length
    })

    const loadData = async () => {
      try {
        // Load collection points
        const pointsResponse = await api.get('/collection-points')
        collectionPoints.value = pointsResponse.data

        // Load subscribers
        const subscribersResponse = await api.get('/subscribers')
        subscribers.value = subscribersResponse.data

        // Extract unique values for filters
        lgas.value = [...new Set([
          ...collectionPoints.value.map(p => p.local_government_area),
          ...subscribers.value.map(s => s.local_government_area)
        ])].filter(Boolean).sort()

        businessTypes.value = [...new Set(subscribers.value.map(s => s.business_type))].filter(Boolean).sort()
        serviceCategories.value = [...new Set(subscribers.value.map(s => s.service_category))].filter(Boolean).sort()

      } catch (error) {
        console.error('Failed to load map data:', error)
      }
    }

    const handleEdit = (data) => {
      if (data.type === 'collection_point') {
        router.push(`/collection-points/${data.id}/edit`)
      } else {
        router.push(`/subscribers/${data.id}/edit`)
      }
    }

    onMounted(() => {
      loadData()
    })

    return {
      activeLayer,
      collectionPoints,
      subscribers,
      lgas,
      businessTypes,
      serviceCategories,
      filters,
      displayCollectionPoints,
      displaySubscribers,
      activeCollectionPoints,
      loadData,
      handleEdit
    }
  }
}
</script>

<style scoped>
.map-view {
  height: calc(100vh - 200px);
}

.btn-group .btn {
  border-radius: 0.375rem !important;
}

.btn-group .btn:not(:last-child) {
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
}

.btn-group .btn:not(:first-child) {
  border-top-left-radius: 0 !important;
  border-bottom-left-radius: 0 !important;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-weight: 500;
  color: #6c757d;
}

.stat-value {
  font-weight: bold;
  color: #495057;
}

.card {
  height: fit-content;
}
</style>