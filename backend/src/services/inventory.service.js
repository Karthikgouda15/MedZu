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

// Legacy: kept for backward compat (adds to existing or creates new)
export const upsertInventory = async (pharmacyId, medicineId, quantity) => {
  return addInventory(pharmacyId, medicineId, quantity);
};

// Add/increment stock (used by POST /pharmacy/inventory)
export const addInventory = async (pharmacyId, medicineId, quantityToAdd) => {
  const existing = await Inventory.findOne({ pharmacy: pharmacyId, medicine: medicineId });
  const newQty = existing ? existing.quantity + Number(quantityToAdd) : Number(quantityToAdd);

  const item = await Inventory.findOneAndUpdate(
    { pharmacy: pharmacyId, medicine: medicineId },
    { quantity: newQty },
    { new: true, upsert: true, runValidators: true }
  ).populate('medicine');

  if (ioInstance) {
    ioInstance.to(`pharmacy:${pharmacyId}`).emit('inventory_updated', item);
  }

  return item;
};

// Set stock to a specific quantity (used by PATCH /pharmacy/inventory/:medicineId)
export const setInventory = async (pharmacyId, medicineId, quantity) => {
  const item = await Inventory.findOneAndUpdate(
    { pharmacy: pharmacyId, medicine: medicineId },
    { quantity: Number(quantity) },
    { new: true, upsert: true, runValidators: true }
  ).populate('medicine');

  if (ioInstance) {
    ioInstance.to(`pharmacy:${pharmacyId}`).emit('inventory_updated', item);
  }

  return item;
};

// Delete an inventory item (used by DELETE /pharmacy/inventory/:medicineId)
export const deleteInventory = async (pharmacyId, medicineId) => {
  const item = await Inventory.findOneAndDelete({ pharmacy: pharmacyId, medicine: medicineId });
  if (!item) throw new AppError('Inventory item not found', 404);

  if (ioInstance) {
    ioInstance.to(`pharmacy:${pharmacyId}`).emit('inventory_updated', { deleted: true, medicineId });
  }

  return item;
};

export const adjustInventory = async (pharmacyId, medicineId, delta) => {
  const item = await Inventory.findOne({ pharmacy: pharmacyId, medicine: medicineId });

  // If no inventory record exists:
  // - For additions (delta > 0): create a new record with the given quantity (upsert)
  // - For deductions (delta < 0): the item simply doesn't exist, throw a clear error
  if (!item) {
    if (delta > 0) {
      // Receiving medicine for the first time — create inventory entry
      const newItem = await Inventory.findOneAndUpdate(
        { pharmacy: pharmacyId, medicine: medicineId },
        { quantity: delta },
        { new: true, upsert: true, runValidators: true }
      ).populate('medicine');

      if (ioInstance) {
        ioInstance.to(`pharmacy:${pharmacyId}`).emit('inventory_updated', newItem);
      }
      return newItem;
    }
    // delta <= 0 and no inventory record — nothing to deduct
    throw new AppError('Inventory item not found for this medicine at the source pharmacy', 404);
  }

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
