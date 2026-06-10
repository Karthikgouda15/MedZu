import mongoose from 'mongoose';

const distributorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    vehicleType: { type: String, enum: ['bike', 'scooter', 'car', 'van'], default: 'bike' },
    currentLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },
    availabilityStatus: {
      type: String,
      enum: ['available', 'busy', 'offline'],
      default: 'offline',
    },
    totalEarnings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

distributorSchema.index({ currentLocation: '2dsphere' });

export default mongoose.model('Distributor', distributorSchema);
