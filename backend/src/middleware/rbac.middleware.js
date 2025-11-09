const db = require('../config/db');

const rbacMiddleware = (requiredPermissions) => {
  return async (req, res, next) => {
    try {
      const roleId = req.user.role_id;
      
      const result = await db.query(
        'SELECT permissions FROM roles WHERE id = $1',
        [roleId]
      );

      if (result.rows.length === 0) {
        return res.status(403).json({ message: 'Invalid role' });
      }

      const userPermissions = result.rows[0].permissions;

      // Check if user has all required permissions
      const hasPermissions = requiredPermissions.every(
        permission => userPermissions[permission]
      );

      if (!hasPermissions) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      next();
    } catch (error) {
      console.error('RBAC error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
};

module.exports = rbacMiddleware;
