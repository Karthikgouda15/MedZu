import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Package, Truck, Navigation, CheckCircle, MapPin, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { useSocket } from '../../contexts/SocketContext';
import { joinRequestRoom, emitLocation } from '../../services/socket';
import TrackingMap from '../../components/TrackingMap';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';

const STEPS = [
  { status: 'distributor_assigned', label: 'Assigned', action: null, icon: CheckCircle },
  { status: 'pickup_started', label: 'Start Pickup', action: 'pickup-start', icon: Navigation },
  { status: 'picked_up', label: 'Mark Picked Up', action: 'picked-up', icon: Package },
  { status: 'en_route', label: 'Start Delivery', action: 'en-route', icon: Truck },
  { status: 'delivered', label: 'Mark Delivered', action: 'delivered', icon: MapPin },
];

export default function DistributorActive() {
  const { subscribe } = useSocket();
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const watchId = useRef(null);
  const gpsErrorShown = useRef(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/distributor/active');
        setDeliveries(data.data || []);
        setSelected((currSelected) => {
          if (data.data?.length && !currSelected) return data.data[0];
          return currSelected;
        });
      } catch (err) {
        console.error('Failed to fetch active deliveries:', err);
        setDeliveries([]);
      } finally {
        setLoading(false);
      }
    };

    Promise.resolve().then(() => {
      fetch();
    });
  }, []);

  useEffect(() => {
    if (!selected) return;
    joinRequestRoom(selected._id);
    gpsErrorShown.current = false; // reset on new selection

    if (navigator.geolocation) {
      watchId.current = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setCurrentLocation({ latitude, longitude });
          emitLocation(selected._id, latitude, longitude);
          api.patch('/distributor/location', { latitude, longitude, requestId: selected._id }).catch(() => {});
        },
        () => {
          if (!gpsErrorShown.current) {
            gpsErrorShown.current = true;
            toast.error('Enable GPS for live tracking');
          }
        },
        { enableHighAccuracy: true, maximumAge: 5000 }
      );
    }

    return () => {
      if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
    };
  }, [selected]);

  useEffect(() => {
    // Subscribe to status updates for real-time delivery progress
    const events = ['pickup_started', 'medicine_picked', 'delivery_started', 'delivery_completed'];
    const unsubs = events.map((event) =>
      subscribe(event, (req) => {
        if (req._id === selected?._id) {
          setSelected(req);
          // Refresh deliveries list
          api.get('/distributor/active')
            .then(({ data }) => {
              const activeList = data.data || [];
              setDeliveries(activeList);
              const updated = activeList.find((d) => d._id === selected._id);
              if (updated) setSelected(updated);
            })
            .catch(() => {});
        }
      })
    );

    return () => unsubs.forEach((u) => u());
  }, [selected, subscribe]);

  const performAction = async (action) => {
    if (!selected || !action || actionLoading) return;
    const endpoints = {
      'pickup-start': 'pickup-start',
      'picked-up': 'picked-up',
      'en-route': 'en-route',
      delivered: 'delivered',
    };
    setActionLoading(true);
    try {
      await api.patch(`/distributor/requests/${selected._id}/${endpoints[action]}`);
      toast.success(action === 'delivered' ? 'Delivery completed! 🎉' : 'Status updated');
      const { data } = await api.get('/distributor/active');
      const activeList = data.data || [];
      setDeliveries(activeList);
      if (activeList.length > 0) {
        const updated = activeList.find((d) => d._id === selected._id);
        setSelected(updated || activeList[0] || null);
      } else {
        setSelected(null);
        navigate('/distributor/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const getNextAction = () => {
    if (!selected) return null;
    const idx = STEPS.findIndex((s) => s.status === selected.status);
    if (idx < 0 || idx >= STEPS.length - 1) return null;
    return STEPS[idx + 1];
  };

  if (loading) return <LoadingSpinner />;

  if (!deliveries.length) {
    return (
      <div className="space-y-6">
        <PageHeader title="Active Delivery" />
        <EmptyState title="No active deliveries" description="You don't have any active deliveries right now. Check your pending assignments." icon={Truck} />
      </div>
    );
  }

  const nextStep = getNextAction();

  return (
    <div className="space-y-6">
      <PageHeader title="Active Delivery" subtitle="Manage your current delivery routing and status" />

      {/* Tabs */}
      <div className="animate-fade-in-up flex flex-wrap gap-2">
        {deliveries.map((d) => (
          <button
            key={d._id}
            onClick={() => setSelected(d)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              selected?._id === d._id 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-200' 
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Package className="h-4 w-4" />
            {d.medicine?.name}
          </button>
        ))}
      </div>

      {selected && (
        <div className="animate-fade-in-up stagger-1 grid gap-6 lg:grid-cols-3">
          {/* Action Panel */}
          <div className="space-y-6 lg:col-span-1">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4">
                <StatusBadge status={selected.status} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">{selected.medicine?.name}</h3>
              <p className="mt-1 text-sm text-slate-500">Quantity: <span className="font-semibold text-slate-900">{selected.quantity}</span></p>
              
              <div className="my-6 space-y-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pickup From</p>
                  <p className="mt-1 font-medium text-slate-900">{selected.supplierPharmacy?.pharmacyName}</p>
                  <p className="text-sm text-slate-500">{selected.supplierPharmacy?.address}</p>
                </div>
                <div className="border-t border-slate-200 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Deliver To</p>
                  <p className="mt-1 font-medium text-slate-900">{selected.requesterPharmacy?.pharmacyName}</p>
                  <p className="text-sm text-slate-500">{selected.requesterPharmacy?.address}</p>
                </div>
              </div>

              {nextStep?.action && (
                <button
                  onClick={() => performAction(nextStep.action)}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-teal-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary-200 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-primary-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {actionLoading ? 'Updating...' : <>{nextStep.label} <ArrowRight className="h-4 w-4" /></>}
                </button>
              )}
            </div>

            {/* Stepper Progress */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-6 font-bold text-slate-900">Delivery Progress</h3>
              <div className="space-y-6">
                {STEPS.map((step, i) => {
                  const currentIdx = STEPS.findIndex((s) => s.status === selected.status);
                  const isCompleted = i <= currentIdx;
                  const isCurrent = i === currentIdx;
                  
                  return (
                    <div key={step.status} className="relative flex gap-4">
                      {i < STEPS.length - 1 && (
                        <div className={`absolute left-[15px] top-[30px] h-full w-0.5 ${
                          isCompleted ? 'bg-primary-500' : 'bg-slate-100'
                        }`} />
                      )}
                      
                      <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                        isCompleted
                          ? 'border-primary-500 bg-primary-500 text-white shadow-sm shadow-primary-200'
                          : 'border-slate-200 bg-white text-slate-300'
                      }`}>
                        {isCurrent ? (
                          <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                        ) : (
                          <step.icon className="h-4 w-4" />
                        )}
                      </div>
                      
                      <div className="pt-1">
                        <p className={`text-sm font-semibold ${
                          isCompleted ? 'text-slate-900' : 'text-slate-400'
                        }`}>
                          {step.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-2 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
            <TrackingMap
              supplier={selected.supplierPharmacy}
              requester={selected.requesterPharmacy}
              distributorLocation={currentLocation}
              locationHistory={selected.locationHistory}
              height="100%"
            />
          </div>
        </div>
      )}
    </div>
  );
}
