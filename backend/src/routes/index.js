import { Router } from 'express';
import authRoutes from './auth.routes.js';
import adminRoutes from './admin.routes.js';
import pharmacyRoutes from './pharmacy.routes.js';
import distributorRoutes from './distributor.routes.js';
import notificationRoutes from './notification.routes.js';

import Pharmacy from '../models/Pharmacy.js';
import Distributor from '../models/Distributor.js';
import MedicineRequest from '../models/MedicineRequest.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/pharmacy', pharmacyRoutes);
router.use('/distributor', distributorRoutes);
router.use('/notifications', notificationRoutes);

router.get('/public/stats', async (req, res, next) => {
  try {
    const [pharmaciesCount, distributorsCount, completedRequests, pharmacies] = await Promise.all([
      Pharmacy.countDocuments({ status: 'active' }),
      Distributor.countDocuments({ availabilityStatus: { $ne: 'offline' } }),
      MedicineRequest.countDocuments({ status: 'completed' }),
      Pharmacy.find({}, 'address')
    ]);

    const cities = new Set(pharmacies.map(p => {
      const parts = p.address.split(',');
      return parts[parts.length - 1]?.trim();
    }).filter(Boolean));

    res.json({
      success: true,
      data: {
        pharmacies: Math.max(pharmaciesCount, 0),
        deliveries: Math.max(completedRequests, 0),
        cities: Math.max(cities.size, 1),
        uptime: 99.9
      }
    });
  } catch (err) {
    next(err);
  }
});

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'MedZu API is running' });
});

export default router;
