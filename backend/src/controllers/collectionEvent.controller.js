const db = require('../config/db');

class CollectionEventController {
  async create(req, res) {
    const {
      collectionPointId,
      wasteTypeId,
      collectionDate,
      volumeCubicMeters,
      weightTons,
      crewMembers,
      notes
    } = req.body;

    try {
      const result = await db.query(
        `INSERT INTO collection_events (
          collection_point_id,
          waste_type_id,
          collection_date,
          volume_cubic_meters,
          weight_tons,
          crew_members,
          notes,
          created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, collection_point_id, waste_type_id, collection_date,
                  volume_cubic_meters, weight_tons, crew_members, notes,
                  created_by, created_at`,
        [
          collectionPointId,
          wasteTypeId,
          collectionDate,
          volumeCubicMeters,
          weightTons,
          JSON.stringify(crewMembers),
          notes,
          req.user.id
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Create collection event error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getAll(req, res) {
    const {
      startDate,
      endDate,
      collectionPointId,
      wasteTypeId,
      localGovernmentArea
    } = req.query;

    try {
      let query = `
        SELECT ce.*,
               cp.name as collection_point_name,
               cp.local_government_area,
               wt.name as waste_type_name,
               u.username as created_by_user
        FROM collection_events ce
        JOIN collection_points cp ON ce.collection_point_id = cp.id
        JOIN waste_types wt ON ce.waste_type_id = wt.id
        JOIN users u ON ce.created_by = u.id
        WHERE 1=1
      `;

      const params = [];

      // Add date range filter
      if (startDate) {
        query += ` AND ce.collection_date >= $${params.length + 1}`;
        params.push(startDate);
      }
      if (endDate) {
        query += ` AND ce.collection_date <= $${params.length + 1}`;
        params.push(endDate);
      }

      // Add collection point filter
      if (collectionPointId) {
        query += ` AND ce.collection_point_id = $${params.length + 1}`;
        params.push(collectionPointId);
      }

      // Add waste type filter
      if (wasteTypeId) {
        query += ` AND ce.waste_type_id = $${params.length + 1}`;
        params.push(wasteTypeId);
      }

      // Add local government area filter
      if (localGovernmentArea) {
        query += ` AND cp.local_government_area = $${params.length + 1}`;
        params.push(localGovernmentArea);
      }

      query += ' ORDER BY ce.collection_date DESC';

      const result = await db.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Get collection events error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getById(req, res) {
    const { id } = req.params;

    try {
      const result = await db.query(
        `SELECT ce.*,
                cp.name as collection_point_name,
                cp.local_government_area,
                wt.name as waste_type_name,
                u.username as created_by_user
         FROM collection_events ce
         JOIN collection_points cp ON ce.collection_point_id = cp.id
         JOIN waste_types wt ON ce.waste_type_id = wt.id
         JOIN users u ON ce.created_by = u.id
         WHERE ce.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Collection event not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Get collection event error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async update(req, res) {
    const { id } = req.params;
    const {
      collectionDate,
      volumeCubicMeters,
      weightTons,
      crewMembers,
      notes
    } = req.body;

    try {
      const result = await db.query(
        `UPDATE collection_events
         SET collection_date = $1,
             volume_cubic_meters = $2,
             weight_tons = $3,
             crew_members = $4,
             notes = $5
         WHERE id = $6
         RETURNING id, collection_point_id, waste_type_id, collection_date,
                   volume_cubic_meters, weight_tons, crew_members, notes,
                   updated_at`,
        [
          collectionDate,
          volumeCubicMeters,
          weightTons,
          JSON.stringify(crewMembers),
          notes,
          id
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Collection event not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Update collection event error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async delete(req, res) {
    const { id } = req.params;

    try {
      const result = await db.query(
        'DELETE FROM collection_events WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Collection event not found' });
      }

      res.json({ message: 'Collection event deleted successfully' });
    } catch (error) {
      console.error('Delete collection event error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getStats(req, res) {
    const { startDate, endDate, localGovernmentArea } = req.query;

    try {
      let query = `
        SELECT
          cp.local_government_area,
          wt.name as waste_type,
          COUNT(*) as total_collections,
          SUM(ce.volume_cubic_meters) as total_volume,
          SUM(ce.weight_tons) as total_weight,
          AVG(ce.weight_tons) as avg_weight_per_collection
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

      query += ` GROUP BY cp.local_government_area, wt.name
                 ORDER BY cp.local_government_area, total_weight DESC`;

      const result = await db.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Get collection stats error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

module.exports = new CollectionEventController();
