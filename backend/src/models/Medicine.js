import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    manufacturer: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    sku: { type: String, unique: true, sparse: true, trim: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

medicineSchema.index({ name: 'text', manufacturer: 'text', category: 'text' });

export default mongoose.model('Medicine', medicineSchema);
