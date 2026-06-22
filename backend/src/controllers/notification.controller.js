import Notification from '../models/Notification.js';
import { paginatedResponse } from '../utils/pagination.js';

export const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const skip = (page - 1) * limit;
    const filter = { user: req.user._id };
    if (unreadOnly === 'true') filter.readStatus = false;

    const [data, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate({
          path: 'relatedRequest',
          populate: [
            { path: 'medicine', select: 'name category manufacturer' },
            { path: 'requesterPharmacy', select: 'pharmacyName' },
            { path: 'supplierPharmacy', select: 'pharmacyName' },
            { path: 'distributor', populate: { path: 'user', select: 'name phone' } },
          ],
        }),
      Notification.countDocuments(filter),
      Notification.countDocuments({ user: req.user._id, readStatus: false }),
    ]);

    res.json({
      success: true,
      unreadCount,
      ...paginatedResponse(data, total, Number(page), Number(limit)),
    });
  } catch (err) {
    next(err);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { readStatus: true },
      { new: true }
    );
    res.json({ success: true, data: notification });
  } catch (err) {
    next(err);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, readStatus: false }, { readStatus: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};
