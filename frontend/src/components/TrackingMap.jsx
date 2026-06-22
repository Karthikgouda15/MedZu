import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

const createIcon = (color, label) =>
  L.divIcon({
    className: 'custom-marker',
    html: `<div style="background:${color};width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:10px;font-weight:bold">${label}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

const supplierIcon = createIcon('#3b82f6', 'S');
const requesterIcon = createIcon('#10b981', 'R');
const distributorIcon = createIcon('#f97316', 'D');

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function TrackingMap({
  supplier,
  requester,
  distributorLocation,
  locationHistory = [],
  height = '400px',
}) {
  const getCenter = () => {
    if (distributorLocation) {
      return [distributorLocation.latitude, distributorLocation.longitude];
    }
    if (requester) {
      return [requester.latitude, requester.longitude];
    }
    if (supplier) {
      return [supplier.latitude, supplier.longitude];
    }
    return [12.9716, 77.5946];
  };
  const center = getCenter();

  const routePoints = [];
  if (supplier) routePoints.push([supplier.latitude, supplier.longitude]);
  if (locationHistory?.length) {
    locationHistory.forEach((loc) => {
      if (loc.coordinates) routePoints.push([loc.coordinates[1], loc.coordinates[0]]);
    });
  } else if (distributorLocation) {
    routePoints.push([distributorLocation.latitude, distributorLocation.longitude]);
  }
  if (requester) routePoints.push([requester.latitude, requester.longitude]);

  return (
    <div style={{ height }} className="overflow-hidden rounded-xl border border-slate-200">
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={center} />

        {supplier && (
          <Marker position={[supplier.latitude, supplier.longitude]} icon={supplierIcon}>
            <Popup>Supplier: {supplier.pharmacyName}</Popup>
          </Marker>
        )}

        {requester && (
          <Marker position={[requester.latitude, requester.longitude]} icon={requesterIcon}>
            <Popup>Requester: {requester.pharmacyName}</Popup>
          </Marker>
        )}

        {distributorLocation && (
          <Marker
            position={[distributorLocation.latitude, distributorLocation.longitude]}
            icon={distributorIcon}
          >
            <Popup>Distributor (Live)</Popup>
          </Marker>
        )}

        {routePoints.length > 1 && (
          <Polyline positions={routePoints} color="#10b981" weight={3} dashArray="8 8" />
        )}
      </MapContainer>
    </div>
  );
}
