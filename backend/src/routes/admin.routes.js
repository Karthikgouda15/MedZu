import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import * as adminController from '../controllers/admin.controller.js';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/analytics', adminController.getAnalytics);
router.get('/distributors/live', adminController.getLiveDistributorsMap);
router.get('/pharmacies', adminController.getPharmacies);
router.post('/pharmacies', adminController.createPharmacy);
router.patch('/pharmacies/:id/status', adminController.updatePharmacyStatus);
router.get('/distributors', adminController.getDistributors);
router.post('/distributors', adminController.createDistributor);
router.patch('/distributors/:id/status', adminController.updateDistributorStatus);
router.get('/medicines', adminController.getMedicines);
router.post('/medicines', adminController.createMedicine);
router.patch('/medicines/:id', adminController.updateMedicine);
router.delete('/medicines/:id', adminController.deleteMedicine);
router.get('/requests', adminController.getAllRequests);
router.get('/audit-logs', adminController.getAuditLogs);

export default router;
