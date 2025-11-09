<template>
  <div>
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header">
            <h4 class="mb-0">
              {{ isEditing ? 'Edit' : 'Add' }} Subscriber
            </h4>
          </div>
          <div class="card-body">
            <form @submit.prevent="handleSubmit">
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="businessName" class="form-label">Business Name *</label>
                    <input
                      type="text"
                      class="form-control"
                      id="businessName"
                      v-model="form.businessName"
                      required
                    />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="businessType" class="form-label">Business Type *</label>
                    <select
                      class="form-select"
                      id="businessType"
                      v-model="form.businessType"
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="hotel">Hotel</option>
                      <option value="supermarket">Supermarket</option>
                      <option value="shopping_mall">Shopping Mall</option>
                      <option value="bank">Bank</option>
                      <option value="hospital">Hospital</option>
                      <option value="factory">Factory</option>
                      <option value="filling_station">Filling Station</option>
                      <option value="utility_company">Utility Company</option>
                      <option value="media_company">Media Company</option>
                      <option value="technology_company">Technology Company</option>
                      <option value="educational_institution">Educational Institution</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="contactPerson" class="form-label">Contact Person *</label>
                    <input
                      type="text"
                      class="form-control"
                      id="contactPerson"
                      v-model="form.contactPerson"
                      required
                    />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="serviceCategory" class="form-label">Service Category *</label>
                    <select
                      class="form-select"
                      id="serviceCategory"
                      v-model="form.serviceCategory"
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Residential">Residential</option>
                      <option value="Industrial">Industrial</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Educational">Educational</option>
                      <option value="Financial">Financial</option>
                      <option value="Hospitality">Hospitality</option>
                      <option value="Corporate">Corporate</option>
                      <option value="Utility">Utility</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="email" class="form-label">Email</label>
                    <input
                      type="email"
                      class="form-control"
                      id="email"
                      v-model="form.email"
                    />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="phone" class="form-label">Phone *</label>
                    <input
                      type="tel"
                      class="form-control"
                      id="phone"
                      v-model="form.phone"
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
                <label for="collectionPointId" class="form-label">Nearest Collection Point</label>
                <select
                  class="form-select"
                  id="collectionPointId"
                  v-model.number="form.collectionPointId"
                >
                  <option value="">Select Collection Point</option>
                  <option
                    v-for="point in collectionPoints"
                    :key="point.id"
                    :value="point.id"
                  >
                    {{ point.name }} ({{ point.local_government_area }})
                  </option>
                </select>
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
  name: 'SubscriberForm',
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
    const collectionPoints = ref([])

    const form = ref({
      businessName: '',
      businessType: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      latitude: null,
      longitude: null,
      collectionPointId: null,
      serviceCategory: '',
      isActive: true
    })

    const loadSubscriber = async (id) => {
      try {
        loading.value = true
        const response = await api.get(`/subscribers/${id}`)
        const subscriber = response.data

        form.value = {
          businessName: subscriber.business_name,
          businessType: subscriber.business_type,
          contactPerson: subscriber.contact_person,
          email: subscriber.email || '',
          phone: subscriber.phone,
          address: subscriber.address,
          latitude: subscriber.latitude,
          longitude: subscriber.longitude,
          collectionPointId: subscriber.collection_point_id,
          serviceCategory: subscriber.service_category,
          isActive: subscriber.is_active
        }
      } catch (err) {
        error.value = 'Failed to load subscriber'
        console.error('Load subscriber error:', err)
      } finally {
        loading.value = false
      }
    }

    const loadCollectionPoints = async () => {
      try {
        const response = await api.get('/collection-points')
        collectionPoints.value = response.data.filter(point => point.is_active)
      } catch (err) {
        console.error('Load collection points error:', err)
      }
    }

    const handleSubmit = async () => {
      loading.value = true
      error.value = ''

      try {
        const payload = {
          businessName: form.value.businessName,
          businessType: form.value.businessType,
          contactPerson: form.value.contactPerson,
          email: form.value.email,
          phone: form.value.phone,
          address: form.value.address,
          latitude: form.value.latitude,
          longitude: form.value.longitude,
          collectionPointId: form.value.collectionPointId,
          serviceCategory: form.value.serviceCategory
        }

        if (isEditing.value) {
          payload.isActive = form.value.isActive
          await api.put(`/subscribers/${route.params.id}`, payload)
        } else {
          await api.post('/subscribers', payload)
        }

        router.push('/map')
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to save subscriber'
        console.error('Save subscriber error:', err)
      } finally {
        loading.value = false
      }
    }

    onMounted(async () => {
      await loadCollectionPoints()
      if (isEditing.value) {
        loadSubscriber(route.params.id)
      }
    })

    return {
      isEditing,
      loading,
      error,
      collectionPoints,
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