import { useEffect, useState } from 'react';
import { Package, Truck, CheckCircle, MapPin, Navigation } from 'lucide-react';
import api from '../../services/api';
import { useSocket } from '../../contexts/SocketContext';
import { joinRequestRoom } from '../../services/socket';
import TrackingMap from '../../components/TrackingMap';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';

const TIMELINE_STEPS = [
  { id: 'accepted', label: 'Order Accepted', icon: Package },
  { id: 'distributor_assigned', label: 'Distributor Assigned', icon: Truck },
  { id: 'picked_up', label: 'Picked Up', icon: Package },
  { id: 'en_route', label: 'En Route', icon: Navigation },
  { id: 'delivered', label: 'Delivered', icon: CheckCircle },
];

export default function PharmacyTracking() {
  const { subscribe } = useSocket();
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [distributorLocation, setDistributorLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/pharmacy/requests/outgoing')
      .then(({ data }) => {
        const active = (data.data || []).filter((r) =>
          ['accepted', 'distributor_assigned', 'pickup_started', 'picked_up', 'en_route', 'delivered'].includes(r.status)
        );
        setRequests(active);
        if (active.length) setSelected(active[0]);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch tracking requests:', err);
        setRequests([]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (selected) joinRequestRoom(selected._id);
  }, [selected]);

  useEffect(() => {
    return subscribe('location_updated', (data) => {
      if (selected && data.requestId === selected._id) {
        setDistributorLocation({ latitude: data.latitude, longitude: data.longitude });
      }
    });
  }, [selected, subscribe]);

  useEffect(() => {
    const events = ['request_accepted', 'pickup_started', 'medicine_picked', 'delivery_started', 'delivery_completed', 'distributor_assigned'];
    const unsubs = events.map((e) =>
      subscribe(e, (req) => {
        if (req._id === selected?._id) setSelected(req);
        // Refresh requests list to update tabs
        api.get('/pharmacy/requests/outgoing').then(({ data }) => {
           const active = data.data.filter((r) =>
             ['accepted', 'distributor_assigned', 'pickup_started', 'picked_up', 'en_route', 'delivered'].includes(r.status)
           );
           setRequests(active);
        });
      })
    );
    return () => unsubs.forEach((u) => u());
  }, [selected, subscribe]);

  if (loading) return <LoadingSpinner />;

  if (!requests.length) {
    return (
      <div className="space-y-6">
        <PageHeader title="Live Tracking" />
        <EmptyState title="No active deliveries" description="You don't have any active procurement requests currently in transit." icon={MapPin} />
      </div>
    );
  }

  const getCurrentStepIndex = (status) => {
    if (status === 'completed') return TIMELINE_STEPS.length;
    if (status === 'pickup_started') return 1; // Between assigned and picked up
    return TIMELINE_STEPS.findIndex(s => s.id === status);
  };

  const currentIdx = getCurrentStepIndex(selected?.status);

  return (
    <div className="space-y-6">
      <PageHeader title="Live Delivery Tracking" />

      {/* Tabs */}
      <div className="animate-fade-in-up flex flex-wrap gap-2">
        {requests.map((r) => (
          <button
            key={r._id}
            onClick={() => { setSelected(r); setDistributorLocation(null); }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              selected?._id === r._id 
                ? 'bg-gradient-to-r from-primary-600 to-teal-600 text-white shadow-md shadow-primary-200' 
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Package className="h-4 w-4" />
            {r.medicine?.name}
          </button>
        ))}
      </div>

      {selected && (
        <div className="animate-fade-in-up stagger-1 grid gap-6 lg:grid-cols-3">
          {/* Main tracking area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
              <TrackingMap
                supplier={selected.supplierPharmacy}
                requester={selected.requesterPharmacy}
                distributorLocation={distributorLocation}
                locationHistory={selected.locationHistory}
                height="450px"
              />
            </div>
          </div>

          {/* Side panel */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold text-slate-900">Order Details</h3>
                <StatusBadge status={selected.status} />
              </div>
              <div className="space-y-3 rounded-xl bg-slate-50 p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Medicine</span>
                  <span className="font-semibold text-slate-900">{selected.medicine?.name} × {selected.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Supplier</span>
                  <span className="font-medium text-slate-900">{selected.supplierPharmacy?.pharmacyName}</span>
                </div>
                {selected.distributor && (
                  <div className="flex justify-between border-t border-slate-200 pt-3">
                    <span className="text-slate-500">Distributor</span>
                    <span className="font-medium text-primary-600">{selected.distributor?.user?.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline Stepper */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-6 font-bold text-slate-900">Delivery Status</h3>
              <div className="space-y-6">
                {TIMELINE_STEPS.map((step, i) => {
                  const isCompleted = currentIdx >= i;
                  
                  // Special case for 'Searching for distributor'
                  const isSearching = selected.status === 'accepted' && step.id === 'distributor_assigned';
                  const isCurrent = currentIdx === i || (selected.status === 'pickup_started' && i === 1);
                  
                  let label = step.label;
                  if (isSearching) label = 'Searching for delivery partner...';
                  if (isCompleted && step.id === 'distributor_assigned' && selected.distributor) {
                    label = `Rider Assigned: ${selected.distributor.user.name} (${selected.distributor.user.vehicleNo})`;
                  }

                  return (
                    <div key={step.id} className="relative flex gap-4">
                      {/* Connecting line */}
                      {i < TIMELINE_STEPS.length - 1 && (
                        <div className={`absolute left-[15px] top-[30px] h-full w-0.5 ${
                          isCompleted ? 'bg-primary-500' : 'bg-slate-100'
                        }`} />
                      )}
                      
                      {/* Step icon */}
                      <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                        isCompleted
                          ? 'border-primary-500 bg-primary-500 text-white shadow-sm shadow-primary-200'
                          : isSearching 
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-500' 
                          : 'border-slate-200 bg-white text-slate-300'
                      }`}>
                        {isSearching ? (
                          <div className="h-4 w-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                        ) : isCurrent ? (
                          <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                        ) : (
                          <step.icon className="h-4 w-4" />
                        )}
                      </div>
                      
                      {/* Step text */}
                      <div className="pt-1">
                        <p className={`text-sm font-semibold ${
                          isCompleted ? 'text-slate-900' : isSearching ? 'text-emerald-600 animate-pulse' : 'text-slate-400'
                        }`}>
                          {label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
