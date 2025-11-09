/**
 * Geographic utility functions for spatial operations
 */

/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in meters
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 * @param {number} radians - Angle in radians
 * @returns {number} Angle in degrees
 */
function toDegrees(radians) {
  return radians * (180 / Math.PI);
}

/**
 * Validate latitude value
 * @param {number} lat - Latitude to validate
 * @returns {boolean} True if valid
 */
function isValidLatitude(lat) {
  return lat >= -90 && lat <= 90 && !isNaN(lat);
}

/**
 * Validate longitude value
 * @param {number} lng - Longitude to validate
 * @returns {boolean} True if valid
 */
function isValidLongitude(lng) {
  return lng >= -180 && lng <= 180 && !isNaN(lng);
}

/**
 * Validate GPS coordinates
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {boolean} True if both coordinates are valid
 */
function isValidCoordinates(lat, lng) {
  return isValidLatitude(lat) && isValidLongitude(lng);
}

/**
 * Calculate bounding box for a point with radius
 * @param {number} lat - Center latitude
 * @param {number} lng - Center longitude
 * @param {number} radiusMeters - Radius in meters
 * @returns {Object} Bounding box with minLat, maxLat, minLng, maxLng
 */
function calculateBoundingBox(lat, lng, radiusMeters) {
  const latChange = (radiusMeters / 111320) / Math.cos(toRadians(lat));
  const lngChange = radiusMeters / 111320;

  return {
    minLat: lat - latChange,
    maxLat: lat + latChange,
    minLng: lng - lngChange,
    maxLng: lng + lngChange
  };
}

/**
 * Format coordinates for display
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} precision - Decimal precision (default: 6)
 * @returns {string} Formatted coordinates string
 */
function formatCoordinates(lat, lng, precision = 6) {
  return `${lat.toFixed(precision)}, ${lng.toFixed(precision)}`;
}

/**
 * Parse coordinate string
 * @param {string} coordString - Coordinate string like "lat,lng" or "lat lng"
 * @returns {Object|null} Object with lat and lng properties, or null if invalid
 */
function parseCoordinates(coordString) {
  if (!coordString || typeof coordString !== 'string') {
    return null;
  }

  const parts = coordString.replace(/\s+/g, '').split(/[,\s]+/);
  if (parts.length !== 2) {
    return null;
  }

  const lat = parseFloat(parts[0]);
  const lng = parseFloat(parts[1]);

  if (!isValidCoordinates(lat, lng)) {
    return null;
  }

  return { lat, lng };
}

/**
 * Calculate center point of multiple coordinates
 * @param {Array} coordinates - Array of [lng, lat] pairs
 * @returns {Array} [lng, lat] center point
 */
function calculateCenter(coordinates) {
  if (!coordinates || coordinates.length === 0) {
    return [0, 0];
  }

  let totalLng = 0;
  let totalLat = 0;

  coordinates.forEach(coord => {
    totalLng += coord[0];
    totalLat += coord[1];
  });

  return [totalLng / coordinates.length, totalLat / coordinates.length];
}

module.exports = {
  calculateDistance,
  toRadians,
  toDegrees,
  isValidLatitude,
  isValidLongitude,
  isValidCoordinates,
  calculateBoundingBox,
  formatCoordinates,
  parseCoordinates,
  calculateCenter
};