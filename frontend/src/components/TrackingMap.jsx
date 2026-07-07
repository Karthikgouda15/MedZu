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

/** Safely extract [lat, lng] from a pharmacy object.
 *  Supports both flat {latitude, longitude} and GeoJSON {location.coordinates:[lng,lat]}.
 *  Returns null if coordinates are missing or invalid.
 */
function getLatLng(pharmacy) {
  if (!pharmacy) return null;

  // Prefer flat fields
  const lat = pharmacy.latitude;
  const lng = pharmacy.longitude;
  if (lat != null && lng != null && isFinite(lat) && isFinite(lng)) {
    return [lat, lng];
  }

  // Fallback: GeoJSON coordinates [lng, lat]
  const coords = pharmacy.location?.coordinates;
  if (Array.isArray(coords) && coords.length >= 2 && isFinite(coords[0]) && isFinite(coords[1])) {
    return [coords[1], coords[0]];
  }

  return null;
}

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
  const supplierLatLng = getLatLng(supplier);
  const requesterLatLng = getLatLng(requester);

  const distributorLatLng =
    distributorLocation &&
    isFinite(distributorLocation.latitude) &&
    isFinite(distributorLocation.longitude)
      ? [distributorLocation.latitude, distributorLocation.longitude]
      : null;

  const getCenter = () => {
    if (distributorLatLng) return distributorLatLng;
    if (supplierLatLng) return supplierLatLng;
    if (requesterLatLng) return requesterLatLng;
    return [12.9716, 77.5946]; // Default: Bengaluru
  };
  const center = getCenter();

  // Build route points — only include valid coordinate pairs
  const routePoints = [];
  if (supplierLatLng) routePoints.push(supplierLatLng);

  if (locationHistory?.length) {
    locationHistory.forEach((loc) => {
      const coords = loc.coordinates;
      if (Array.isArray(coords) && coords.length >= 2 && isFinite(coords[0]) && isFinite(coords[1])) {
        routePoints.push([coords[1], coords[0]]);
      }
    });
  } else if (distributorLatLng) {
    routePoints.push(distributorLatLng);
  }

  if (requesterLatLng) routePoints.push(requesterLatLng);

  return (
    <div style={{ height }} className="overflow-hidden rounded-xl border border-slate-200">
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={center} />

        {supplierLatLng && (
          <Marker position={supplierLatLng} icon={supplierIcon}>
            <Popup>Supplier: {supplier?.pharmacyName}</Popup>
          </Marker>
        )}

        {requesterLatLng && (
          <Marker position={requesterLatLng} icon={requesterIcon}>
            <Popup>Requester: {requester?.pharmacyName}</Popup>
          </Marker>
        )}

        {distributorLatLng && (
          <Marker position={distributorLatLng} icon={distributorIcon}>
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
