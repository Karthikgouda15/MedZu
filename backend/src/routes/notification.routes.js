import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import * as notificationController from '../controllers/notification.controller.js';

const router = Router();

router.use(authenticate);
router.get('/', notificationController.getNotifications);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', notificationController.markAsRead);

export default router;
