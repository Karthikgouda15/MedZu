import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import * as notificationController from '../controllers/notification.controller.js';

const router = Router();

router.use(authenticate);
router.get('/', notificationController.getNotifications);
router.patch('/:id/read', notificationController.markAsRead);
router.patch('/read-all', notificationController.markAllAsRead);

export default router;
