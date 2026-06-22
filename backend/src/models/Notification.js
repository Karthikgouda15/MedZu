import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'request_received',
        'request_accepted',
        'request_rejected',
        'distributor_assigned',
        'pickup_started',
        'medicine_picked',
        'delivery_started',
        'delivery_completed',
        'inventory_updated',
        'general',
      ],
      default: 'general',
    },
    readStatus: { type: Boolean, default: false },
    relatedRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'MedicineRequest' },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
