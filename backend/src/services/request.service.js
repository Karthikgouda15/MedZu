import MedicineRequest from '../models/MedicineRequest.js';
import Pharmacy from '../models/Pharmacy.js';
import Distributor from '../models/Distributor.js';
import Medicine from '../models/Medicine.js';
import { AppError } from '../middlewares/errorHandler.js';
import { adjustInventory, checkStock } from './inventory.service.js';
import { findNearestDistributor } from './distributorAssign.service.js';
import { createNotification } from './notification.service.js';
import { logAudit } from './audit.service.js';

let ioInstance = null;

export const setSocketIO = (io) => {
  ioInstance = io;
};

const emit = (event, rooms, data) => {
  if (!ioInstance) return;
  const roomList = Array.isArray(rooms) ? rooms : [rooms];
  roomList.forEach((room) => ioInstance.to(room).emit(event, data));
};

const populateRequest = (query) =>
  query
    .populate('requesterPharmacy')
    .populate('supplierPharmacy')
    .populate({
      path: 'distributor',
      populate: { path: 'user' },
    })
    .populate('medicine');

const VALID_TRANSITIONS = {
  pending: ['accepted', 'rejected'],
  accepted: ['distributor_assigned'],
  distributor_assigned: ['pickup_started'],
  pickup_started: ['picked_up'],
  picked_up: ['en_route'],
  en_route: ['delivered'],
  delivered: ['completed'],
};

export const createRequest = async (requesterPharmacyId, supplierPharmacyId, medicineId, quantity, actor) => {
  const hasStock = await checkStock(supplierPharmacyId, medicineId, quantity);
  if (!hasStock) throw new AppError('Supplier does not have sufficient stock', 400);

  const medicine = await Medicine.findById(medicineId);
  if (!medicine) throw new AppError('Medicine not found', 404);

  const request = await MedicineRequest.create({
    requesterPharmacy: requesterPharmacyId,
    supplierPharmacy: supplierPharmacyId,
    medicine: medicineId,
    quantity,
    medicineTotal: medicine.price * quantity,
    status: 'pending',
  });

  const populated = await populateRequest(MedicineRequest.findById(request._id));

  const supplier = await Pharmacy.findById(supplierPharmacyId).populate('user');
  if (supplier?.user) {
    await createNotification(
      supplier.user._id,
      'New Medicine Request',
      `You have a new request for ${medicine.name} (qty: ${quantity})`,
      'request_received',
      request._id
    );
  }

  emit('new_request', [`pharmacy:${supplierPharmacyId}`, 'admin'], populated);
  await logAudit(actor, 'CREATE_REQUEST', 'MedicineRequest', request._id);

  return populated;
};

export const acceptRequest = async (requestId, supplierPharmacyId, actor) => {
  const request = await MedicineRequest.findById(requestId);
  if (!request) throw new AppError('Request not found', 404);
  if (request.supplierPharmacy.toString() !== supplierPharmacyId.toString()) {
    throw new AppError('Not authorized', 403);
  }
  if (request.status !== 'pending') throw new AppError('Request cannot be accepted', 400);

  request.status = 'accepted';
  await request.save();

  const distributor = await findNearestDistributor(supplierPharmacyId);
  if (distributor) {
    await assignDistributor(request._id, distributor._id, actor);
  }

  const populated = await populateRequest(MedicineRequest.findById(request._id));
  const requester = await Pharmacy.findById(request.requesterPharmacy).populate('user');

  if (requester?.user) {
    await createNotification(
      requester.user._id,
      'Request Accepted',
      `Your medicine request has been accepted`,
      'request_accepted',
      request._id
    );
  }

  emit('request_accepted', [
    `pharmacy:${request.requesterPharmacy}`,
    `pharmacy:${request.supplierPharmacy}`,
    'admin',
  ], populated);

  await logAudit(actor, 'ACCEPT_REQUEST', 'MedicineRequest', request._id);
  return populated;
};

export const rejectRequest = async (requestId, supplierPharmacyId, actor) => {
  const request = await MedicineRequest.findById(requestId);
  if (!request) throw new AppError('Request not found', 404);
  if (request.supplierPharmacy.toString() !== supplierPharmacyId.toString()) {
    throw new AppError('Not authorized', 403);
  }
  if (request.status !== 'pending') throw new AppError('Request cannot be rejected', 400);

  request.status = 'rejected';
  await request.save();

  const populated = await populateRequest(MedicineRequest.findById(request._id));
  const requester = await Pharmacy.findById(request.requesterPharmacy).populate('user');

  if (requester?.user) {
    await createNotification(
      requester.user._id,
      'Request Rejected',
      'Your medicine request was rejected',
      'request_rejected',
      request._id
    );
  }

  emit('request_rejected', [
    `pharmacy:${request.requesterPharmacy}`,
    `pharmacy:${request.supplierPharmacy}`,
    'admin',
  ], populated);

  await logAudit(actor, 'REJECT_REQUEST', 'MedicineRequest', request._id);
  return populated;
};

export const assignDistributor = async (requestId, distributorId, actor) => {
  const request = await MedicineRequest.findById(requestId);
  if (!request) throw new AppError('Request not found', 404);

  const distributor = await Distributor.findById(distributorId).populate('user');
  if (!distributor) throw new AppError('Distributor not found', 404);

  request.distributor = distributorId;
  request.status = 'distributor_assigned';
  request.deliveryFee = parseFloat(process.env.DEFAULT_DELIVERY_FEE) || 50;
  await request.save();

  distributor.availabilityStatus = 'busy';
  await distributor.save();

  const populated = await populateRequest(MedicineRequest.findById(request._id));

  if (distributor.user) {
    await createNotification(
      distributor.user._id,
      'New Delivery Assignment',
      'You have been assigned a new delivery',
      'distributor_assigned',
      request._id
    );
  }

  const requester = await Pharmacy.findById(request.requesterPharmacy).populate('user');
  const supplier = await Pharmacy.findById(request.supplierPharmacy).populate('user');

  for (const u of [requester?.user, supplier?.user].filter(Boolean)) {
    await createNotification(
      u._id,
      'Distributor Assigned',
      'A distributor has been assigned to your request',
      'distributor_assigned',
      request._id
    );
  }

  emit('distributor_assigned', [
    `distributor:${distributorId}`,
    `pharmacy:${request.requesterPharmacy}`,
    `pharmacy:${request.supplierPharmacy}`,
    `request:${request._id}`,
    'admin',
  ], populated);

  await logAudit(actor, 'ASSIGN_DISTRIBUTOR', 'MedicineRequest', request._id, { distributorId });
  return populated;
};

export const distributorRespond = async (requestId, distributorId, accept, actor) => {
  const request = await MedicineRequest.findById(requestId);
  if (!request) throw new AppError('Request not found', 404);
  if (request.distributor?.toString() !== distributorId.toString()) {
    throw new AppError('Not authorized', 403);
  }
  if (request.status !== 'distributor_assigned') {
    throw new AppError('Cannot respond to this assignment', 400);
  }

  if (!accept) {
    request.distributor = null;
    request.status = 'accepted';
    await request.save();

    const newDist = await findNearestDistributor(request.supplierPharmacy);
    if (newDist && newDist._id.toString() !== distributorId.toString()) {
      await assignDistributor(request._id, newDist._id, actor);
    }
    return populateRequest(MedicineRequest.findById(request._id));
  }

  return populateRequest(MedicineRequest.findById(request._id));
};

export const updateRequestStatus = async (requestId, newStatus, actor, distributorId = null) => {
  const request = await MedicineRequest.findById(requestId);
  if (!request) throw new AppError('Request not found', 404);

  // Idempotency: already in target status — return early without error
  if (request.status === newStatus) {
    return populateRequest(MedicineRequest.findById(request._id));
  }

  const allowed = VALID_TRANSITIONS[request.status];
  if (!allowed?.includes(newStatus)) {
    throw new AppError(`Cannot transition from ${request.status} to ${newStatus}`, 400);
  }

  if (distributorId && request.distributor?.toString() !== distributorId.toString()) {
    throw new AppError('Not authorized', 403);
  }

  request.status = newStatus;

  if (newStatus === 'picked_up') {
    try {
      await adjustInventory(request.supplierPharmacy, request.medicine, -request.quantity);
    } catch (invErr) {
      console.error('[inventory] adjustInventory (picked_up deduct) failed:', invErr.message);
    }
    const supplier = await Pharmacy.findById(request.supplierPharmacy).populate('user');
    if (supplier?.user) {
      await createNotification(
        supplier.user._id,
        'Medicine Picked Up',
        'Distributor has picked up the medicine',
        'medicine_picked',
        request._id
      );
    }
    emit('medicine_picked', [
      `pharmacy:${request.requesterPharmacy}`,
      `pharmacy:${request.supplierPharmacy}`,
      `request:${request._id}`,
      'admin',
    ], request);
  }

  if (newStatus === 'pickup_started') {
    const requester = await Pharmacy.findById(request.requesterPharmacy).populate('user');
    const supplier = await Pharmacy.findById(request.supplierPharmacy).populate('user');
    for (const u of [requester?.user, supplier?.user].filter(Boolean)) {
      await createNotification(u._id, 'Pickup Started', 'Distributor is heading to supplier', 'pickup_started', request._id);
    }
    emit('pickup_started', [
      `pharmacy:${request.requesterPharmacy}`,
      `pharmacy:${request.supplierPharmacy}`,
      `request:${request._id}`,
      'admin',
    ], request);
  }

  if (newStatus === 'en_route') {
    const requester = await Pharmacy.findById(request.requesterPharmacy).populate('user');
    if (requester?.user) {
      await createNotification(
        requester.user._id,
        'Delivery Started',
        'Medicine is on the way',
        'delivery_started',
        request._id
      );
    }
    emit('delivery_started', [
      `pharmacy:${request.requesterPharmacy}`,
      `pharmacy:${request.supplierPharmacy}`,
      `request:${request._id}`,
      'admin',
    ], request);
  }

  if (newStatus === 'delivered') {
    try {
      await adjustInventory(request.requesterPharmacy, request.medicine, request.quantity);
    } catch (invErr) {
      console.error('[inventory] adjustInventory (delivered add) failed:', invErr.message);
    }
    const requester = await Pharmacy.findById(request.requesterPharmacy).populate('user');
    if (requester?.user) {
      await createNotification(
        requester.user._id,
        'Delivery Completed',
        'Medicine has been delivered',
        'delivery_completed',
        request._id
      );
    }
    emit('delivery_completed', [
      `pharmacy:${request.requesterPharmacy}`,
      `pharmacy:${request.supplierPharmacy}`,
      `request:${request._id}`,
      'admin',
    ], request);
  }

  if (newStatus === 'completed') {
    const commissionPercent = parseFloat(process.env.PLATFORM_COMMISSION_PERCENT) || 5;
    request.commission = (request.medicineTotal * commissionPercent) / 100;

    if (request.distributor) {
      const dist = await Distributor.findById(request.distributor);
      if (dist) {
        dist.availabilityStatus = 'available';
        dist.totalEarnings += request.deliveryFee;
        await dist.save();
      }
    }
  }

  await request.save();
  const populated = await populateRequest(MedicineRequest.findById(request._id));

  const eventMap = {
    pickup_started: 'pickup_started',
    picked_up: 'medicine_picked',
    en_route: 'delivery_started',
    delivered: 'delivery_completed',
    completed: 'delivery_completed',
  };

  if (eventMap[newStatus]) {
    emit(eventMap[newStatus], [
      `pharmacy:${request.requesterPharmacy}`,
      `pharmacy:${request.supplierPharmacy}`,
      `request:${request._id}`,
      'admin',
    ], populated);
  }

  await logAudit(actor, `STATUS_${newStatus.toUpperCase()}`, 'MedicineRequest', request._id);
  return populated;
};

export const updateLocation = async (requestId, distributorId, latitude, longitude) => {
  const request = await MedicineRequest.findById(requestId);
  if (!request) throw new AppError('Request not found', 404);
  if (request.distributor?.toString() !== distributorId.toString()) {
    throw new AppError('Not authorized', 403);
  }

  request.locationHistory.push({
    coordinates: [longitude, latitude],
    timestamp: new Date(),
  });
  await request.save();

  await Distributor.findByIdAndUpdate(distributorId, {
    currentLocation: { type: 'Point', coordinates: [longitude, latitude] },
  });

  const locationData = {
    requestId: request._id,
    distributorId,
    latitude,
    longitude,
    timestamp: new Date(),
  };

  emit('location_updated', [
    `pharmacy:${request.requesterPharmacy}`,
    `pharmacy:${request.supplierPharmacy}`,
    `request:${request._id}`,
    'admin',
  ], locationData);

  return locationData;
};

export const getRequests = async (filters = {}, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const [requests, total] = await Promise.all([
    populateRequest(MedicineRequest.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit)),
    MedicineRequest.countDocuments(filters),
  ]);
  return { requests, total, page, limit };
};
