import User from '../models/User.js';
import Pharmacy from '../models/Pharmacy.js';
import Distributor from '../models/Distributor.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { AppError } from '../middlewares/errorHandler.js';
import { logAudit } from '../services/audit.service.js';

const buildTokens = (user) => {
  const payload = { id: user._id, role: user.role };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, pharmacyName, address, latitude, longitude, licenseNumber, vehicleType, vehicleNo } = req.body;

    if (!['pharmacy', 'distributor'].includes(role)) {
      throw new AppError('Invalid registration role', 400);
    }

    const exists = await User.findOne({ email });
    if (exists) throw new AppError('Email already registered', 400);

    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      vehicleNo: role === 'distributor' ? vehicleNo : undefined,
      status: 'pending',
    });

    if (role === 'pharmacy') {
      if (!pharmacyName || !address || latitude == null || longitude == null) {
        throw new AppError('Pharmacy details required', 400);
      }
      await Pharmacy.create({
        user: user._id,
        pharmacyName,
        address,
        latitude,
        longitude,
        location: { type: 'Point', coordinates: [longitude, latitude] },
        licenseNumber,
        status: 'pending',
      });
    }

    if (role === 'distributor') {
      await Distributor.create({
        user: user._id,
        vehicleType: vehicleType || 'bike',
        availabilityStatus: 'offline',
        currentLocation: {
          type: 'Point',
          coordinates: [longitude || 77.5946, latitude || 12.9716],
        },
      });
    }

    await logAudit(user, 'REGISTER', 'User', user._id, { role });

    res.status(201).json({
      success: true,
      message: 'Registration successful. Awaiting admin approval.',
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid credentials', 401);
    }

    if (user.status === 'pending') {
      throw new AppError('Your account is pending admin approval. Please wait for approval before logging in.', 403);
    }
    if (user.status === 'inactive') {
      throw new AppError('Your account has been deactivated. Please contact support.', 403);
    }

    const tokens = buildTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    let profile = null;
    if (user.role === 'pharmacy') {
      profile = await Pharmacy.findOne({ user: user._id });
    } else if (user.role === 'distributor') {
      profile = await Distributor.findOne({ user: user._id });
    }

    await logAudit(user, 'LOGIN', 'User', user._id);

    res.json({
      success: true,
      data: {
        user,
        profile,
        ...tokens,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new AppError('Refresh token required', 401);

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      throw new AppError('Invalid refresh token', 401);
    }

    const tokens = buildTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.json({ success: true, data: tokens });
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(new AppError('Invalid refresh token', 401));
    }
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    req.user.refreshToken = null;
    await req.user.save();
    await logAudit(req.user, 'LOGOUT', 'User', req.user._id);
    res.json({ success: true, message: 'Logged out' });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    let profile = null;
    if (req.user.role === 'pharmacy') {
      profile = await Pharmacy.findOne({ user: req.user._id });
    } else if (req.user.role === 'distributor') {
      profile = await Distributor.findOne({ user: req.user._id });
    }
    res.json({ success: true, data: { user: req.user, profile } });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    if (name) req.user.name = name;
    if (phone) req.user.phone = phone;
    await req.user.save();
    res.json({ success: true, data: { user: req.user } });
  } catch (err) {
    next(err);
  }
};
