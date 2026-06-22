import { Router } from 'express';
import authRoutes from './auth.routes.js';
import adminRoutes from './admin.routes.js';
import pharmacyRoutes from './pharmacy.routes.js';
import distributorRoutes from './distributor.routes.js';
import notificationRoutes from './notification.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/pharmacy', pharmacyRoutes);
router.use('/distributor', distributorRoutes);
router.use('/notifications', notificationRoutes);

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'MedZu API is running' });
});

export default router;
