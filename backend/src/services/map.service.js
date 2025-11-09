const config = require('../config/default.json');

class MapService {
  constructor() {
    this.defaultCenter = config.maps.defaultCenter;
    this.defaultZoom = config.maps.defaultZoom;
  }

  getMapConfig() {
    return {
      center: this.defaultCenter,
      zoom: this.defaultZoom,
      maxZoom: config.maps.maxZoom,
      minZoom: config.maps.minZoom
    };
  }

  // Convert collection points to GeoJSON format
  pointsToGeoJSON(points) {
    return {
      type: 'FeatureCollection',
      features: points.map(point => ({
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
    };
  }

  // Convert subscribers to GeoJSON format
  subscribersToGeoJSON(subscribers) {
    return {
      type: 'FeatureCollection',
      features: subscribers.map(subscriber => ({
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
    };
  }

  // Calculate the center point of multiple coordinates
  calculateCenter(coordinates) {
    if (!coordinates.length) {
      return this.defaultCenter;
    }

    const total = coordinates.reduce(
      (acc, coord) => ({
        lat: acc.lat + coord[1],
        lng: acc.lng + coord[0]
      }),
      { lat: 0, lng: 0 }
    );

    return [
      total.lng / coordinates.length,
      total.lat / coordinates.length
    ];
  }

  // Calculate bounds that include all points
  calculateBounds(coordinates) {
    if (!coordinates.length) {
      return null;
    }

    const bounds = coordinates.reduce(
      (acc, coord) => ({
        minLat: Math.min(acc.minLat, coord[1]),
        maxLat: Math.max(acc.maxLat, coord[1]),
        minLng: Math.min(acc.minLng, coord[0]),
        maxLng: Math.max(acc.maxLng, coord[0])
      }),
      {
        minLat: 90,
        maxLat: -90,
        minLng: 180,
        maxLng: -180
      }
    );

    return [
      [bounds.minLat, bounds.minLng],
      [bounds.maxLat, bounds.maxLng]
    ];
  }

  // Create a style function for different point types
  getMarkerStyle(feature) {
    const defaultStyle = {
      radius: 8,
      stroke: true,
      weight: 1
    };

    if (feature.properties.type === 'collection_point') {
      return {
        ...defaultStyle,
        fillColor: feature.properties.isActive ? '#2ecc71' : '#95a5a6',
        color: '#27ae60',
        fillOpacity: 0.7
      };
    }

    // Subscriber styles based on business type
    const businessTypeColors = {
      restaurant: '#e74c3c',
      factory: '#3498db',
      bank: '#f1c40f',
      'filling_station': '#9b59b6',
      default: '#34495e'
    };

    return {
      ...defaultStyle,
      fillColor: businessTypeColors[feature.properties.businessType] || businessTypeColors.default,
      color: '#2c3e50',
      fillOpacity: feature.properties.isActive ? 0.7 : 0.3
    };
  }
}

module.exports = new MapService();
