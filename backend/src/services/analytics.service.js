import Pharmacy from '../models/Pharmacy.js';
import Distributor from '../models/Distributor.js';
import Medicine from '../models/Medicine.js';
import MedicineRequest from '../models/MedicineRequest.js';
import Inventory from '../models/Inventory.js';

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const getAdminAnalytics = async () => {
  const [
    totalPharmacies,
    totalDistributors,
    totalMedicines,
    totalRequests,
    activeDeliveries,
    completedDeliveries,
    rejectedRequests,
    revenueAgg,
    monthlyRequests,
    monthlyDeliveries,
    pharmacyPerformance,
    distributorPerformance,
    inventoryStats,
  ] = await Promise.all([
    Pharmacy.countDocuments({ status: 'active' }),
    Distributor.countDocuments(),
    Medicine.countDocuments({ status: 'active' }),
    MedicineRequest.countDocuments(),
    MedicineRequest.countDocuments({
      status: { $in: ['distributor_assigned', 'pickup_started', 'picked_up', 'en_route', 'delivered'] },
    }),
    MedicineRequest.countDocuments({ status: 'completed' }),
    MedicineRequest.countDocuments({ status: 'rejected' }),
    MedicineRequest.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $add: ['$deliveryFee', '$commission', '$medicineTotal'] } },
          deliveryFees: { $sum: '$deliveryFee' },
          commissions: { $sum: '$commission' },
        },
      },
    ]),
    MedicineRequest.aggregate([
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]),
    MedicineRequest.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: { year: { $year: '$updatedAt' }, month: { $month: '$updatedAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]),
    MedicineRequest.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$requesterPharmacy', completed: { $sum: 1 } } },
      { $sort: { completed: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'pharmacies', localField: '_id', foreignField: '_id', as: 'pharmacy' } },
      { $unwind: '$pharmacy' },
      { $project: { name: '$pharmacy.pharmacyName', completed: 1 } },
    ]),
    MedicineRequest.aggregate([
      { $match: { status: 'completed', distributor: { $ne: null } } },
      { $group: { _id: '$distributor', completed: { $sum: 1 }, earnings: { $sum: '$deliveryFee' } } },
      { $sort: { completed: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'distributors', localField: '_id', foreignField: '_id', as: 'distributor' } },
      { $unwind: '$distributor' },
      { $lookup: { from: 'users', localField: 'distributor.user', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { name: '$user.name', completed: 1, earnings: 1 } },
    ]),
    Inventory.aggregate([
      { $group: { _id: null, totalItems: { $sum: 1 }, totalQuantity: { $sum: '$quantity' } } },
    ]),
  ]);

  const successRate =
    totalRequests > 0
      ? Math.round(((completedDeliveries / (totalRequests - rejectedRequests || 1)) * 100) * 10) / 10
      : 0;

  const formatMonthly = (data) =>
    data.map((d) => ({
      label: `${monthNames[d._id.month - 1]} ${d._id.year}`,
      count: d.count,
    }));

  return {
    totals: {
      pharmacies: totalPharmacies,
      distributors: totalDistributors,
      medicines: totalMedicines,
      requests: totalRequests,
      activeDeliveries,
      completedDeliveries,
      successRate,
    },
    revenue: revenueAgg[0] || { totalRevenue: 0, deliveryFees: 0, commissions: 0 },
    charts: {
      monthlyRequests: formatMonthly(monthlyRequests),
      monthlyDeliveries: formatMonthly(monthlyDeliveries),
      pharmacyPerformance,
      distributorPerformance,
    },
    inventory: inventoryStats[0] || { totalItems: 0, totalQuantity: 0 },
  };
};

export const getLiveDistributors = async () => {
  return Distributor.find({ availabilityStatus: { $in: ['available', 'busy'] } })
    .populate('user', 'name phone')
    .select('vehicleType currentLocation availabilityStatus totalEarnings');
};
