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
  // Pain & Fever
  { name: 'Paracetamol 500mg', manufacturer: 'Cipla', category: 'Analgesic', price: 25, sku: 'PAR500' },
  { name: 'Paracetamol 650mg', manufacturer: 'Sun Pharma', category: 'Analgesic', price: 30, sku: 'PAR650' },
  { name: 'Ibuprofen 400mg', manufacturer: 'Abbott', category: 'Analgesic', price: 40, sku: 'IBU400' },
  { name: 'Diclofenac 50mg', manufacturer: 'Dr Reddy', category: 'Analgesic', price: 45, sku: 'DIC50' },
  { name: 'Aspirin 75mg', manufacturer: 'Bayer', category: 'Analgesic', price: 35, sku: 'ASP75' },
  
  // Antibiotics
  { name: 'Amoxicillin 250mg', manufacturer: 'Sun Pharma', category: 'Antibiotic', price: 85, sku: 'AMX250' },
  { name: 'Amoxicillin 500mg', manufacturer: 'Cipla', category: 'Antibiotic', price: 120, sku: 'AMX500' },
  { name: 'Azithromycin 500mg', manufacturer: 'Zydus', category: 'Antibiotic', price: 120, sku: 'AZI500' },
  { name: 'Ciprofloxacin 500mg', manufacturer: 'Alkem', category: 'Antibiotic', price: 95, sku: 'CIP500' },
  { name: 'Doxycycline 100mg', manufacturer: 'Torrent', category: 'Antibiotic', price: 75, sku: 'DOX100' },
  
  // Allergy & Cold
  { name: 'Cetirizine 10mg', manufacturer: 'Dr Reddy', category: 'Antihistamine', price: 35, sku: 'CET10' },
  { name: 'Levocetirizine 5mg', manufacturer: 'Sun Pharma', category: 'Antihistamine', price: 45, sku: 'LEV5' },
  { name: 'Fexofenadine 120mg', manufacturer: 'Cipla', category: 'Antihistamine', price: 55, sku: 'FEX120' },
  { name: 'Montelukast 10mg', manufacturer: 'Zydus', category: 'Antihistamine', price: 65, sku: 'MON10' },
  
  // Gastric & Digestive
  { name: 'Omeprazole 20mg', manufacturer: 'Torrent', category: 'Antacid', price: 55, sku: 'OME20' },
  { name: 'Pantoprazole 40mg', manufacturer: 'Alkem', category: 'Antacid', price: 65, sku: 'PAN40' },
  { name: 'Ranitidine 150mg', manufacturer: 'Cipla', category: 'Antacid', price: 40, sku: 'RAN150' },
  { name: 'Domperidone 10mg', manufacturer: 'Sun Pharma', category: 'Antacid', price: 35, sku: 'DOM10' },
  
  // Diabetes
  { name: 'Metformin 500mg', manufacturer: 'Lupin', category: 'Antidiabetic', price: 45, sku: 'MET500' },
  { name: 'Metformin 850mg', manufacturer: 'Sun Pharma', category: 'Antidiabetic', price: 55, sku: 'MET850' },
  { name: 'Glimepiride 2mg', manufacturer: 'Dr Reddy', category: 'Antidiabetic', price: 75, sku: 'GLI2' },
  { name: 'Sitagliptin 50mg', manufacturer: 'Zydus', category: 'Antidiabetic', price: 120, sku: 'SIT50' },
  
  // Cardiovascular
  { name: 'Amlodipine 5mg', manufacturer: 'Cipla', category: 'Cardiovascular', price: 50, sku: 'AML5' },
  { name: 'Atenolol 50mg', manufacturer: 'Sun Pharma', category: 'Cardiovascular', price: 45, sku: 'ATE50' },
  { name: 'Losartan 50mg', manufacturer: 'Torrent', category: 'Cardiovascular', price: 65, sku: 'LOS50' },
  { name: 'Enalapril 5mg', manufacturer: 'Alkem', category: 'Cardiovascular', price: 55, sku: 'ENA5' },
  
  // Vitamins & Supplements
  { name: 'Vitamin D3 60000 IU', manufacturer: 'Zydus', category: 'Vitamin', price: 85, sku: 'VID3' },
  { name: 'Calcium + D3', manufacturer: 'Cipla', category: 'Vitamin', price: 95, sku: 'CALD3' },
  { name: 'Multivitamin', manufacturer: 'Sun Pharma', category: 'Vitamin', price: 120, sku: 'MUL' },
  { name: 'Iron + Folic Acid', manufacturer: 'Dr Reddy', category: 'Vitamin', price: 75, sku: 'IRN' },
  
  // Skin Care
  { name: 'Clindamycin 1%', manufacturer: 'Torrent', category: 'Dermatology', price: 145, sku: 'CLI1' },
  { name: 'Mometasone 0.1%', manufacturer: 'Cipla', category: 'Dermatology', price: 125, sku: 'MOM01' },
  { name: 'Ketoconazole 2%', manufacturer: 'Alkem', category: 'Dermatology', price: 135, sku: 'KET2' },
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
    { name: 'Wellness Forever', email: 'pharmacy4@medzu.com', lat: 12.9141, lng: 77.6101, address: 'JP Nagar, Bangalore' },
    { name: 'Apollo Pharmacy', email: 'pharmacy5@medzu.com', lat: 12.9270, lng: 77.5820, address: 'BTM Layout, Bangalore' },
    { name: 'MedPlus Healthcare', email: 'pharmacy6@medzu.com', lat: 12.9700, lng: 77.5600, address: 'Vijayanagar, Bangalore' },
    { name: 'Fortis Medical Store', email: 'pharmacy7@medzu.com', lat: 13.0129, lng: 77.5600, address: 'Yeshwanthpur, Bangalore' },
    { name: 'Noble Medicals', email: 'pharmacy8@medzu.com', lat: 12.9250, lng: 77.5850, address: 'Banashankari, Bangalore' },
    { name: 'Star Plus Pharmacy', email: 'pharmacy9@medzu.com', lat: 12.9800, lng: 77.6050, address: 'Frazer Town, Bangalore' },
    { name: 'HealthFirst Pharmacy', email: 'pharmacy10@medzu.com', lat: 12.9500, lng: 77.6500, address: 'HSR Layout, Bangalore' },
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
    { name: 'Raj Kumar', email: 'distributor1@medzu.com', vehicle: 'bike', vehicleNo: 'KA01AB1234', lat: 12.9698, lng: 77.5986, status: 'available' },
    { name: 'Suresh Patel', email: 'distributor2@medzu.com', vehicle: 'scooter', vehicleNo: 'KA02CD5678', lat: 12.9400, lng: 77.6200, status: 'available' },
    { name: 'Amit Singh', email: 'distributor3@medzu.com', vehicle: 'bike', vehicleNo: 'KA03EF9012', lat: 12.9800, lng: 77.5900, status: 'busy' },
    { name: 'Priya Sharma', email: 'distributor4@medzu.com', vehicle: 'scooter', vehicleNo: 'KA04GH3456', lat: 12.9200, lng: 77.6100, status: 'available' },
    { name: 'Vikram Reddy', email: 'distributor5@medzu.com', vehicle: 'bike', vehicleNo: 'KA05IJ7890', lat: 12.9600, lng: 77.5700, status: 'offline' },
    { name: 'Neha Gupta', email: 'distributor6@medzu.com', vehicle: 'scooter', vehicleNo: 'KA06KL2345', lat: 12.9300, lng: 77.6400, status: 'available' },
    { name: 'Rahul Menon', email: 'distributor7@medzu.com', vehicle: 'bike', vehicleNo: 'KA07MN6789', lat: 12.9900, lng: 77.5500, status: 'busy' },
    { name: 'Anjali Desai', email: 'distributor8@medzu.com', vehicle: 'scooter', vehicleNo: 'KA08OP0123', lat: 12.9100, lng: 77.6300, status: 'available' },
  ];

  const distributors = [];
  for (const d of distributorUsers) {
    const user = await User.create({
      name: d.name,
      email: d.email,
      password: 'dist123',
      role: 'distributor',
      phone: '9123456789',
      vehicleNo: d.vehicleNo,
      status: 'active',
    });
    const distributor = await Distributor.create({
      user: user._id,
      vehicleType: d.vehicle,
      availabilityStatus: d.status,
      currentLocation: { type: 'Point', coordinates: [d.lng, d.lat] },
      totalEarnings: Math.floor(Math.random() * 5000),
    });
    distributors.push(distributor);
  }

  const createdMedicines = await Medicine.insertMany(medicines);

  // Enhanced inventory data - each pharmacy has different stock levels
  for (let i = 0; i < pharmacies.length; i++) {
    for (let j = 0; j < createdMedicines.length; j++) {
      // More realistic inventory distribution
      const baseQty = 20 + Math.floor(Math.random() * 150);
      const qty = (i + j) % 3 === 0 ? 0 : baseQty; // Some items out of stock
      await Inventory.create({
        pharmacy: pharmacies[i]._id,
        medicine: createdMedicines[j]._id,
        quantity: qty,
      });
    }
  }

  // Seeding comprehensive requests for all status stages - Swiggy-like flow
  const requests = [];

  // PENDING REQUESTS (Incoming requests for suppliers to accept)
  for (let i = 0; i < 5; i++) {
    const requesterIdx = i % pharmacies.length;
    const supplierIdx = (i + 2) % pharmacies.length;
    const medicineIdx = i % createdMedicines.length;
    const qty = 5 + Math.floor(Math.random() * 20);
    
    const req = await MedicineRequest.create({
      requesterPharmacy: pharmacies[requesterIdx]._id,
      supplierPharmacy: pharmacies[supplierIdx]._id,
      medicine: createdMedicines[medicineIdx]._id,
      quantity: qty,
      medicineTotal: createdMedicines[medicineIdx].price * qty,
      status: 'pending',
    });
    requests.push({ req, type: 'pending', supplierIdx, requesterIdx });
  }

  // ACCEPTED REQUESTS (Waiting for distributor assignment)
  for (let i = 0; i < 3; i++) {
    const requesterIdx = (i + 3) % pharmacies.length;
    const supplierIdx = (i + 5) % pharmacies.length;
    const medicineIdx = (i + 7) % createdMedicines.length;
    const qty = 8 + Math.floor(Math.random() * 15);
    
    const req = await MedicineRequest.create({
      requesterPharmacy: pharmacies[requesterIdx]._id,
      supplierPharmacy: pharmacies[supplierIdx]._id,
      medicine: createdMedicines[medicineIdx]._id,
      quantity: qty,
      medicineTotal: createdMedicines[medicineIdx].price * qty,
      status: 'accepted',
    });
    requests.push({ req, type: 'accepted', supplierIdx, requesterIdx });
  }

  // DISTRIBUTOR ASSIGNED (Rider notified, waiting for acceptance)
  for (let i = 0; i < 3; i++) {
    const requesterIdx = (i + 1) % pharmacies.length;
    const supplierIdx = (i + 4) % pharmacies.length;
    const distributorIdx = i % distributors.length;
    const medicineIdx = (i + 10) % createdMedicines.length;
    const qty = 10 + Math.floor(Math.random() * 20);
    
    const req = await MedicineRequest.create({
      requesterPharmacy: pharmacies[requesterIdx]._id,
      supplierPharmacy: pharmacies[supplierIdx]._id,
      distributor: distributors[distributorIdx]._id,
      medicine: createdMedicines[medicineIdx]._id,
      quantity: qty,
      medicineTotal: createdMedicines[medicineIdx].price * qty,
      status: 'distributor_assigned',
      deliveryFee: 50,
    });
    requests.push({ req, type: 'distributor_assigned', supplierIdx, requesterIdx, distributorIdx });
  }

  // PICKUP STARTED (Rider heading to supplier)
  for (let i = 0; i < 2; i++) {
    const requesterIdx = (i + 2) % pharmacies.length;
    const supplierIdx = (i + 6) % pharmacies.length;
    const distributorIdx = (i + 2) % distributors.length;
    const medicineIdx = (i + 12) % createdMedicines.length;
    const qty = 12 + Math.floor(Math.random() * 18);
    
    const req = await MedicineRequest.create({
      requesterPharmacy: pharmacies[requesterIdx]._id,
      supplierPharmacy: pharmacies[supplierIdx]._id,
      distributor: distributors[distributorIdx]._id,
      medicine: createdMedicines[medicineIdx]._id,
      quantity: qty,
      medicineTotal: createdMedicines[medicineIdx].price * qty,
      status: 'pickup_started',
      deliveryFee: 50,
      locationHistory: [
        { coordinates: [distributors[distributorIdx].currentLocation.coordinates[0], distributors[distributorIdx].currentLocation.coordinates[1]], timestamp: new Date() }
      ]
    });
    requests.push({ req, type: 'pickup_started', supplierIdx, requesterIdx, distributorIdx });
  }

  // PICKED UP (Rider has medicine, heading to buyer)
  for (let i = 0; i < 2; i++) {
    const requesterIdx = (i + 5) % pharmacies.length;
    const supplierIdx = (i + 7) % pharmacies.length;
    const distributorIdx = (i + 3) % distributors.length;
    const medicineIdx = (i + 15) % createdMedicines.length;
    const qty = 15 + Math.floor(Math.random() * 25);
    
    const req = await MedicineRequest.create({
      requesterPharmacy: pharmacies[requesterIdx]._id,
      supplierPharmacy: pharmacies[supplierIdx]._id,
      distributor: distributors[distributorIdx]._id,
      medicine: createdMedicines[medicineIdx]._id,
      quantity: qty,
      medicineTotal: createdMedicines[medicineIdx].price * qty,
      status: 'picked_up',
      deliveryFee: 50,
      locationHistory: [
        { coordinates: [pharmacies[supplierIdx].location.coordinates[0], pharmacies[supplierIdx].location.coordinates[1]], timestamp: new Date(Date.now() - 10 * 60000) },
        { coordinates: [77.6000, 12.9700], timestamp: new Date() }
      ]
    });
    requests.push({ req, type: 'picked_up', supplierIdx, requesterIdx, distributorIdx });
  }

  // EN ROUTE (Rider on the way to buyer - LIVE TRACKING)
  for (let i = 0; i < 3; i++) {
    const requesterIdx = (i + 4) % pharmacies.length;
    const supplierIdx = (i + 8) % pharmacies.length;
    const distributorIdx = (i + 1) % distributors.length;
    const medicineIdx = (i + 18) % createdMedicines.length;
    const qty = 8 + Math.floor(Math.random() * 22);
    
    const req = await MedicineRequest.create({
      requesterPharmacy: pharmacies[requesterIdx]._id,
      supplierPharmacy: pharmacies[supplierIdx]._id,
      distributor: distributors[distributorIdx]._id,
      medicine: createdMedicines[medicineIdx]._id,
      quantity: qty,
      medicineTotal: createdMedicines[medicineIdx].price * qty,
      status: 'en_route',
      deliveryFee: 50,
      locationHistory: [
        { coordinates: [pharmacies[supplierIdx].location.coordinates[0], pharmacies[supplierIdx].location.coordinates[1]], timestamp: new Date(Date.now() - 25 * 60000) },
        { coordinates: [77.6200, 12.9750], timestamp: new Date(Date.now() - 15 * 60000) },
        { coordinates: [77.6000, 12.9730], timestamp: new Date(Date.now() - 5 * 60000) },
        { coordinates: [77.5900, 12.9710], timestamp: new Date() }
      ]
    });
    requests.push({ req, type: 'en_route', supplierIdx, requesterIdx, distributorIdx });
  }

  // DELIVERED (Completed deliveries)
  for (let i = 0; i < 4; i++) {
    const requesterIdx = (i + 6) % pharmacies.length;
    const supplierIdx = (i + 9) % pharmacies.length;
    const distributorIdx = (i + 4) % distributors.length;
    const medicineIdx = (i + 20) % createdMedicines.length;
    const qty = 10 + Math.floor(Math.random() * 30);
    const medicineTotal = createdMedicines[medicineIdx].price * qty;
    
    const req = await MedicineRequest.create({
      requesterPharmacy: pharmacies[requesterIdx]._id,
      supplierPharmacy: pharmacies[supplierIdx]._id,
      distributor: distributors[distributorIdx]._id,
      medicine: createdMedicines[medicineIdx]._id,
      quantity: qty,
      medicineTotal: medicineTotal,
      status: 'completed',
      deliveryFee: 50,
      commission: (medicineTotal * 5) / 100,
    });
    
    // Update distributor earnings
    await Distributor.findByIdAndUpdate(distributors[distributorIdx]._id, {
      $inc: { totalEarnings: 50 }
    });
    
    requests.push({ req, type: 'completed', supplierIdx, requesterIdx, distributorIdx });
  }

  // REJECTED REQUESTS
  for (let i = 0; i < 2; i++) {
    const requesterIdx = (i + 7) % pharmacies.length;
    const supplierIdx = (i + 3) % pharmacies.length;
    const medicineIdx = (i + 25) % createdMedicines.length;
    const qty = 5 + Math.floor(Math.random() * 10);
    
    const req = await MedicineRequest.create({
      requesterPharmacy: pharmacies[requesterIdx]._id,
      supplierPharmacy: pharmacies[supplierIdx]._id,
      medicine: createdMedicines[medicineIdx]._id,
      quantity: qty,
      medicineTotal: createdMedicines[medicineIdx].price * qty,
      status: 'rejected',
    });
    requests.push({ req, type: 'rejected', supplierIdx, requesterIdx });
  }

  // Comprehensive notifications for all users based on requests
  const notifications = [];
  
  requests.forEach(({ req, type, supplierIdx, requesterIdx, distributorIdx }) => {
    const supplierUser = pharmacies[supplierIdx].user;
    const requesterUser = pharmacies[requesterIdx].user;
    const medicineName = createdMedicines.find(m => m._id.toString() === req.medicine.toString())?.name || 'Medicine';
    const supplierName = pharmacies[supplierIdx].pharmacyName;
    const requesterName = pharmacies[requesterIdx].pharmacyName;
    
    switch (type) {
      case 'pending':
        notifications.push({
          user: supplierUser,
          title: 'New Medicine Request',
          message: `You have a new request for ${medicineName} (qty: ${req.quantity}) from ${requesterName}`,
          type: 'request_received',
          readStatus: false,
          relatedRequest: req._id,
        });
        break;
        
      case 'accepted':
        notifications.push({
          user: requesterUser,
          title: 'Request Accepted',
          message: `${supplierName} has accepted your request for ${medicineName}`,
          type: 'request_accepted',
          readStatus: false,
          relatedRequest: req._id,
        });
        break;
        
      case 'distributor_assigned':
        const distName = distributors[distributorIdx]?.user?.name || 'Distributor';
        notifications.push({
          user: requesterUser,
          title: 'Distributor Assigned',
          message: `${distName} has been assigned to your ${medicineName} delivery`,
          type: 'distributor_assigned',
          readStatus: false,
          relatedRequest: req._id,
        });
        if (distributors[distributorIdx]) {
          notifications.push({
            user: distributors[distributorIdx].user,
            title: 'New Delivery Assignment',
            message: `You have a new delivery assignment from ${supplierName} to ${requesterName}`,
            type: 'distributor_assigned',
            readStatus: false,
            relatedRequest: req._id,
          });
        }
        break;
        
      case 'pickup_started':
        const pickupDist = distributors[distributorIdx]?.user?.name || 'Distributor';
        notifications.push({
          user: supplierUser,
          title: 'Pickup Started',
          message: `${pickupDist} is heading to your location for ${medicineName} pickup`,
          type: 'pickup_started',
          readStatus: false,
          relatedRequest: req._id,
        });
        break;
        
      case 'picked_up':
        const pickedDist = distributors[distributorIdx]?.user?.name || 'Distributor';
        notifications.push({
          user: requesterUser,
          title: 'Medicine Picked Up',
          message: `${pickedDist} has picked up ${medicineName} and is heading to you`,
          type: 'medicine_picked',
          readStatus: false,
          relatedRequest: req._id,
        });
        break;
        
      case 'en_route':
        const enRouteDist = distributors[distributorIdx]?.user?.name || 'Distributor';
        notifications.push({
          user: requesterUser,
          title: 'Delivery En Route',
          message: `${enRouteDist} is on the way with your ${medicineName} order`,
          type: 'delivery_started',
          readStatus: false,
          relatedRequest: req._id,
        });
        break;
        
      case 'completed':
        const completedDist = distributors[distributorIdx]?.user?.name || 'Distributor';
        notifications.push({
          user: requesterUser,
          title: 'Delivery Completed',
          message: `Your ${medicineName} order has been delivered successfully`,
          type: 'delivery_completed',
          readStatus: true,
          relatedRequest: req._id,
        });
        notifications.push({
          user: supplierUser,
          title: 'Delivery Completed',
          message: `${medicineName} has been delivered to ${requesterName}`,
          type: 'delivery_completed',
          readStatus: true,
          relatedRequest: req._id,
        });
        break;
        
      case 'rejected':
        notifications.push({
          user: requesterUser,
          title: 'Request Rejected',
          message: `${supplierName} has rejected your request for ${medicineName}`,
          type: 'request_rejected',
          readStatus: false,
          relatedRequest: req._id,
        });
        break;
    }
  });
  
  await Notification.insertMany(notifications);

  // Add admin-specific notifications for system overview
  const adminNotifications = [
    {
      user: admin._id,
      title: 'System Update',
      message: 'MedZu platform has been successfully updated with enhanced features',
      type: 'general',
      readStatus: false,
    },
    {
      user: admin._id,
      title: 'New Pharmacy Registered',
      message: 'HealthFirst Pharmacy has joined the platform',
      type: 'general',
      readStatus: false,
    },
    {
      user: admin._id,
      title: 'Distributor Activity',
      message: '8 distributors are now active on the platform',
      type: 'general',
      readStatus: true,
    },
    {
      user: admin._id,
      title: 'Medicine Catalog Updated',
      message: '33 medicines are now available across all pharmacies',
      type: 'general',
      readStatus: true,
    },
    {
      user: admin._id,
      title: 'Request Volume Alert',
      message: '24 medicine requests are currently in the system',
      type: 'general',
      readStatus: false,
    },
  ];

  await Notification.insertMany(adminNotifications);

  console.log('✅ Seed completed successfully!');
  console.log('📊 Data Summary:');
  console.log(`   - Admin: 1 user`);
  console.log(`   - Pharmacies: ${pharmacies.length} users`);
  console.log(`   - Distributors: ${distributors.length} users`);
  console.log(`   - Medicines: ${createdMedicines.length} items`);
  console.log(`   - Requests: ${requests.length} (all status stages)`);
  console.log(`   - Notifications: ${notifications.length}`);
  console.log('');
  console.log('🔐 Demo Credentials:');
  console.log('   Admin: admin@medzu.com / admin123');
  console.log('   Pharmacies: pharmacy1@medzu.com to pharmacy10@medzu.com / pharmacy123');
  console.log('   Distributors: distributor1@medzu.com to distributor8@medzu.com / dist123');

  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
