<template>
  <div class="map-container">
    <l-map
      ref="map"
      v-model:zoom="zoom"
      :center="center"
      :options="mapOptions"
      @update:bounds="handleBoundsUpdate"
    >
      <l-tile-layer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      
      <l-control-layers position="topright" />
      
      <!-- Collection Points Layer -->
      <l-geo-json
        v-if="collectionPoints.features.length"
        :geojson="collectionPoints"
        :options="collectionPointsOptions"
        @click="handlePointClick"
      />
      
      <!-- Subscribers Layer -->
      <l-geo-json
        v-if="subscribers.features.length"
        :geojson="subscribers"
        :options="subscribersOptions"
        @click="handleSubscriberClick"
      />
      
      <l-control position="bottomright">
        <div class="map-legend">
          <h4>Legend</h4>
          <div class="legend-item">
            <span class="legend-marker collection-point-active"></span>
            Active Collection Point
          </div>
          <div class="legend-item">
            <span class="legend-marker collection-point-inactive"></span>
            Inactive Collection Point
          </div>
          <div class="legend-item">
            <span class="legend-marker subscriber-restaurant"></span>
            Restaurant
          </div>
          <div class="legend-item">
            <span class="legend-marker subscriber-factory"></span>
            Factory
          </div>
          <div class="legend-item">
            <span class="legend-marker subscriber-bank"></span>
            Bank
          </div>
          <div class="legend-item">
            <span class="legend-marker subscriber-filling-station"></span>
            Filling Station
          </div>
        </div>
      </l-control>
    </l-map>
    
    <!-- Point Details Modal -->
    <modal v-if="selectedPoint" @close="selectedPoint = null">
      <template #header>
        <h3>{{ getModalTitle }}</h3>
      </template>
      
      <template #body>
        <div v-if="selectedPoint.properties.type === 'collection_point'">
          <div class="detail-row">
            <strong>Address:</strong> {{ selectedPoint.properties.address }}
          </div>
          <div class="detail-row">
            <strong>LGA:</strong> {{ selectedPoint.properties.localGovernmentArea }}
          </div>
          <div class="detail-row">
            <strong>Status:</strong>
            <span :class="{'text-success': selectedPoint.properties.isActive, 'text-danger': !selectedPoint.properties.isActive}">
              {{ selectedPoint.properties.isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>
        </div>
        
        <div v-else>
          <div class="detail-row">
            <strong>Business Name:</strong> {{ selectedPoint.properties.businessName }}
          </div>
          <div class="detail-row">
            <strong>Type:</strong> {{ selectedPoint.properties.businessType }}
          </div>
          <div class="detail-row">
            <strong>Category:</strong> {{ selectedPoint.properties.serviceCategory }}
          </div>
          <div class="detail-row">
            <strong>Address:</strong> {{ selectedPoint.properties.address }}
          </div>
          <div class="detail-row">
            <strong>Status:</strong>
            <span :class="{'text-success': selectedPoint.properties.isActive, 'text-danger': !selectedPoint.properties.isActive}">
              {{ selectedPoint.properties.isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>
        </div>
      </template>
      
      <template #footer>
        <button class="btn btn-primary" @click="editPoint">Edit</button>
        <button class="btn btn-secondary" @click="selectedPoint = null">Close</button>
      </template>
    </modal>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import {
  LMap,
  LTileLayer,
  LControlLayers,
  LGeoJson,
  LControl
} from '@vue-leaflet/vue-leaflet';
import 'leaflet/dist/leaflet.css';

export default {
  name: 'MapBase',
  
  components: {
    LMap,
    LTileLayer,
    LControlLayers,
    LGeoJson,
    LControl
  },
  
  props: {
    initialCenter: {
      type: Array,
      default: () => [-1.292066, 36.821945]
    },
    initialZoom: {
      type: Number,
      default: 12
    },
    collectionPoints: {
      type: Object,
      default: () => ({ type: 'FeatureCollection', features: [] })
    },
    subscribers: {
      type: Object,
      default: () => ({ type: 'FeatureCollection', features: [] })
    }
  },
  
  setup(props, { emit }) {
    const map = ref(null);
    const zoom = ref(props.initialZoom);
    const center = ref(props.initialCenter);
    const selectedPoint = ref(null);
    
    const mapOptions = {
      zoomControl: true,
      maxZoom: 18,
      minZoom: 8
    };
    
    const collectionPointsOptions = {
      pointToLayer: (feature, latlng) => {
        return L.circleMarker(latlng, {
          radius: 8,
          fillColor: feature.properties.isActive ? '#2ecc71' : '#95a5a6',
          color: '#27ae60',
          weight: 1,
          opacity: 1,
          fillOpacity: 0.7
        });
      }
    };
    
    const subscribersOptions = {
      pointToLayer: (feature, latlng) => {
        const businessTypeColors = {
          restaurant: '#e74c3c',
          factory: '#3498db',
          bank: '#f1c40f',
          'filling_station': '#9b59b6',
          default: '#34495e'
        };
        
        return L.circleMarker(latlng, {
          radius: 8,
          fillColor: businessTypeColors[feature.properties.businessType] || businessTypeColors.default,
          color: '#2c3e50',
          weight: 1,
          opacity: 1,
          fillOpacity: feature.properties.isActive ? 0.7 : 0.3
        });
      }
    };
    
    const getModalTitle = computed(() => {
      if (!selectedPoint.value) return '';
      return selectedPoint.value.properties.type === 'collection_point'
        ? 'Collection Point Details'
        : 'Subscriber Details';
    });
    
    const handleBoundsUpdate = (bounds) => {
      emit('update:bounds', bounds);
    };
    
    const handlePointClick = (e) => {
      selectedPoint.value = e.layer.feature;
    };
    
    const handleSubscriberClick = (e) => {
      selectedPoint.value = e.layer.feature;
    };
    
    const editPoint = () => {
      if (!selectedPoint.value) return;
      
      emit('edit', {
        type: selectedPoint.value.properties.type,
        id: selectedPoint.value.properties.id
      });
      
      selectedPoint.value = null;
    };
    
    return {
      map,
      zoom,
      center,
      selectedPoint,
      mapOptions,
      collectionPointsOptions,
      subscribersOptions,
      getModalTitle,
      handleBoundsUpdate,
      handlePointClick,
      handleSubscriberClick,
      editPoint
    };
  }
};
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.map-legend {
  background: white;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.legend-item {
  margin: 5px 0;
  display: flex;
  align-items: center;
}

.legend-marker {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
  border: 1px solid #2c3e50;
}

.collection-point-active {
  background-color: #2ecc71;
}

.collection-point-inactive {
  background-color: #95a5a6;
}

.subscriber-restaurant {
  background-color: #e74c3c;
}

.subscriber-factory {
  background-color: #3498db;
}

.subscriber-bank {
  background-color: #f1c40f;
}

.subscriber-filling-station {
  background-color: #9b59b6;
}

.detail-row {
  margin: 8px 0;
}

.text-success {
  color: #2ecc71;
}

.text-danger {
  color: #e74c3c;
}
</style>
