import { Server } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';
import Pharmacy from '../models/Pharmacy.js';
import Distributor from '../models/Distributor.js';
import { updateLocation } from '../services/request.service.js';
import * as notificationService from '../services/notification.service.js';
import * as inventoryService from '../services/inventory.service.js';
import * as requestService from '../services/request.service.js';

const locationThrottle = new Map();
const THROTTLE_MS = 5000;

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
    pingInterval: 10000, // Send ping every 10 seconds to keep connection alive on reverse proxies
    pingTimeout: 5000,   // Timeout connection if pong not received in 5 seconds
  });

  notificationService.setSocketIO(io);
  inventoryService.setSocketIO(io);
  requestService.setSocketIO(io);

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const user = socket.user;
    socket.join(`user:${user._id}`);

    if (user.role === 'admin') {
      socket.join('admin');
    }

    if (user.role === 'pharmacy') {
      const pharmacy = await Pharmacy.findOne({ user: user._id });
      if (pharmacy) socket.join(`pharmacy:${pharmacy._id}`);
    }

    if (user.role === 'distributor') {
      const distributor = await Distributor.findOne({ user: user._id });
      if (distributor) socket.join(`distributor:${distributor._id}`);
    }

    socket.on('join_rooms', async ({ requestId }) => {
      if (requestId) socket.join(`request:${requestId}`);
    });

    socket.on('update_location', async ({ requestId, latitude, longitude }) => {
      if (user.role !== 'distributor') return;

      const distributor = await Distributor.findOne({ user: user._id });
      if (!distributor) return;

      const key = `${distributor._id}`;
      const now = Date.now();
      if (locationThrottle.has(key) && now - locationThrottle.get(key) < THROTTLE_MS) {
        return;
      }
      locationThrottle.set(key, now);

      try {
        if (requestId) {
          await updateLocation(requestId, distributor._id, latitude, longitude);
        } else {
          await Distributor.findByIdAndUpdate(distributor._id, {
            currentLocation: { type: 'Point', coordinates: [longitude, latitude] },
          });
          io.to('admin').emit('location_updated', {
            distributorId: distributor._id,
            latitude,
            longitude,
            timestamp: new Date(),
          });
        }
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('disconnect', () => {
      locationThrottle.delete(socket.user?._id?.toString());
    });
  });

  return io;
};
