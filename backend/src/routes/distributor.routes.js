import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate, authorize, requireActive } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import * as distributorController from '../controllers/distributor.controller.js';

const router = Router();

router.use(authenticate, authorize('distributor'), requireActive);

router.get('/assignments', distributorController.getAssignments);
router.get('/active', distributorController.getActiveDeliveries);
router.get('/history', distributorController.getDeliveryHistory);
router.get('/earnings', distributorController.getEarnings);

router.patch(
  '/availability',
  [
    body('status').isIn(['available', 'busy', 'offline']).withMessage('Invalid status'),
    validate,
  ],
  distributorController.setAvailability
);

router.patch(
  '/location',
  [
    body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
    body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
    validate,
  ],
  distributorController.updateGpsLocation
);

router.patch(
  '/requests/:id/respond',
  [
    param('id').isMongoId().withMessage('Valid request ID required'),
    body('accept').isBoolean().withMessage('Accept must be a boolean'),
    validate,
  ],
  distributorController.respondToAssignment
);

const idValidation = [
  param('id').isMongoId().withMessage('Valid request ID required'),
  validate,
];

router.patch('/requests/:id/pickup-start', idValidation, distributorController.startPickup);
router.patch('/requests/:id/picked-up', idValidation, distributorController.markPickedUp);
router.patch('/requests/:id/en-route', idValidation, distributorController.startDelivery);
router.patch('/requests/:id/delivered', idValidation, distributorController.markDelivered);

export default router;
