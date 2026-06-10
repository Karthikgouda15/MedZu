import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/auth.js';
import * as authController from '../controllers/auth.controller.js';

const router = Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
    body('role').isIn(['pharmacy', 'distributor']).withMessage('Invalid role'),
    validate,
  ],
  authController.register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
    validate,
  ],
  authController.login
);

router.post('/refresh', authController.refresh);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);
router.patch('/profile', authenticate, authController.updateProfile);

export default router;
