import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { MapPin, Navigation, Signal, SignalZero } from 'lucide-react';
import api from '../../services/api';
import { useSocket } from '../../contexts/SocketContext';
import { emitLocation } from '../../services/socket';
import TrackingMap from '../../components/TrackingMap';
import PageHeader from '../../components/PageHeader';
import { useAuth } from '../../contexts/AuthContext';

export default function DistributorTracking() {
  const { subscribe } = useSocket();
  const { profile } = useAuth();
  const [location, setLocation] = useState(null);
  const [tracking, setTracking] = useState(false);
  const watchId = useRef(null);

  const startTracking = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    setTracking(true);
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ latitude, longitude });
        emitLocation(null, latitude, longitude);
        api.patch('/distributor/location', { latitude, longitude }).catch(() => {});
      },
      () => toast.error('Enable location permissions'),
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
    api.patch('/distributor/availability', { status: 'available' });
  };

  const stopTracking = () => {
    if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
    setTracking(false);
    api.patch('/distributor/availability', { status: 'offline' });
  };

  useEffect(() => () => {
    if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
  }, []);

  useEffect(() => {
    // Subscribe to distributor_assigned events for real-time assignment notifications
    const unsub = subscribe('distributor_assigned', (data) => {
      toast.success('New delivery assignment received!');
      // Optionally navigate to active deliveries or show notification
    });

    return unsub;
  }, [subscribe]);

  const coords = profile?.currentLocation?.coordinates;

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-100px)]">
      <div className="flex-shrink-0">
        <PageHeader title="GPS Tracking" subtitle="Manage your live location sharing for incoming assignments" />

        <div className="mb-6 flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row">
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${tracking ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
              {tracking ? <Signal className="h-6 w-6 animate-pulse" /> : <SignalZero className="h-6 w-6" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Location Broadcast</h3>
              <p className={`text-sm ${tracking ? 'text-emerald-600 font-medium' : 'text-slate-500'}`}>
                {tracking ? 'Active — Updating every 5s' : 'Offline — Not receiving assignments'}
              </p>
            </div>
          </div>
          <button
            onClick={tracking ? stopTracking : startTracking}
            className={`flex items-center gap-2 rounded-xl px-6 py-3 font-bold text-white shadow-lg transition-all hover:scale-[1.02] ${
              tracking 
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 shadow-rose-200 hover:shadow-xl hover:shadow-rose-300' 
                : 'bg-gradient-to-r from-primary-600 to-teal-600 shadow-primary-200 hover:shadow-xl hover:shadow-primary-300'
            }`}
          >
            {tracking ? 'Stop Broadcasting' : 'Start Broadcasting'}
            <Navigation className={`h-4 w-4 ${tracking ? '' : 'animate-bounce'}`} />
          </button>
        </div>
      </div>

      <div className="animate-fade-in-up flex-1 overflow-hidden rounded-2xl border border-slate-200 shadow-sm relative">
        {!tracking && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/10 backdrop-blur-[2px]">
            <div className="rounded-2xl bg-white p-6 text-center shadow-2xl">
              <MapPin className="mx-auto mb-3 h-10 w-10 text-slate-300" />
              <h3 className="font-bold text-slate-900">Map Paused</h3>
              <p className="mt-1 text-sm text-slate-500">Start broadcasting to view your live location</p>
            </div>
          </div>
        )}
        <TrackingMap
          distributorLocation={location || (coords ? { latitude: coords[1], longitude: coords[0] } : null)}
          height="100%"
        />
      </div>
    </div>
  );
}
