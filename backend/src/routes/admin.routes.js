import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import * as adminController from '../controllers/admin.controller.js';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/analytics', adminController.getAnalytics);
router.get('/distributors/live', adminController.getLiveDistributorsMap);
router.get('/pharmacies', adminController.getPharmacies);

router.post(
  '/pharmacies',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
    validate,
  ],
  adminController.createPharmacy
);

router.get(
  '/pharmacies/:id',
  [param('id').isMongoId().withMessage('Valid pharmacy ID required'), validate],
  adminController.getPharmacyById
);

router.patch(
  '/pharmacies/:id/status',
  [
    param('id').isMongoId().withMessage('Valid pharmacy ID required'),
    body('status').isIn(['active', 'inactive', 'pending']).withMessage('Invalid status'),
    validate,
  ],
  adminController.updatePharmacyStatus
);

router.get('/distributors', adminController.getDistributors);

router.post(
  '/distributors',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
    validate,
  ],
  adminController.createDistributor
);

router.patch(
  '/distributors/:id/status',
  [
    param('id').isMongoId().withMessage('Valid distributor ID required'),
    body('status').isIn(['active', 'inactive', 'pending']).withMessage('Invalid status'),
    validate,
  ],
  adminController.updateDistributorStatus
);

router.get('/medicines', adminController.getMedicines);

router.post(
  '/medicines',
  [
    body('name').notEmpty().withMessage('Medicine name is required'),
    body('manufacturer').notEmpty().withMessage('Manufacturer is required'),
    body('price').isFloat({ min: 0 }).withMessage('Valid price required'),
    validate,
  ],
  adminController.createMedicine
);

router.patch(
  '/medicines/:id',
  [
    param('id').isMongoId().withMessage('Valid medicine ID required'),
    validate,
  ],
  adminController.updateMedicine
);

router.delete(
  '/medicines/:id',
  [
    param('id').isMongoId().withMessage('Valid medicine ID required'),
    validate,
  ],
  adminController.deleteMedicine
);

router.get('/requests', adminController.getAllRequests);
router.get('/audit-logs', adminController.getAuditLogs);

export default router;
