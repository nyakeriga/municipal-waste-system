const db = require('../config/db');
const { generateCsv } = require('../utils/csv-export');

class ReportingService {
  /**
   * Generate waste collection summary report
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Report data
   */
  async generateWasteCollectionSummary(filters = {}) {
    const {
      startDate,
      endDate,
      groupBy = 'monthly',
      localGovernmentArea,
      wasteTypeId
    } = filters;

    let groupByClause, selectFields;

    switch (groupBy) {
      case 'daily':
        groupByClause = 'DATE(ce.collection_date)';
        selectFields = 'DATE(ce.collection_date) as period';
        break;
      case 'weekly':
        groupByClause = 'DATE_TRUNC(\'week\', ce.collection_date)';
        selectFields = 'DATE_TRUNC(\'week\', ce.collection_date) as period';
        break;
      case 'monthly':
      default:
        groupByClause = 'DATE_TRUNC(\'month\', ce.collection_date)';
        selectFields = 'DATE_TRUNC(\'month\', ce.collection_date) as period';
    }

    let query = `
      SELECT ${selectFields},
             cp.local_government_area,
             wt.name as waste_type,
             COUNT(*) as collection_count,
             SUM(ce.volume_cubic_meters) as total_volume,
             SUM(ce.weight_tons) as total_weight
      FROM collection_events ce
      JOIN collection_points cp ON ce.collection_point_id = cp.id
      JOIN waste_types wt ON ce.waste_type_id = wt.id
      WHERE 1=1
    `;

    const params = [];

    if (startDate) {
      query += ` AND ce.collection_date >= $${params.length + 1}`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND ce.collection_date <= $${params.length + 1}`;
      params.push(endDate);
    }

    if (localGovernmentArea) {
      query += ` AND cp.local_government_area = $${params.length + 1}`;
      params.push(localGovernmentArea);
    }

    if (wasteTypeId) {
      query += ` AND ce.waste_type_id = $${params.length + 1}`;
      params.push(wasteTypeId);
    }

    query += ` GROUP BY ${groupByClause}, cp.local_government_area, wt.name
               ORDER BY period DESC, cp.local_government_area, wt.name`;

    const result = await db.query(query, params);
    return result.rows;
  }

  /**
   * Generate subscriber activity report
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Report data
   */
  async generateSubscriberActivityReport(filters = {}) {
    const {
      startDate,
      endDate,
      serviceCategory,
      businessType,
      localGovernmentArea
    } = filters;

    let query = `
      SELECT s.business_name,
             s.business_type,
             s.service_category,
             cp.name as collection_point_name,
             cp.local_government_area,
             COUNT(ce.id) as collection_count,
             COALESCE(SUM(ce.volume_cubic_meters), 0) as total_volume,
             COALESCE(SUM(ce.weight_tons), 0) as total_weight,
             CASE WHEN COUNT(ce.id) > 0 THEN AVG(ce.weight_tons) ELSE 0 END as avg_weight_per_collection
      FROM subscribers s
      JOIN collection_points cp ON s.collection_point_id = cp.id
      LEFT JOIN collection_events ce ON ce.collection_point_id = cp.id
      WHERE s.is_active = true
    `;

    const params = [];

    if (startDate) {
      query += ` AND ce.collection_date >= $${params.length + 1}`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND ce.collection_date <= $${params.length + 1}`;
      params.push(endDate);
    }

    if (serviceCategory) {
      query += ` AND s.service_category = $${params.length + 1}`;
      params.push(serviceCategory);
    }

    if (businessType) {
      query += ` AND s.business_type = $${params.length + 1}`;
      params.push(businessType);
    }

    if (localGovernmentArea) {
      query += ` AND cp.local_government_area = $${params.length + 1}`;
      params.push(localGovernmentArea);
    }

    query += ` GROUP BY s.id, cp.id
               ORDER BY total_weight DESC NULLS LAST`;

    const result = await db.query(query, params);
    return result.rows;
  }

  /**
   * Generate collection point performance report
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Report data
   */
  async generateCollectionPointPerformanceReport(filters = {}) {
    const {
      startDate,
      endDate,
      localGovernmentArea
    } = filters;

    let query = `
      SELECT cp.name as collection_point_name,
             cp.local_government_area,
             COUNT(DISTINCT s.id) as subscriber_count,
             COUNT(ce.id) as collection_count,
             COALESCE(SUM(ce.volume_cubic_meters), 0) as total_volume,
             COALESCE(SUM(ce.weight_tons), 0) as total_weight,
             CASE WHEN COUNT(ce.id) > 0 THEN AVG(ce.weight_tons) ELSE 0 END as avg_weight_per_collection,
             ARRAY_AGG(DISTINCT wt.name) FILTER (WHERE wt.name IS NOT NULL) as waste_types_handled
      FROM collection_points cp
      LEFT JOIN subscribers s ON cp.id = s.collection_point_id AND s.is_active = true
      LEFT JOIN collection_events ce ON cp.id = ce.collection_point_id
      LEFT JOIN waste_types wt ON ce.waste_type_id = wt.id
      WHERE cp.is_active = true
    `;

    const params = [];

    if (startDate) {
      query += ` AND ce.collection_date >= $${params.length + 1}`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND ce.collection_date <= $${params.length + 1}`;
      params.push(endDate);
    }

    if (localGovernmentArea) {
      query += ` AND cp.local_government_area = $${params.length + 1}`;
      params.push(localGovernmentArea);
    }

    query += ` GROUP BY cp.id
               ORDER BY total_weight DESC NULLS LAST`;

    const result = await db.query(query, params);
    return result.rows;
  }

  /**
   * Generate audit report
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Report data
   */
  async generateAuditReport(filters = {}) {
    const {
      startDate,
      endDate,
      userId,
      action,
      tableName
    } = filters;

    let query = `
      SELECT al.*,
             u.username as user_name,
             u.email as user_email
      FROM audit_logs al
      JOIN users u ON al.user_id = u.id
      WHERE al.created_at BETWEEN $1 AND $2
    `;

    const params = [startDate, endDate];

    if (userId) {
      query += ` AND al.user_id = $${params.length + 1}`;
      params.push(userId);
    }

    if (action) {
      query += ` AND al.action = $${params.length + 1}`;
      params.push(action);
    }

    if (tableName) {
      query += ` AND al.table_name = $${params.length + 1}`;
      params.push(tableName);
    }

    query += ' ORDER BY al.created_at DESC';

    const result = await db.query(query, params);
    return result.rows;
  }

  /**
   * Export report to CSV format
   * @param {Array} data - Report data
   * @param {Array} fields - Field definitions
   * @returns {Promise<string>} CSV content
   */
  async exportToCsv(data, fields) {
    return generateCsv(data, fields);
  }

  /**
   * Get dashboard statistics
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Dashboard stats
   */
  async getDashboardStats(filters = {}) {
    const { startDate, endDate } = filters;

    const statsQuery = `
      SELECT
        (SELECT COUNT(*) FROM collection_points WHERE is_active = true) as total_collection_points,
        (SELECT COUNT(*) FROM subscribers WHERE is_active = true) as total_subscribers,
        (SELECT COUNT(*) FROM collection_events WHERE collection_date BETWEEN $1 AND $2) as total_collections,
        (SELECT COALESCE(SUM(volume_cubic_meters), 0) FROM collection_events WHERE collection_date BETWEEN $1 AND $2) as total_volume,
        (SELECT COALESCE(SUM(weight_tons), 0) FROM collection_events WHERE collection_date BETWEEN $1 AND $2) as total_weight
    `;

    const result = await db.query(statsQuery, [startDate, endDate]);
    return result.rows[0];
  }
}

module.exports = new ReportingService();