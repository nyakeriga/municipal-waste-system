const db = require('../config/db');

const auditMiddleware = (tableName) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = async function (data) {
      res.send = originalSend;
      
      try {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const recordId = req.params.id || JSON.parse(data).id;
          
          await db.query(
            `INSERT INTO audit_logs (
              user_id,
              action,
              table_name,
              record_id,
              changes,
              ip_address
            ) VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              req.user.id,
              req.method,
              tableName,
              recordId,
              JSON.stringify({
                body: req.body,
                params: req.params,
                query: req.query
              }),
              req.ip
            ]
          );
        }
      } catch (error) {
        console.error('Audit log error:', error);
      }

      return res.send(data);
    };

    next();
  };
};

module.exports = auditMiddleware;
