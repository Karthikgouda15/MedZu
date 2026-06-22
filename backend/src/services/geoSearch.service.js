import Pharmacy from '../models/Pharmacy.js';
import Inventory from '../models/Inventory.js';
import Medicine from '../models/Medicine.js';

const EARTH_RADIUS_KM = 6371;

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const estimateETA = (distanceKm) => {
  const avgSpeedKmh = 25;
  const minutes = Math.ceil((distanceKm / avgSpeedKmh) * 60);
  return `${minutes} min`;
};

export const findNearbyPharmaciesWithStock = async (
  requesterPharmacyId,
  medicineId,
  quantity,
  radiusKm = 10
) => {
  const requester = await Pharmacy.findById(requesterPharmacyId);
  if (!requester) throw new Error('Requester pharmacy not found');

  const [lng, lat] = requester.location.coordinates;

  const nearbyPharmacies = await Pharmacy.find({
    _id: { $ne: requesterPharmacyId },
    status: 'active',
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: radiusKm * 1000,
      },
    },
  });

  const pharmacyIds = nearbyPharmacies.map((p) => p._id);
  const inventoryItems = await Inventory.find({
    pharmacy: { $in: pharmacyIds },
    medicine: medicineId,
    quantity: { $gte: quantity },
  }).populate('medicine');

  const stockMap = new Map(inventoryItems.map((i) => [i.pharmacy.toString(), i]));

  const results = nearbyPharmacies
    .filter((p) => stockMap.has(p._id.toString()))
    .map((p) => {
      const inv = stockMap.get(p._id.toString());
      const distance = haversineDistance(lat, lng, p.latitude, p.longitude);
      return {
        pharmacy: p,
        availableStock: inv.quantity,
        distance: Math.round(distance * 100) / 100,
        estimatedDeliveryTime: estimateETA(distance),
        medicine: inv.medicine,
      };
    })
    .sort((a, b) => a.distance - b.distance);

  return results;
};

export const searchMedicines = async (query, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  let filter = { status: 'active' };
  
  if (query) {
    const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    filter.$or = [
      { name: { $regex: escapedQuery, $options: 'i' } },
      { manufacturer: { $regex: escapedQuery, $options: 'i' } },
      { category: { $regex: escapedQuery, $options: 'i' } },
    ];
  }

  const [medicines, total] = await Promise.all([
    Medicine.find(filter).skip(skip).limit(limit).sort({ name: 1 }),
    Medicine.countDocuments(filter),
  ]);

  return { medicines, total, page, limit };
};
