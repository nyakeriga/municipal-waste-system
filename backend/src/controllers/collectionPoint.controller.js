const db = require('../config/db');

class CollectionPointController {
  async create(req, res) {
    const {
      name,
      address,
      latitude,
      longitude,
      localGovernmentArea,
      notes
    } = req.body;

    try {
      const result = await db.query(
        `INSERT INTO collection_points (
          name,
          address,
          location,
          local_government_area,
          notes
        )
        VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326), $5, $6)
        RETURNING id, name, address, ST_X(location::geometry) as longitude,
                  ST_Y(location::geometry) as latitude, local_government_area,
                  notes, is_active, created_at`,
        [name, address, longitude, latitude, localGovernmentArea, notes]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Create collection point error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async update(req, res) {
    const { id } = req.params;
    const {
      name,
      address,
      latitude,
      longitude,
      localGovernmentArea,
      notes,
      isActive
    } = req.body;

    try {
      const result = await db.query(
        `UPDATE collection_points
         SET name = $1,
             address = $2,
             location = ST_SetSRID(ST_MakePoint($3, $4), 4326),
             local_government_area = $5,
             notes = $6,
             is_active = $7
         WHERE id = $8
         RETURNING id, name, address, ST_X(location::geometry) as longitude,
                   ST_Y(location::geometry) as latitude, local_government_area,
                   notes, is_active, updated_at`,
        [name, address, longitude, latitude, localGovernmentArea, notes, isActive, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Collection point not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Update collection point error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getAll(req, res) {
    const { bounds, lga } = req.query;
    
    try {
      let query = `
        SELECT id, name, address,
               ST_X(location::geometry) as longitude,
               ST_Y(location::geometry) as latitude,
               local_government_area, notes, is_active,
               created_at
        FROM collection_points
        WHERE 1=1
      `;
      
      const params = [];
      
      // Add spatial bounds filter if provided
      if (bounds) {
        const [minLat, minLng, maxLat, maxLng] = bounds.split(',').map(Number);
        query += ` AND location && ST_MakeEnvelope($${params.length + 1}, $${
          params.length + 2
        }, $${params.length + 3}, $${params.length + 4}, 4326)`;
        params.push(minLng, minLat, maxLng, maxLat);
      }
      
      // Add LGA filter if provided
      if (lga) {
        query += ` AND local_government_area = $${params.length + 1}`;
        params.push(lga);
      }
      
      const result = await db.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Get collection points error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getById(req, res) {
    const { id } = req.params;

    try {
      const result = await db.query(
        `SELECT id, name, address,
                ST_X(location::geometry) as longitude,
                ST_Y(location::geometry) as latitude,
                local_government_area, notes, is_active,
                created_at
         FROM collection_points
         WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Collection point not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Get collection point error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async delete(req, res) {
    const { id } = req.params;

    try {
      const result = await db.query(
        'UPDATE collection_points SET is_active = false WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Collection point not found' });
      }

      res.json({ message: 'Collection point deactivated successfully' });
    } catch (error) {
      console.error('Delete collection point error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getNearbyPoints(req, res) {
    const { latitude, longitude, radius } = req.query;
    
    try {
      const result = await db.query(
        `SELECT id, name, address,
                ST_X(location::geometry) as longitude,
                ST_Y(location::geometry) as latitude,
                local_government_area,
                ST_Distance(
                  location::geography,
                  ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
                ) as distance
         FROM collection_points
         WHERE ST_DWithin(
           location::geography,
           ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
           $3
         )
         AND is_active = true
         ORDER BY distance
         LIMIT 10`,
        [longitude, latitude, radius || 5000] // Default radius 5km
      );

      res.json(result.rows);
    } catch (error) {
      console.error('Get nearby points error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

module.exports = new CollectionPointController();
