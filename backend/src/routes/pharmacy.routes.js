import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { authenticate, authorize, requireActive } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import * as pharmacyController from '../controllers/pharmacy.controller.js';

const router = Router();

router.use(authenticate, authorize('pharmacy'), requireActive);

router.get('/inventory', pharmacyController.getMyInventory);

router.post(
  '/inventory',
  [
    body('medicineId').isMongoId().withMessage('Valid medicine ID required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be positive'),
    validate,
  ],
  pharmacyController.addInventory
);

router.patch(
  '/inventory/:medicineId',
  [
    param('medicineId').isMongoId().withMessage('Valid medicine ID required'),
    body('quantity').isInt({ min: 0 }).withMessage('Quantity cannot be negative'),
    validate,
  ],
  pharmacyController.updateInventoryItem
);

router.delete(
  '/inventory/:medicineId',
  [
    param('medicineId').isMongoId().withMessage('Valid medicine ID required'),
    validate,
  ],
  pharmacyController.deleteInventoryItem
);

router.get('/medicines/search', pharmacyController.searchMedicineCatalog);

router.get(
  '/stock/check',
  [
    query('medicineId').isMongoId().withMessage('Valid medicine ID required'),
    query('quantity').isInt({ min: 1 }).withMessage('Quantity must be positive'),
    validate,
  ],
  pharmacyController.checkLocalStock
);

router.get(
  '/nearby-stock',
  [
    query('medicineId').isMongoId().withMessage('Valid medicine ID required'),
    query('quantity').isInt({ min: 1 }).withMessage('Quantity must be positive'),
    validate,
  ],
  pharmacyController.findNearbyStock
);

router.get(
  '/supplier/:id/inventory',
  [
    param('id').isMongoId().withMessage('Valid pharmacy ID required'),
    validate,
  ],
  pharmacyController.getSupplierInventory
);

router.post(
  '/requests',
  [
    body('supplierPharmacyId').isMongoId().withMessage('Valid supplier ID required'),
    body('medicineId').isMongoId().withMessage('Valid medicine ID required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be positive'),
    validate,
  ],
  pharmacyController.createMedicineRequest
);

router.get('/requests/incoming', pharmacyController.getIncomingRequests);
router.get('/requests/outgoing', pharmacyController.getOutgoingRequests);
router.get('/requests', pharmacyController.getAllMyRequests);

router.get(
  '/requests/:id',
  [param('id').isMongoId().withMessage('Valid request ID required'), validate],
  pharmacyController.getRequestById
);

router.patch(
  '/requests/:id/accept',
  [param('id').isMongoId().withMessage('Valid request ID required'), validate],
  pharmacyController.acceptIncomingRequest
);

router.patch(
  '/requests/:id/reject',
  [param('id').isMongoId().withMessage('Valid request ID required'), validate],
  pharmacyController.rejectIncomingRequest
);

export default router;
