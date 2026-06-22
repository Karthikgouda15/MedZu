import User from '../models/User.js';
import Pharmacy from '../models/Pharmacy.js';
import Distributor from '../models/Distributor.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { AppError } from './errorHandler.js';

export const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401);
    }
    const token = header.split(' ')[1];
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id);
    if (!user) throw new AppError('User not found', 401);
    if (user.status === 'inactive') throw new AppError('Account deactivated', 403);

    req.user = user;

    if (user.role === 'pharmacy') {
      req.pharmacy = await Pharmacy.findOne({ user: user._id });
    } else if (user.role === 'distributor') {
      req.distributor = await Distributor.findOne({ user: user._id });
    }

    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(new AppError('Invalid or expired token', 401));
    }
    next(err);
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError('Access denied', 403));
  }
  next();
};

export const requireActive = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.status !== 'active') {
    return next(new AppError('Account pending approval', 403));
  }
  next();
};
