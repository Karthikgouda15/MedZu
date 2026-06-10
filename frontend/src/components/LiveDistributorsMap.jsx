import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useSocket } from '../contexts/SocketContext';

const distIcon = L.divIcon({
  className: 'custom-marker',
  html: '<div style="background:#f97316;width:24px;height:24px;border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export default function LiveDistributorsMap({ distributors: initial = [], height = '400px' }) {
  const { subscribe } = useSocket();
  const [distributors, setDistributors] = useState(initial);

  useEffect(() => {
    setDistributors(initial);
  }, [initial]);

  useEffect(() => {
    return subscribe('location_updated', (data) => {
      if (!data.distributorId) return;
      setDistributors((prev) =>
        prev.map((d) =>
          d._id === data.distributorId
            ? {
                ...d,
                currentLocation: {
                  type: 'Point',
                  coordinates: [data.longitude, data.latitude],
                },
              }
            : d
        )
      );
    });
  }, [subscribe]);

  const center =
    distributors[0]?.currentLocation?.coordinates?.[1]
      ? [
          distributors[0].currentLocation.coordinates[1],
          distributors[0].currentLocation.coordinates[0],
        ]
      : [12.9716, 77.5946];

  return (
    <div style={{ height }} className="overflow-hidden rounded-xl border border-slate-200">
      <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {distributors.map((d) => {
          const coords = d.currentLocation?.coordinates;
          if (!coords || (coords[0] === 0 && coords[1] === 0)) return null;
          return (
            <Marker key={d._id} position={[coords[1], coords[0]]} icon={distIcon}>
              <Popup>
                <strong>{d.user?.name}</strong>
                <br />
                {d.vehicleType} - {d.availabilityStatus}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
