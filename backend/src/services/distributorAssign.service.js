import Distributor from '../models/Distributor.js';
import Pharmacy from '../models/Pharmacy.js';

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const findNearestDistributor = async (supplierPharmacyId) => {
  const supplier = await Pharmacy.findById(supplierPharmacyId);
  if (!supplier) return null;

  const distributors = await Distributor.find({ availabilityStatus: 'available' }).populate('user');

  if (!distributors.length) return null;

  const [lng, lat] = supplier.location.coordinates;

  let nearest = null;
  let minDist = Infinity;

  for (const d of distributors) {
    const [dLng, dLat] = d.currentLocation?.coordinates || [0, 0];
    if (dLat === 0 && dLng === 0) continue;
    const dist = haversineDistance(lat, lng, dLat, dLng);
    if (dist < minDist) {
      minDist = dist;
      nearest = d;
    }
  }

  if (!nearest && distributors.length) {
    nearest = distributors[0];
  }

  return nearest;
};

export const updateDistributorLocation = async (distributorId, latitude, longitude) => {
  return Distributor.findByIdAndUpdate(
    distributorId,
    {
      currentLocation: { type: 'Point', coordinates: [longitude, latitude] },
      availabilityStatus: 'busy',
    },
    { new: true }
  );
};
