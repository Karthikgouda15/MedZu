import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Pharmacy from '../models/Pharmacy.js';
import Distributor from '../models/Distributor.js';
import Medicine from '../models/Medicine.js';
import Inventory from '../models/Inventory.js';
import MedicineRequest from '../models/MedicineRequest.js';
import Notification from '../models/Notification.js';

const medicines = [
  { name: 'Paracetamol 500mg', manufacturer: 'Cipla', category: 'Analgesic', price: 25, sku: 'PAR500' },
  { name: 'Amoxicillin 250mg', manufacturer: 'Sun Pharma', category: 'Antibiotic', price: 85, sku: 'AMX250' },
  { name: 'Cetirizine 10mg', manufacturer: 'Dr Reddy', category: 'Antihistamine', price: 35, sku: 'CET10' },
  { name: 'Omeprazole 20mg', manufacturer: 'Torrent', category: 'Antacid', price: 55, sku: 'OME20' },
  { name: 'Metformin 500mg', manufacturer: 'Lupin', category: 'Antidiabetic', price: 45, sku: 'MET500' },
  { name: 'Azithromycin 500mg', manufacturer: 'Zydus', category: 'Antibiotic', price: 120, sku: 'AZI500' },
  { name: 'Ibuprofen 400mg', manufacturer: 'Abbott', category: 'Analgesic', price: 40, sku: 'IBU400' },
  { name: 'Pantoprazole 40mg', manufacturer: 'Alkem', category: 'Antacid', price: 65, sku: 'PAN40' },
];

const seed = async () => {
  await connectDB();

  await mongoose.connection.dropDatabase();

  await Promise.all([
    User.deleteMany({}),
    Pharmacy.deleteMany({}),
    Distributor.deleteMany({}),
    Medicine.deleteMany({}),
    Inventory.deleteMany({}),
    MedicineRequest.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  const admin = await User.create({
    name: 'Super Admin',
    email: 'admin@medzu.com',
    password: 'admin123',
    role: 'admin',
    phone: '9999999999',
    status: 'active',
  });

  const pharmacyData = [
    { name: 'City Care Pharmacy', email: 'pharmacy1@medzu.com', lat: 12.9716, lng: 77.5946, address: 'MG Road, Bangalore' },
    { name: 'Health Plus Pharmacy', email: 'pharmacy2@medzu.com', lat: 12.9352, lng: 77.6245, address: 'Koramangala, Bangalore' },
    { name: 'MediQuick Pharmacy', email: 'pharmacy3@medzu.com', lat: 12.9784, lng: 77.6408, address: 'Indiranagar, Bangalore' },
  ];

  const pharmacies = [];
  for (const p of pharmacyData) {
    const user = await User.create({
      name: p.name,
      email: p.email,
      password: 'pharmacy123',
      role: 'pharmacy',
      phone: '9876543210',
      status: 'active',
    });
    const pharmacy = await Pharmacy.create({
      user: user._id,
      pharmacyName: p.name,
      address: p.address,
      latitude: p.lat,
      longitude: p.lng,
      location: { type: 'Point', coordinates: [p.lng, p.lat] },
      licenseNumber: `LIC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      status: 'active',
    });
    pharmacies.push(pharmacy);
  }

  const distributorUsers = [
    { name: 'Raj Kumar', email: 'distributor1@medzu.com', vehicle: 'bike', lat: 12.9698, lng: 77.5986 },
    { name: 'Suresh Patel', email: 'distributor2@medzu.com', vehicle: 'scooter', lat: 12.9400, lng: 77.6200 },
  ];

  const distributors = [];
  for (const d of distributorUsers) {
    const user = await User.create({
      name: d.name,
      email: d.email,
      password: 'dist123',
      role: 'distributor',
      phone: '9123456789',
      status: 'active',
    });
    const distributor = await Distributor.create({
      user: user._id,
      vehicleType: d.vehicle,
      availabilityStatus: 'available',
      currentLocation: { type: 'Point', coordinates: [d.lng, d.lat] },
    });
    distributors.push(distributor);
  }

  const createdMedicines = await Medicine.insertMany(medicines);

  for (let i = 0; i < pharmacies.length; i++) {
    for (let j = 0; j < createdMedicines.length; j++) {
      const qty = j === i ? 5 : 50 + Math.floor(Math.random() * 100);
      await Inventory.create({
        pharmacy: pharmacies[i]._id,
        medicine: createdMedicines[j]._id,
        quantity: qty,
      });
    }
  }

  // Seeding dummy requests for incoming, outgoing, live tracking and order history modules
  // Request A (Incoming for Pharmacy 1, Outgoing for Pharmacy 2): Pending
  const reqA = await MedicineRequest.create({
    requesterPharmacy: pharmacies[1]._id,
    supplierPharmacy: pharmacies[0]._id,
    medicine: createdMedicines[0]._id, // Paracetamol 500mg
    quantity: 5,
    medicineTotal: createdMedicines[0].price * 5,
    status: 'pending',
  });

  // Request B (Incoming for Pharmacy 2, Outgoing for Pharmacy 1): Pending
  const reqB = await MedicineRequest.create({
    requesterPharmacy: pharmacies[0]._id,
    supplierPharmacy: pharmacies[1]._id,
    medicine: createdMedicines[1]._id, // Amoxicillin 250mg
    quantity: 10,
    medicineTotal: createdMedicines[1].price * 10,
    status: 'pending',
  });

  // Request C (Live Tracking - Outgoing for Pharmacy 1, Incoming for Pharmacy 3): en_route
  const reqC = await MedicineRequest.create({
    requesterPharmacy: pharmacies[0]._id,
    supplierPharmacy: pharmacies[2]._id,
    distributor: distributors[0]._id, // Raj Kumar
    medicine: createdMedicines[2]._id, // Cetirizine 10mg
    quantity: 8,
    medicineTotal: createdMedicines[2].price * 8,
    status: 'en_route',
    deliveryFee: 50,
    locationHistory: [
      { coordinates: [77.6408, 12.9784], timestamp: new Date(Date.now() - 30 * 60000) },
      { coordinates: [77.6200, 12.9750], timestamp: new Date(Date.now() - 15 * 60000) },
      { coordinates: [77.6000, 12.9730], timestamp: new Date() }
    ]
  });

  // Request D (Live Tracking - Incoming for Pharmacy 1, Outgoing for Pharmacy 2): pickup_started
  const reqD = await MedicineRequest.create({
    requesterPharmacy: pharmacies[1]._id,
    supplierPharmacy: pharmacies[0]._id,
    distributor: distributors[1]._id, // Suresh Patel
    medicine: createdMedicines[4]._id, // Metformin 500mg
    quantity: 15,
    medicineTotal: createdMedicines[4].price * 15,
    status: 'pickup_started',
    deliveryFee: 50,
    locationHistory: [
      { coordinates: [77.6200, 12.9400], timestamp: new Date() }
    ]
  });

  // Request E (Order History - Outgoing for Pharmacy 1, Incoming for Pharmacy 2): completed
  const reqE = await MedicineRequest.create({
    requesterPharmacy: pharmacies[0]._id,
    supplierPharmacy: pharmacies[1]._id,
    distributor: distributors[1]._id,
    medicine: createdMedicines[3]._id, // Omeprazole 20mg
    quantity: 20,
    medicineTotal: createdMedicines[3].price * 20,
    status: 'completed',
    deliveryFee: 50,
    commission: (createdMedicines[3].price * 20 * 5) / 100,
  });

  // Request F (Order History - Outgoing for Pharmacy 3, Incoming for Pharmacy 1): rejected
  const reqF = await MedicineRequest.create({
    requesterPharmacy: pharmacies[2]._id,
    supplierPharmacy: pharmacies[0]._id,
    medicine: createdMedicines[5]._id, // Azithromycin 500mg
    quantity: 3,
    medicineTotal: createdMedicines[5].price * 3,
    status: 'rejected',
  });

  // Seeding dummy notifications for all pharmacies
  await Notification.create([
    {
      user: pharmacies[0].user,
      title: 'New Medicine Request',
      message: `You have a new request for Paracetamol 500mg (qty: 5) from Health Plus Pharmacy`,
      type: 'request_received',
      readStatus: false,
      relatedRequest: reqA._id,
    },
    {
      user: pharmacies[0].user,
      title: 'Delivery Completed',
      message: `Medicine Omeprazole 20mg has been delivered`,
      type: 'delivery_completed',
      readStatus: true,
      relatedRequest: reqE._id,
    },
    {
      user: pharmacies[0].user,
      title: 'Distributor Assigned',
      message: `A distributor has been assigned to your request for Cetirizine 10mg`,
      type: 'distributor_assigned',
      readStatus: false,
      relatedRequest: reqC._id,
    },
    {
      user: pharmacies[1].user,
      title: 'New Medicine Request',
      message: `You have a new request for Amoxicillin 250mg (qty: 10) from City Care Pharmacy`,
      type: 'request_received',
      readStatus: false,
      relatedRequest: reqB._id,
    },
    {
      user: pharmacies[1].user,
      title: 'Pickup Started',
      message: `Distributor Suresh Patel is heading to City Care Pharmacy for Metformin 500mg`,
      type: 'pickup_started',
      readStatus: false,
      relatedRequest: reqD._id,
    },
    {
      user: pharmacies[2].user,
      title: 'Request Rejected',
      message: `Your request for Azithromycin 500mg was rejected by City Care Pharmacy`,
      type: 'request_rejected',
      readStatus: false,
      relatedRequest: reqF._id,
    }
  ]);

  console.log('Seed completed!');
  console.log('Admin: admin@medzu.com / admin123');
  console.log('Pharmacy: pharmacy1@medzu.com / pharmacy123');
  console.log('Distributor: distributor1@medzu.com / dist123');

  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
