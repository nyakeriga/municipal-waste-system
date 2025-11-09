const db = require('../config/db');
const { generateCsv } = require('../utils/csv-export');

class ReportsController {
  async getWasteCollectionSummary(req, res) {
    const { startDate, endDate, groupBy } = req.query;

    try {
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
          groupByClause = 'DATE_TRUNC(\'month\', ce.collection_date)';
          selectFields = 'DATE_TRUNC(\'month\', ce.collection_date) as period';
          break;
        default:
          groupByClause = 'DATE_TRUNC(\'month\', ce.collection_date)';
          selectFields = 'DATE_TRUNC(\'month\', ce.collection_date) as period';
      }

      const query = `
        SELECT ${selectFields},
               cp.local_government_area,
               wt.name as waste_type,
               COUNT(*) as collection_count,
               SUM(ce.volume_cubic_meters) as total_volume,
               SUM(ce.weight_tons) as total_weight
        FROM collection_events ce
        JOIN collection_points cp ON ce.collection_point_id = cp.id
        JOIN waste_types wt ON ce.waste_type_id = wt.id
        WHERE ce.collection_date BETWEEN $1 AND $2
        GROUP BY ${groupByClause}, cp.local_government_area, wt.name
        ORDER BY period DESC, cp.local_government_area, wt.name
      `;

      const result = await db.query(query, [startDate, endDate]);

      if (req.query.format === 'csv') {
        const csv = await generateCsv(result.rows, [
          { id: 'period', title: 'Period' },
          { id: 'local_government_area', title: 'Local Government Area' },
          { id: 'waste_type', title: 'Waste Type' },
          { id: 'collection_count', title: 'Collections' },
          { id: 'total_volume', title: 'Total Volume (m³)' },
          { id: 'total_weight', title: 'Total Weight (tons)' }
        ]);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=waste_collection_summary.csv');
        return res.send(csv);
      }

      res.json(result.rows);
    } catch (error) {
      console.error('Get waste collection summary error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getSubscriberActivityReport(req, res) {
    const { startDate, endDate, serviceCategory, businessType } = req.query;

    try {
      const query = `
        SELECT s.business_name,
               s.business_type,
               s.service_category,
               cp.name as collection_point_name,
               cp.local_government_area,
               COUNT(ce.id) as collection_count,
               SUM(ce.volume_cubic_meters) as total_volume,
               SUM(ce.weight_tons) as total_weight,
               AVG(ce.weight_tons) as avg_weight_per_collection
        FROM subscribers s
        JOIN collection_points cp ON s.collection_point_id = cp.id
        LEFT JOIN collection_events ce ON ce.collection_point_id = cp.id
        WHERE ce.collection_date BETWEEN $1 AND $2
        ${serviceCategory ? 'AND s.service_category = $3' : ''}
        ${businessType ? 'AND s.business_type = $4' : ''}
        GROUP BY s.id, cp.id
        ORDER BY total_weight DESC
      `;

      const params = [startDate, endDate];
      if (serviceCategory) params.push(serviceCategory);
      if (businessType) params.push(businessType);

      const result = await db.query(query, params);

      if (req.query.format === 'csv') {
        const csv = await generateCsv(result.rows, [
          { id: 'business_name', title: 'Business Name' },
          { id: 'business_type', title: 'Business Type' },
          { id: 'service_category', title: 'Service Category' },
          { id: 'collection_point_name', title: 'Collection Point' },
          { id: 'local_government_area', title: 'Local Government Area' },
          { id: 'collection_count', title: 'Total Collections' },
          { id: 'total_volume', title: 'Total Volume (m³)' },
          { id: 'total_weight', title: 'Total Weight (tons)' },
          { id: 'avg_weight_per_collection', title: 'Avg Weight per Collection (tons)' }
        ]);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=subscriber_activity_report.csv');
        return res.send(csv);
      }

      res.json(result.rows);
    } catch (error) {
      console.error('Get subscriber activity report error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getCollectionPointPerformance(req, res) {
    const { startDate, endDate, localGovernmentArea } = req.query;

    try {
      const query = `
        SELECT cp.name as collection_point_name,
               cp.local_government_area,
               COUNT(DISTINCT s.id) as subscriber_count,
               COUNT(ce.id) as collection_count,
               SUM(ce.volume_cubic_meters) as total_volume,
               SUM(ce.weight_tons) as total_weight,
               AVG(ce.weight_tons) as avg_weight_per_collection,
               ARRAY_AGG(DISTINCT wt.name) as waste_types_handled
        FROM collection_points cp
        LEFT JOIN subscribers s ON cp.id = s.collection_point_id
        LEFT JOIN collection_events ce ON cp.id = ce.collection_point_id
        LEFT JOIN waste_types wt ON ce.waste_type_id = wt.id
        WHERE ce.collection_date BETWEEN $1 AND $2
        ${localGovernmentArea ? 'AND cp.local_government_area = $3' : ''}
        GROUP BY cp.id
        ORDER BY total_weight DESC NULLS LAST
      `;

      const params = [startDate, endDate];
      if (localGovernmentArea) params.push(localGovernmentArea);

      const result = await db.query(query, params);

      if (req.query.format === 'csv') {
        const csv = await generateCsv(result.rows, [
          { id: 'collection_point_name', title: 'Collection Point' },
          { id: 'local_government_area', title: 'Local Government Area' },
          { id: 'subscriber_count', title: 'Total Subscribers' },
          { id: 'collection_count', title: 'Total Collections' },
          { id: 'total_volume', title: 'Total Volume (m³)' },
          { id: 'total_weight', title: 'Total Weight (tons)' },
          { id: 'avg_weight_per_collection', title: 'Avg Weight per Collection (tons)' },
          { id: 'waste_types_handled', title: 'Waste Types Handled' }
        ]);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=collection_point_performance.csv');
        return res.send(csv);
      }

      res.json(result.rows);
    } catch (error) {
      console.error('Get collection point performance error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getAuditReport(req, res) {
    const { startDate, endDate, userId, action, tableName } = req.query;

    try {
      let query = `
        SELECT al.*,
               u.username as user_name,
               u.email as user_email
        FROM audit_logs al
        JOIN users u ON al.user_id = u.id
        WHERE created_at BETWEEN $1 AND $2
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

      if (req.query.format === 'csv') {
        const csv = await generateCsv(result.rows, [
          { id: 'created_at', title: 'Timestamp' },
          { id: 'user_name', title: 'Username' },
          { id: 'user_email', title: 'User Email' },
          { id: 'action', title: 'Action' },
          { id: 'table_name', title: 'Table' },
          { id: 'record_id', title: 'Record ID' },
          { id: 'ip_address', title: 'IP Address' },
          { id: 'changes', title: 'Changes' }
        ]);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=audit_report.csv');
        return res.send(csv);
      }

      res.json(result.rows);
    } catch (error) {
      console.error('Get audit report error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

module.exports = new ReportsController();
