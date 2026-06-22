import mongoose from 'mongoose';

const pharmacySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    pharmacyName: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    licenseNumber: { type: String, trim: true },
    status: { type: String, enum: ['active', 'pending', 'inactive'], default: 'pending' },
  },
  { timestamps: true }
);

pharmacySchema.pre('save', function (next) {
  if (this.latitude != null && this.longitude != null) {
    this.location = { type: 'Point', coordinates: [this.longitude, this.latitude] };
  }
  next();
});

pharmacySchema.index({ location: '2dsphere' });

export default mongoose.model('Pharmacy', pharmacySchema);
