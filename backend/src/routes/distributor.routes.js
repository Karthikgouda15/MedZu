import { Router } from 'express';
import { authenticate, authorize, requireActive } from '../middlewares/auth.js';
import * as distributorController from '../controllers/distributor.controller.js';

const router = Router();

router.use(authenticate, authorize('distributor'), requireActive);

router.get('/assignments', distributorController.getAssignments);
router.get('/active', distributorController.getActiveDeliveries);
router.get('/history', distributorController.getDeliveryHistory);
router.get('/earnings', distributorController.getEarnings);
router.patch('/availability', distributorController.setAvailability);
router.patch('/location', distributorController.updateGpsLocation);
router.patch('/requests/:id/respond', distributorController.respondToAssignment);
router.patch('/requests/:id/pickup-start', distributorController.startPickup);
router.patch('/requests/:id/picked-up', distributorController.markPickedUp);
router.patch('/requests/:id/en-route', distributorController.startDelivery);
router.patch('/requests/:id/delivered', distributorController.markDelivered);

export default router;
