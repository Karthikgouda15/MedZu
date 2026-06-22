import mongoose from 'mongoose';

const REQUEST_STATUSES = [
  'pending',
  'accepted',
  'rejected',
  'distributor_assigned',
  'pickup_started',
  'picked_up',
  'en_route',
  'delivered',
  'completed',
];

const locationPointSchema = new mongoose.Schema(
  {
    coordinates: [Number],
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const medicineRequestSchema = new mongoose.Schema(
  {
    requesterPharmacy: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
    supplierPharmacy: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
    distributor: { type: mongoose.Schema.Types.ObjectId, ref: 'Distributor', default: null },
    medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    quantity: { type: Number, required: true, min: 1 },
    status: { type: String, enum: REQUEST_STATUSES, default: 'pending' },
    deliveryFee: { type: Number, default: 0 },
    commission: { type: Number, default: 0 },
    medicineTotal: { type: Number, default: 0 },
    locationHistory: [locationPointSchema],
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

medicineRequestSchema.statics.REQUEST_STATUSES = REQUEST_STATUSES;

export default mongoose.model('MedicineRequest', medicineRequestSchema);
