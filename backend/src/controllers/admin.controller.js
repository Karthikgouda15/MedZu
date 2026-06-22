import User from '../models/User.js';
import Pharmacy from '../models/Pharmacy.js';
import Distributor from '../models/Distributor.js';
import Medicine from '../models/Medicine.js';
import MedicineRequest from '../models/MedicineRequest.js';
import AuditLog from '../models/AuditLog.js';
import { AppError } from '../middlewares/errorHandler.js';
import { getAdminAnalytics, getLiveDistributors } from '../services/analytics.service.js';
import { paginatedResponse } from '../utils/pagination.js';
import { logAudit } from '../services/audit.service.js';
import { createNotification } from '../services/notification.service.js';

export const getAnalytics = async (req, res, next) => {
  try {
    const data = await getAdminAnalytics();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getLiveDistributorsMap = async (req, res, next) => {
  try {
    const data = await getLiveDistributors();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getPharmacies = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (page - 1) * limit;
    const filter = {};
    if (status) filter.status = status;
    if (search) filter.pharmacyName = { $regex: search, $options: 'i' };

    const [data, total] = await Promise.all([
      Pharmacy.find(filter).populate('user', 'name email phone status').skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      Pharmacy.countDocuments(filter),
    ]);
    res.json({ success: true, ...paginatedResponse(data, total, Number(page), Number(limit)) });
  } catch (err) {
    next(err);
  }
};

export const getPharmacyById = async (req, res, next) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id).populate('user', 'name email phone status createdAt');
    if (!pharmacy) throw new AppError('Pharmacy not found', 404);
    const requestCount = await MedicineRequest.countDocuments({
      $or: [{ requesterPharmacy: pharmacy._id }, { supplierPharmacy: pharmacy._id }],
    });
    res.json({ success: true, data: { ...pharmacy.toObject(), requestCount } });
  } catch (err) {
    next(err);
  }
};

export const updatePharmacyStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const pharmacy = await Pharmacy.findById(req.params.id).populate('user');
    if (!pharmacy) throw new AppError('Pharmacy not found', 404);

    pharmacy.status = status;
    await pharmacy.save();

    if (pharmacy.user) {
      pharmacy.user.status = status;
      await pharmacy.user.save();
      await createNotification(
        pharmacy.user._id,
        `Account ${status}`,
        `Your pharmacy account has been ${status}`,
        'general'
      );
    }

    await logAudit(req.user, 'UPDATE_PHARMACY_STATUS', 'Pharmacy', pharmacy._id, { status });
    res.json({ success: true, data: pharmacy });
  } catch (err) {
    next(err);
  }
};

export const getDistributors = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;
    const filter = {};
    if (status) filter.availabilityStatus = status;

    const [data, total] = await Promise.all([
      Distributor.find(filter).populate('user', 'name email phone status').skip(skip).limit(Number(limit)),
      Distributor.countDocuments(filter),
    ]);
    res.json({ success: true, ...paginatedResponse(data, total, Number(page), Number(limit)) });
  } catch (err) {
    next(err);
  }
};

export const updateDistributorStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const distributor = await Distributor.findById(req.params.id).populate('user');
    if (!distributor) throw new AppError('Distributor not found', 404);

    if (distributor.user) {
      distributor.user.status = status;
      await distributor.user.save();
      if (status === 'inactive') distributor.availabilityStatus = 'offline';
      await distributor.save();
      await createNotification(
        distributor.user._id,
        `Account ${status}`,
        `Your distributor account has been ${status}`,
        'general'
      );
    }

    await logAudit(req.user, 'UPDATE_DISTRIBUTOR_STATUS', 'Distributor', distributor._id, { status });
    res.json({ success: true, data: distributor });
  } catch (err) {
    next(err);
  }
};

export const getMedicines = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;
    let filter = {};
    if (search) {
      const escapedQuery = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      filter.$or = [
        { name: { $regex: escapedQuery, $options: 'i' } },
        { manufacturer: { $regex: escapedQuery, $options: 'i' } },
        { category: { $regex: escapedQuery, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      Medicine.find(filter).skip(skip).limit(Number(limit)).sort({ name: 1 }),
      Medicine.countDocuments(filter),
    ]);
    res.json({ success: true, ...paginatedResponse(data, total, Number(page), Number(limit)) });
  } catch (err) {
    next(err);
  }
};

export const createMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.create(req.body);
    await logAudit(req.user, 'CREATE_MEDICINE', 'Medicine', medicine._id);
    res.status(201).json({ success: true, data: medicine });
  } catch (err) {
    next(err);
  }
};

export const updateMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!medicine) throw new AppError('Medicine not found', 404);
    await logAudit(req.user, 'UPDATE_MEDICINE', 'Medicine', medicine._id);
    res.json({ success: true, data: medicine });
  } catch (err) {
    next(err);
  }
};

export const deleteMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);
    if (!medicine) throw new AppError('Medicine not found', 404);
    await logAudit(req.user, 'DELETE_MEDICINE', 'Medicine', medicine._id);
    res.json({ success: true, message: 'Medicine deleted' });
  } catch (err) {
    next(err);
  }
};

export const getAllRequests = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;
    const filter = status ? { status } : {};

    const [data, total] = await Promise.all([
      MedicineRequest.find(filter)
        .populate('requesterPharmacy supplierPharmacy medicine')
        .populate({ path: 'distributor', populate: { path: 'user' } })
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      MedicineRequest.countDocuments(filter),
    ]);
    res.json({ success: true, ...paginatedResponse(data, total, Number(page), Number(limit)) });
  } catch (err) {
    next(err);
  }
};

export const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      AuditLog.find().populate('actor', 'name email role').skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      AuditLog.countDocuments(),
    ]);
    res.json({ success: true, ...paginatedResponse(data, total, Number(page), Number(limit)) });
  } catch (err) {
    next(err);
  }
};

export const createPharmacy = async (req, res, next) => {
  try {
    const { name, email, password, phone, pharmacyName, address, latitude, longitude, licenseNumber } = req.body;
    const exists = await User.findOne({ email });
    if (exists) throw new AppError('Email already exists', 400);

    const user = await User.create({ name, email, password, role: 'pharmacy', phone, status: 'active' });
    const pharmacy = await Pharmacy.create({
      user: user._id,
      pharmacyName,
      address,
      latitude,
      longitude,
      location: { type: 'Point', coordinates: [longitude, latitude] },
      licenseNumber,
      status: 'active',
    });

    await logAudit(req.user, 'ADMIN_CREATE_PHARMACY', 'Pharmacy', pharmacy._id);
    res.status(201).json({ success: true, data: { user, pharmacy } });
  } catch (err) {
    next(err);
  }
};

export const createDistributor = async (req, res, next) => {
  try {
    const { name, email, password, phone, vehicleType, latitude, longitude } = req.body;
    const exists = await User.findOne({ email });
    if (exists) throw new AppError('Email already exists', 400);

    const user = await User.create({ name, email, password, role: 'distributor', phone, status: 'active' });
    const distributor = await Distributor.create({
      user: user._id,
      vehicleType: vehicleType || 'bike',
      availabilityStatus: 'available',
      currentLocation: {
        type: 'Point',
        coordinates: [longitude || 77.5946, latitude || 12.9716],
      },
    });

    await logAudit(req.user, 'ADMIN_CREATE_DISTRIBUTOR', 'Distributor', distributor._id);
    res.status(201).json({ success: true, data: { user, distributor } });
  } catch (err) {
    next(err);
  }
};
