const db = require('../config/db');

class SubscriberController {
  async create(req, res) {
    const {
      businessName,
      businessType,
      contactPerson,
      email,
      phone,
      address,
      latitude,
      longitude,
      collectionPointId,
      serviceCategory
    } = req.body;

    try {
      const result = await db.query(
        `INSERT INTO subscribers (
          business_name,
          business_type,
          contact_person,
          email,
          phone,
          address,
          location,
          collection_point_id,
          service_category
        )
        VALUES ($1, $2, $3, $4, $5, $6, ST_SetSRID(ST_MakePoint($7, $8), 4326), $9, $10)
        RETURNING id, business_name, business_type, contact_person, email, phone,
                  address, ST_X(location::geometry) as longitude,
                  ST_Y(location::geometry) as latitude, collection_point_id,
                  service_category, is_active, created_at`,
        [
          businessName,
          businessType,
          contactPerson,
          email,
          phone,
          address,
          longitude,
          latitude,
          collectionPointId,
          serviceCategory
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Create subscriber error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async update(req, res) {
    const { id } = req.params;
    const {
      businessName,
      businessType,
      contactPerson,
      email,
      phone,
      address,
      latitude,
      longitude,
      collectionPointId,
      serviceCategory,
      isActive
    } = req.body;

    try {
      const result = await db.query(
        `UPDATE subscribers
         SET business_name = $1,
             business_type = $2,
             contact_person = $3,
             email = $4,
             phone = $5,
             address = $6,
             location = ST_SetSRID(ST_MakePoint($7, $8), 4326),
             collection_point_id = $9,
             service_category = $10,
             is_active = $11
         WHERE id = $12
         RETURNING id, business_name, business_type, contact_person, email, phone,
                   address, ST_X(location::geometry) as longitude,
                   ST_Y(location::geometry) as latitude, collection_point_id,
                   service_category, is_active, updated_at`,
        [
          businessName,
          businessType,
          contactPerson,
          email,
          phone,
          address,
          longitude,
          latitude,
          collectionPointId,
          serviceCategory,
          isActive,
          id
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Subscriber not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Update subscriber error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getAll(req, res) {
    const { bounds, type, category, collectionPoint } = req.query;
    
    try {
      let query = `
        SELECT s.*, 
               ST_X(s.location::geometry) as longitude,
               ST_Y(s.location::geometry) as latitude,
               cp.name as collection_point_name
        FROM subscribers s
        LEFT JOIN collection_points cp ON s.collection_point_id = cp.id
        WHERE 1=1
      `;
      
      const params = [];
      
      // Add spatial bounds filter if provided
      if (bounds) {
        const [minLat, minLng, maxLat, maxLng] = bounds.split(',').map(Number);
        query += ` AND s.location && ST_MakeEnvelope($${params.length + 1}, $${
          params.length + 2
        }, $${params.length + 3}, $${params.length + 4}, 4326)`;
        params.push(minLng, minLat, maxLng, maxLat);
      }
      
      // Add business type filter
      if (type) {
        query += ` AND s.business_type = $${params.length + 1}`;
        params.push(type);
      }

      // Add service category filter
      if (category) {
        query += ` AND s.service_category = $${params.length + 1}`;
        params.push(category);
      }

      // Add collection point filter
      if (collectionPoint) {
        query += ` AND s.collection_point_id = $${params.length + 1}`;
        params.push(collectionPoint);
      }
      
      const result = await db.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Get subscribers error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getById(req, res) {
    const { id } = req.params;

    try {
      const result = await db.query(
        `SELECT s.*, 
                ST_X(s.location::geometry) as longitude,
                ST_Y(s.location::geometry) as latitude,
                cp.name as collection_point_name
         FROM subscribers s
         LEFT JOIN collection_points cp ON s.collection_point_id = cp.id
         WHERE s.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Subscriber not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Get subscriber error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async delete(req, res) {
    const { id } = req.params;

    try {
      const result = await db.query(
        'UPDATE subscribers SET is_active = false WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Subscriber not found' });
      }

      res.json({ message: 'Subscriber deactivated successfully' });
    } catch (error) {
      console.error('Delete subscriber error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getBusinessTypes(req, res) {
    try {
      const result = await db.query(
        'SELECT DISTINCT business_type FROM subscribers ORDER BY business_type'
      );
      res.json(result.rows.map(row => row.business_type));
    } catch (error) {
      console.error('Get business types error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getServiceCategories(req, res) {
    try {
      const result = await db.query(
        'SELECT DISTINCT service_category FROM subscribers ORDER BY service_category'
      );
      res.json(result.rows.map(row => row.service_category));
    } catch (error) {
      console.error('Get service categories error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

module.exports = new SubscriberController();
