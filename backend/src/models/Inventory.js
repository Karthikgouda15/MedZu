import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
  {
    pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
    medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    quantity: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true }
);

inventorySchema.index({ pharmacy: 1, medicine: 1 }, { unique: true });

export default mongoose.model('Inventory', inventorySchema);
