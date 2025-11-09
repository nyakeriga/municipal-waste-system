const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const rbacMiddleware = require('../middleware/rbac.middleware');
const auditMiddleware = require('../middleware/audit.middleware');
const CollectionPointController = require('../controllers/collectionPoint.controller');
const SubscriberController = require('../controllers/subscriber.controller');
const CollectionEventController = require('../controllers/collectionEvent.controller');
const ReportsController = require('../controllers/reports.controller');

const router = express.Router();

// Collection Points Routes
router.post('/collection-points',
  authMiddleware,
  rbacMiddleware(['manage_collection_points']),
  auditMiddleware('collection_points'),
  CollectionPointController.create
);

router.put('/collection-points/:id',
  authMiddleware,
  rbacMiddleware(['manage_collection_points']),
  auditMiddleware('collection_points'),
  CollectionPointController.update
);

router.get('/collection-points',
  authMiddleware,
  CollectionPointController.getAll
);

router.get('/collection-points/:id',
  authMiddleware,
  CollectionPointController.getById
);

router.delete('/collection-points/:id',
  authMiddleware,
  rbacMiddleware(['manage_collection_points']),
  auditMiddleware('collection_points'),
  CollectionPointController.delete
);

router.get('/collection-points/nearby',
  authMiddleware,
  CollectionPointController.getNearbyPoints
);

// Subscribers Routes
router.post('/subscribers',
  authMiddleware,
  rbacMiddleware(['manage_subscribers']),
  auditMiddleware('subscribers'),
  SubscriberController.create
);

router.put('/subscribers/:id',
  authMiddleware,
  rbacMiddleware(['manage_subscribers']),
  auditMiddleware('subscribers'),
  SubscriberController.update
);

router.get('/subscribers',
  authMiddleware,
  SubscriberController.getAll
);

router.get('/subscribers/:id',
  authMiddleware,
  SubscriberController.getById
);

router.delete('/subscribers/:id',
  authMiddleware,
  rbacMiddleware(['manage_subscribers']),
  auditMiddleware('subscribers'),
  SubscriberController.delete
);

router.get('/subscribers/types',
  authMiddleware,
  SubscriberController.getBusinessTypes
);

router.get('/subscribers/categories',
  authMiddleware,
  SubscriberController.getServiceCategories
);

// Collection Events Routes
router.post('/collection-events',
  authMiddleware,
  rbacMiddleware(['manage_collection_events']),
  auditMiddleware('collection_events'),
  CollectionEventController.create
);

router.put('/collection-events/:id',
  authMiddleware,
  rbacMiddleware(['manage_collection_events']),
  auditMiddleware('collection_events'),
  CollectionEventController.update
);

router.get('/collection-events',
  authMiddleware,
  CollectionEventController.getAll
);

router.get('/collection-events/:id',
  authMiddleware,
  CollectionEventController.getById
);

router.delete('/collection-events/:id',
  authMiddleware,
  rbacMiddleware(['manage_collection_events']),
  auditMiddleware('collection_events'),
  CollectionEventController.delete
);

router.get('/collection-events/stats',
  authMiddleware,
  CollectionEventController.getStats
);

// Reports Routes
router.get('/reports/waste-collection-summary',
  authMiddleware,
  rbacMiddleware(['view_reports']),
  ReportsController.getWasteCollectionSummary
);

router.get('/reports/subscriber-activity',
  authMiddleware,
  rbacMiddleware(['view_reports']),
  ReportsController.getSubscriberActivityReport
);

router.get('/reports/collection-point-performance',
  authMiddleware,
  rbacMiddleware(['view_reports']),
  ReportsController.getCollectionPointPerformance
);

router.get('/reports/audit',
  authMiddleware,
  rbacMiddleware(['view_audit_logs']),
  ReportsController.getAuditReport
);

module.exports = router;
