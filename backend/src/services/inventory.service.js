import Inventory from '../models/Inventory.js';
import { AppError } from '../middlewares/errorHandler.js';

let ioInstance = null;

export const setSocketIO = (io) => {
  ioInstance = io;
};

export const getInventory = async (pharmacyId, filters = {}) => {
  const query = { pharmacy: pharmacyId };
  if (filters.medicine) query.medicine = filters.medicine;

  return Inventory.find(query)
    .populate('medicine')
    .sort({ updatedAt: -1 });
};

export const upsertInventory = async (pharmacyId, medicineId, quantity) => {
  const item = await Inventory.findOneAndUpdate(
    { pharmacy: pharmacyId, medicine: medicineId },
    { quantity },
    { new: true, upsert: true, runValidators: true }
  ).populate('medicine');

  if (ioInstance) {
    ioInstance.to(`pharmacy:${pharmacyId}`).emit('inventory_updated', item);
  }

  return item;
};

export const adjustInventory = async (pharmacyId, medicineId, delta) => {
  const item = await Inventory.findOne({ pharmacy: pharmacyId, medicine: medicineId });
  if (!item) throw new AppError('Inventory item not found', 404);

  const newQty = item.quantity + delta;
  if (newQty < 0) throw new AppError('Insufficient stock', 400);

  item.quantity = newQty;
  await item.save();
  await item.populate('medicine');

  if (ioInstance) {
    ioInstance.to(`pharmacy:${pharmacyId}`).emit('inventory_updated', item);
  }

  return item;
};

export const checkStock = async (pharmacyId, medicineId, quantity) => {
  const item = await Inventory.findOne({ pharmacy: pharmacyId, medicine: medicineId });
  return item && item.quantity >= quantity;
};
