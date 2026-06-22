import MedicineRequest from '../models/MedicineRequest.js';
import Distributor from '../models/Distributor.js';
import { AppError } from '../middlewares/errorHandler.js';
import {
  distributorRespond,
  updateRequestStatus,
  updateLocation,
  getRequests,
} from '../services/request.service.js';
import { paginatedResponse } from '../utils/pagination.js';

const ACTIVE_STATUSES = ['distributor_assigned', 'pickup_started', 'picked_up', 'en_route', 'delivered'];

export const getAssignments = async (req, res, next) => {
  try {
    if (!req.distributor) throw new AppError('Distributor profile not found', 404);
    const { page, limit } = req.query;
    const result = await getRequests(
      { distributor: req.distributor._id, status: 'distributor_assigned' },
      page,
      limit
    );
    res.json({ success: true, ...paginatedResponse(result.requests, result.total, result.page, result.limit) });
  } catch (err) {
    next(err);
  }
};

export const getActiveDeliveries = async (req, res, next) => {
  try {
    if (!req.distributor) throw new AppError('Distributor profile not found', 404);
    const requests = await MedicineRequest.find({
      distributor: req.distributor._id,
      status: { $in: ACTIVE_STATUSES },
    })
      .populate('requesterPharmacy supplierPharmacy medicine')
      .sort({ updatedAt: -1 });
    res.json({ success: true, data: requests });
  } catch (err) {
    next(err);
  }
};

export const getDeliveryHistory = async (req, res, next) => {
  try {
    if (!req.distributor) throw new AppError('Distributor profile not found', 404);
    const { page, limit } = req.query;
    const result = await getRequests(
      { distributor: req.distributor._id, status: { $in: ['completed', 'delivered'] } },
      page,
      limit
    );
    res.json({ success: true, ...paginatedResponse(result.requests, result.total, result.page, result.limit) });
  } catch (err) {
    next(err);
  }
};

export const respondToAssignment = async (req, res, next) => {
  try {
    if (!req.distributor) throw new AppError('Distributor profile not found', 404);
    const { accept } = req.body;
    const data = await distributorRespond(req.params.id, req.distributor._id, accept, req.user);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const startPickup = async (req, res, next) => {
  try {
    if (!req.distributor) throw new AppError('Distributor profile not found', 404);
    const data = await updateRequestStatus(req.params.id, 'pickup_started', req.user, req.distributor._id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const markPickedUp = async (req, res, next) => {
  try {
    if (!req.distributor) throw new AppError('Distributor profile not found', 404);
    const data = await updateRequestStatus(req.params.id, 'picked_up', req.user, req.distributor._id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const startDelivery = async (req, res, next) => {
  try {
    if (!req.distributor) throw new AppError('Distributor profile not found', 404);
    const data = await updateRequestStatus(req.params.id, 'en_route', req.user, req.distributor._id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const markDelivered = async (req, res, next) => {
  try {
    if (!req.distributor) throw new AppError('Distributor profile not found', 404);
    const data = await updateRequestStatus(req.params.id, 'delivered', req.user, req.distributor._id);
    await updateRequestStatus(req.params.id, 'completed', req.user, req.distributor._id);
    const completed = await MedicineRequest.findById(req.params.id)
      .populate('requesterPharmacy supplierPharmacy medicine');
    res.json({ success: true, data: completed });
  } catch (err) {
    next(err);
  }
};

export const updateGpsLocation = async (req, res, next) => {
  try {
    if (!req.distributor) throw new AppError('Distributor profile not found', 404);
    const { latitude, longitude, requestId } = req.body;

    await Distributor.findByIdAndUpdate(req.distributor._id, {
      currentLocation: { type: 'Point', coordinates: [longitude, latitude] },
    });

    let locationData = { latitude, longitude, distributorId: req.distributor._id };
    if (requestId) {
      locationData = await updateLocation(requestId, req.distributor._id, latitude, longitude);
    }

    res.json({ success: true, data: locationData });
  } catch (err) {
    next(err);
  }
};

export const setAvailability = async (req, res, next) => {
  try {
    if (!req.distributor) throw new AppError('Distributor profile not found', 404);
    const { status } = req.body;
    req.distributor.availabilityStatus = status;
    await req.distributor.save();
    res.json({ success: true, data: req.distributor });
  } catch (err) {
    next(err);
  }
};

export const getEarnings = async (req, res, next) => {
  try {
    if (!req.distributor) throw new AppError('Distributor profile not found', 404);
    const completed = await MedicineRequest.find({
      distributor: req.distributor._id,
      status: 'completed',
    });
    const totalEarnings = completed.reduce((sum, r) => sum + (r.deliveryFee || 0), 0);
    res.json({
      success: true,
      data: {
        totalEarnings: req.distributor.totalEarnings || totalEarnings,
        completedDeliveries: completed.length,
        recent: completed.slice(0, 5),
      },
    });
  } catch (err) {
    next(err);
  }
};
