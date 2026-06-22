import Medicine from '../models/Medicine.js';
import MedicineRequest from '../models/MedicineRequest.js';
import { AppError } from '../middlewares/errorHandler.js';
import { getInventory, addInventory as addInventoryService, setInventory, deleteInventory, adjustInventory } from '../services/inventory.service.js';
import { findNearbyPharmaciesWithStock, searchMedicines } from '../services/geoSearch.service.js';
import {
  createRequest,
  acceptRequest,
  rejectRequest,
  getRequests,
} from '../services/request.service.js';
import { paginatedResponse } from '../utils/pagination.js';

export const getMyInventory = async (req, res, next) => {
  try {
    if (!req.pharmacy) throw new AppError('Pharmacy profile not found', 404);
    const data = await getInventory(req.pharmacy._id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const addInventory = async (req, res, next) => {
  try {
    if (!req.pharmacy) throw new AppError('Pharmacy profile not found', 404);
    const { medicineId, quantity } = req.body;
    const data = await addInventoryService(req.pharmacy._id, medicineId, quantity);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const updateInventoryItem = async (req, res, next) => {
  try {
    if (!req.pharmacy) throw new AppError('Pharmacy profile not found', 404);
    const { quantity } = req.body;
    const data = await setInventory(req.pharmacy._id, req.params.medicineId, quantity);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const deleteInventoryItem = async (req, res, next) => {
  try {
    if (!req.pharmacy) throw new AppError('Pharmacy profile not found', 404);
    const data = await deleteInventory(req.pharmacy._id, req.params.medicineId);
    res.json({ success: true, message: 'Inventory item removed', data });
  } catch (err) {
    next(err);
  }
};

export const searchMedicineCatalog = async (req, res, next) => {
  try {
    const { q, page, limit } = req.query;
    const result = await searchMedicines(q, page, limit);
    res.json({
      success: true,
      ...paginatedResponse(result.medicines, result.total, result.page, result.limit),
    });
  } catch (err) {
    next(err);
  }
};

export const findNearbyStock = async (req, res, next) => {
  try {
    if (!req.pharmacy) throw new AppError('Pharmacy profile not found', 404);
    const { medicineId, quantity, radius } = req.query;
    if (!medicineId || !quantity) throw new AppError('medicineId and quantity required', 400);

    const data = await findNearbyPharmaciesWithStock(
      req.pharmacy._id,
      medicineId,
      Number(quantity),
      radius ? Number(radius) : 10
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const createMedicineRequest = async (req, res, next) => {
  try {
    if (!req.pharmacy) throw new AppError('Pharmacy profile not found', 404);
    const { supplierPharmacyId, medicineId, quantity } = req.body;
    const data = await createRequest(req.pharmacy._id, supplierPharmacyId, medicineId, quantity, req.user);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getIncomingRequests = async (req, res, next) => {
  try {
    if (!req.pharmacy) throw new AppError('Pharmacy profile not found', 404);
    const { page, limit, status } = req.query;
    const filter = { supplierPharmacy: req.pharmacy._id };
    if (status) filter.status = status;
    const result = await getRequests(filter, page, limit);
    res.json({ success: true, ...paginatedResponse(result.requests, result.total, result.page, result.limit) });
  } catch (err) {
    next(err);
  }
};

export const getOutgoingRequests = async (req, res, next) => {
  try {
    if (!req.pharmacy) throw new AppError('Pharmacy profile not found', 404);
    const { page, limit, status } = req.query;
    const filter = { requesterPharmacy: req.pharmacy._id };
    if (status) filter.status = status;
    const result = await getRequests(filter, page, limit);
    res.json({ success: true, ...paginatedResponse(result.requests, result.total, result.page, result.limit) });
  } catch (err) {
    next(err);
  }
};

export const getAllMyRequests = async (req, res, next) => {
  try {
    if (!req.pharmacy) throw new AppError('Pharmacy profile not found', 404);
    const { page, limit } = req.query;
    const filter = {
      $or: [{ requesterPharmacy: req.pharmacy._id }, { supplierPharmacy: req.pharmacy._id }],
    };
    const result = await getRequests(filter, page, limit);
    res.json({ success: true, ...paginatedResponse(result.requests, result.total, result.page, result.limit) });
  } catch (err) {
    next(err);
  }
};

export const acceptIncomingRequest = async (req, res, next) => {
  try {
    if (!req.pharmacy) throw new AppError('Pharmacy profile not found', 404);
    const data = await acceptRequest(req.params.id, req.pharmacy._id, req.user);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const rejectIncomingRequest = async (req, res, next) => {
  try {
    if (!req.pharmacy) throw new AppError('Pharmacy profile not found', 404);
    const data = await rejectRequest(req.params.id, req.pharmacy._id, req.user);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getRequestById = async (req, res, next) => {
  try {
    const request = await MedicineRequest.findById(req.params.id)
      .populate('requesterPharmacy supplierPharmacy medicine')
      .populate({ path: 'distributor', populate: { path: 'user' } });
    if (!request) throw new AppError('Request not found', 404);
    res.json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
};

export const checkLocalStock = async (req, res, next) => {
  try {
    if (!req.pharmacy) throw new AppError('Pharmacy profile not found', 404);
    const { medicineId, quantity } = req.query;
    const inventory = await getInventory(req.pharmacy._id, { medicine: medicineId });
    const item = inventory[0];
    const available = item && item.quantity >= Number(quantity);
    res.json({
      success: true,
      data: { available, quantity: item?.quantity || 0, item },
    });
  } catch (err) {
    next(err);
  }
};

export const getSupplierInventory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const inventory = await getInventory(id);
    const pharmacy = await import('../models/Pharmacy.js').then(m => m.default.findById(id));
    if (!pharmacy) throw new AppError('Supplier not found', 404);
    res.json({ success: true, data: { inventory, pharmacy } });
  } catch (err) {
    next(err);
  }
};
