import Notification from '../models/Notification.js';

let ioInstance = null;

export const setSocketIO = (io) => {
  ioInstance = io;
};

export const createNotification = async (userId, title, message, type = 'general', relatedRequest = null) => {
  const notification = await Notification.create({
    user: userId,
    title,
    message,
    type,
    relatedRequest,
  });

  if (ioInstance) {
    ioInstance.to(`user:${userId}`).emit('notification_created', notification);
  }

  return notification;
};

export const notifyUsers = async (userIds, title, message, type, relatedRequest) => {
  const notifications = await Promise.all(
    userIds.map((id) => createNotification(id, title, message, type, relatedRequest))
  );
  return notifications;
};
