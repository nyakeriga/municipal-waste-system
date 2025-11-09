<template>
  <div>
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header">
            <h4 class="mb-0">
              {{ isEditing ? 'Edit' : 'Add' }} Collection Point
            </h4>
          </div>
          <div class="card-body">
            <form @submit.prevent="handleSubmit">
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="name" class="form-label">Name *</label>
                    <input
                      type="text"
                      class="form-control"
                      id="name"
                      v-model="form.name"
                      required
                    />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="localGovernmentArea" class="form-label">Local Government Area *</label>
                    <input
                      type="text"
                      class="form-control"
                      id="localGovernmentArea"
                      v-model="form.localGovernmentArea"
                      required
                    />
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label for="address" class="form-label">Address *</label>
                <textarea
                  class="form-control"
                  id="address"
                  rows="3"
                  v-model="form.address"
                  required
                ></textarea>
              </div>

              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="latitude" class="form-label">Latitude *</label>
                    <input
                      type="number"
                      class="form-control"
                      id="latitude"
                      v-model.number="form.latitude"
                      step="0.000001"
                      min="-90"
                      max="90"
                      required
                    />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="longitude" class="form-label">Longitude *</label>
                    <input
                      type="number"
                      class="form-control"
                      id="longitude"
                      v-model.number="form.longitude"
                      step="0.000001"
                      min="-180"
                      max="180"
                      required
                    />
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label for="notes" class="form-label">Notes</label>
                <textarea
                  class="form-control"
                  id="notes"
                  rows="2"
                  v-model="form.notes"
                ></textarea>
              </div>

              <div class="mb-3" v-if="isEditing">
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="isActive"
                    v-model="form.isActive"
                  />
                  <label class="form-check-label" for="isActive">
                    Active
                  </label>
                </div>
              </div>

              <div v-if="error" class="alert alert-danger" role="alert">
                {{ error }}
              </div>

              <div class="d-flex justify-content-between">
                <router-link to="/map" class="btn btn-secondary">
                  Cancel
                </router-link>
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="loading"
                >
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  {{ loading ? 'Saving...' : (isEditing ? 'Update' : 'Create') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../services/api'

export default {
  name: 'CollectionPointForm',
  props: {
    id: {
      type: String,
      default: null
    }
  },
  setup(props) {
    const route = useRoute()
    const router = useRouter()

    const isEditing = ref(!!props.id || !!route.params.id)
    const loading = ref(false)
    const error = ref('')

    const form = ref({
      name: '',
      address: '',
      latitude: null,
      longitude: null,
      localGovernmentArea: '',
      notes: '',
      isActive: true
    })

    const loadCollectionPoint = async (id) => {
      try {
        loading.value = true
        const response = await api.get(`/collection-points/${id}`)
        const point = response.data

        form.value = {
          name: point.name,
          address: point.address,
          latitude: point.latitude,
          longitude: point.longitude,
          localGovernmentArea: point.local_government_area,
          notes: point.notes || '',
          isActive: point.is_active
        }
      } catch (err) {
        error.value = 'Failed to load collection point'
        console.error('Load collection point error:', err)
      } finally {
        loading.value = false
      }
    }

    const handleSubmit = async () => {
      loading.value = true
      error.value = ''

      try {
        const payload = {
          name: form.value.name,
          address: form.value.address,
          latitude: form.value.latitude,
          longitude: form.value.longitude,
          localGovernmentArea: form.value.localGovernmentArea,
          notes: form.value.notes
        }

        if (isEditing.value) {
          payload.isActive = form.value.isActive
          await api.put(`/collection-points/${route.params.id}`, payload)
        } else {
          await api.post('/collection-points', payload)
        }

        router.push('/map')
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to save collection point'
        console.error('Save collection point error:', err)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      if (isEditing.value) {
        loadCollectionPoint(route.params.id)
      }
    })

    return {
      isEditing,
      loading,
      error,
      form,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.card {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom: none;
}
</style>