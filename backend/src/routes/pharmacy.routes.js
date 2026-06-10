import { Router } from 'express';
import { authenticate, authorize, requireActive } from '../middlewares/auth.js';
import * as pharmacyController from '../controllers/pharmacy.controller.js';

const router = Router();

router.use(authenticate, authorize('pharmacy'), requireActive);

router.get('/inventory', pharmacyController.getMyInventory);
router.post('/inventory', pharmacyController.addInventory);
router.patch('/inventory/:medicineId', pharmacyController.updateInventoryItem);
router.delete('/inventory/:medicineId', pharmacyController.deleteInventoryItem);
router.get('/medicines/search', pharmacyController.searchMedicineCatalog);
router.get('/stock/check', pharmacyController.checkLocalStock);
router.get('/nearby-stock', pharmacyController.findNearbyStock);
router.post('/requests', pharmacyController.createMedicineRequest);
router.get('/requests/incoming', pharmacyController.getIncomingRequests);
router.get('/requests/outgoing', pharmacyController.getOutgoingRequests);
router.get('/requests', pharmacyController.getAllMyRequests);
router.get('/requests/:id', pharmacyController.getRequestById);
router.patch('/requests/:id/accept', pharmacyController.acceptIncomingRequest);
router.patch('/requests/:id/reject', pharmacyController.rejectIncomingRequest);

export default router;
