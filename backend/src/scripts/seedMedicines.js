import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../../.env') });

import Medicine from '../models/Medicine.js';
import Pharmacy from '../models/Pharmacy.js';
import Inventory from '../models/Inventory.js';
import User from '../models/User.js';

const MEDICINES = [
  // Paracetamol
  { name: 'Paracetamol 500mg', manufacturer: 'GSK Pharma', category: 'Analgesic', price: 25, sku: 'PCT500GSK' },
  { name: 'Paracetamol 650mg', manufacturer: 'Sun Pharma', category: 'Analgesic', price: 35, sku: 'PCT650SUN' },

  // Amoxicillin
  { name: 'Amoxicillin 500mg', manufacturer: 'Zydus Cadila', category: 'Antibiotic', price: 85, sku: 'AMX500ZYD' },
  { name: 'Amoxicillin 250mg', manufacturer: 'Alkem Labs', category: 'Antibiotic', price: 48, sku: 'AMX250ALK' },
  { name: 'Amoxicillin 125mg Syrup', manufacturer: 'Ranbaxy Labs', category: 'Antibiotic', price: 55, sku: 'AMX125RAN' },

  // Metformin
  { name: 'Metformin 500mg', manufacturer: 'Torrent Pharma', category: 'Antidiabetic', price: 42, sku: 'MET500TOR' },
  { name: 'Metformin 850mg', manufacturer: 'USV Ltd', category: 'Antidiabetic', price: 58, sku: 'MET850USV' },
  { name: 'Metformin 1000mg', manufacturer: 'USV Ltd', category: 'Antidiabetic', price: 72, sku: 'MET1000USV' },

  // Omeprazole
  { name: 'Omeprazole 20mg', manufacturer: 'AstraZeneca', category: 'Antacid', price: 55, sku: 'OMP20AST' },
  { name: 'Omeprazole 40mg', manufacturer: 'Lupin Ltd', category: 'Antacid', price: 80, sku: 'OMP40LUP' },

  // Azithromycin
  { name: 'Azithromycin 500mg', manufacturer: 'Macleods Pharma', category: 'Antibiotic', price: 120, sku: 'AZI500MAC' },
  { name: 'Azithromycin 250mg', manufacturer: 'Cipla Ltd', category: 'Antibiotic', price: 65, sku: 'AZI250CIP' },

  // Insulin
  { name: 'Insulin Glargine 100IU', manufacturer: 'Novo Nordisk', category: 'Antidiabetic', price: 950, sku: 'INS100NVO' },
  { name: 'Insulin Regular 40IU', manufacturer: 'Eli Lilly', category: 'Antidiabetic', price: 180, sku: 'INS40ELI' },

  // Misc
  { name: 'Pantoprazole 40mg', manufacturer: 'Mankind Pharma', category: 'Antacid', price: 65, sku: 'PAN40MAN' },
  { name: 'Cetirizine 10mg', manufacturer: 'UCB Pharma', category: 'Antihistamine', price: 30, sku: 'CET10UCB' },
  { name: 'Montelukast 10mg', manufacturer: 'Glenmark Pharma', category: 'Antiasthmatic', price: 145, sku: 'MON10GLE' },
  { name: 'Atorvastatin 10mg', manufacturer: 'Pfizer India', category: 'Cardiovascular', price: 110, sku: 'ATO10PFI' },
  { name: 'Amlodipine 5mg', manufacturer: 'Intas Pharma', category: 'Cardiovascular', price: 48, sku: 'AML5INT' },

  // Ibuprofen
  { name: 'Ibuprofen 400mg', manufacturer: 'Abbott India', category: 'Analgesic', price: 38, sku: 'IBU400ABB' },
  { name: 'Ibuprofen 600mg', manufacturer: 'Abbott India', category: 'Analgesic', price: 55, sku: 'IBU600ABB' },
  { name: 'Ibuprofen 200mg', manufacturer: 'Cipla Ltd', category: 'Analgesic', price: 28, sku: 'IBU200CIP' },

  // Steroids
  { name: 'Dexamethasone 0.5mg', manufacturer: 'Samarth Life Sciences', category: 'Corticosteroid', price: 18, sku: 'DEX05SAM' },
  { name: 'Prednisolone 5mg', manufacturer: 'Wyeth India', category: 'Corticosteroid', price: 22, sku: 'PRE5WYE' },

  // Vitamins
  { name: 'Vitamin D3 60000IU', manufacturer: 'Sun Pharma', category: 'Supplement', price: 85, sku: 'VD360SUN' },
  { name: 'Vitamin B12 1500mcg', manufacturer: 'Himalaya Drug Co', category: 'Supplement', price: 120, sku: 'VB12HIM' },
  { name: 'Multivitamin Tablet', manufacturer: 'Pfizer India', category: 'Supplement', price: 210, sku: 'MVP1PFI' },

  // Cough & Cold
  { name: 'Dextromethorphan 10mg', manufacturer: 'Pfizer India', category: 'Cough & Cold', price: 42, sku: 'DEX10PFI' },
  { name: 'Bromhexine 8mg', manufacturer: 'Franco India', category: 'Cough & Cold', price: 35, sku: 'BRO8FRA' },
  { name: 'Salbutamol 2mg', manufacturer: 'GSK Pharma', category: 'Antiasthmatic', price: 30, sku: 'SAL2GSK' },

  // GI
  { name: 'Ranitidine 150mg', manufacturer: 'Elder Pharma', category: 'Antacid', price: 28, sku: 'RAN150ELD' },
  { name: 'Domperidone 10mg', manufacturer: 'Janssen India', category: 'Antacid', price: 45, sku: 'DOM10JAN' },
  { name: 'Rabeprazole 20mg', manufacturer: 'Zydus Cadila', category: 'Antacid', price: 72, sku: 'RAB20ZYD' },

  // Cardiac / BP
  { name: 'Losartan 50mg', manufacturer: 'Merck India', category: 'Cardiovascular', price: 95, sku: 'LOS50MER' },
  { name: 'Telmisartan 40mg', manufacturer: 'Cipla Ltd', category: 'Cardiovascular', price: 88, sku: 'TEL40CIP' },

  // Thyroid
  { name: 'Levothyroxine 50mcg', manufacturer: 'Abbott India', category: 'Thyroid', price: 48, sku: 'LEV50ABB' },
  { name: 'Levothyroxine 100mcg', manufacturer: 'Abbott India', category: 'Thyroid', price: 78, sku: 'LEV100ABB' },

  // Antibiotics
  { name: 'Ciprofloxacin 500mg', manufacturer: 'Wockhardt Ltd', category: 'Antibiotic', price: 75, sku: 'CIP500WOC' },
  { name: 'Doxycycline 100mg', manufacturer: 'Lupin Ltd', category: 'Antibiotic', price: 60, sku: 'DOX100LUP' },
  { name: 'Cefixime 200mg', manufacturer: 'Emcure Pharma', category: 'Antibiotic', price: 140, sku: 'CEF200EMC' },

  // Diabetes
  { name: 'Glimepiride 2mg', manufacturer: 'Sanofi India', category: 'Antidiabetic', price: 55, sku: 'GLI2SAN' },
  { name: 'Sitagliptin 100mg', manufacturer: 'MSD India', category: 'Antidiabetic', price: 320, sku: 'SIT100MSD' },

  // Dermatology
  { name: 'Clotrimazole 1% Cream', manufacturer: 'Bayer India', category: 'Dermatology', price: 90, sku: 'CLO1BAY' },
  { name: 'Fluconazole 150mg', manufacturer: 'Glenmark Pharma', category: 'Antifungal', price: 48, sku: 'FLU150GLE' },
  { name: 'Betamethasone 0.1% Cream', manufacturer: 'GSK Pharma', category: 'Dermatology', price: 72, sku: 'BET01GSK' },

  // Pain / Neurology
  { name: 'Pregabalin 75mg', manufacturer: 'Pfizer India', category: 'Neurology', price: 180, sku: 'PRE75PFI' },
  { name: 'Gabapentin 300mg', manufacturer: 'Sun Pharma', category: 'Neurology', price: 95, sku: 'GAB300SUN' },
  { name: 'Tramadol 50mg', manufacturer: 'Torrent Pharma', category: 'Analgesic', price: 65, sku: 'TRA50TOR' },

  // Paediatric
  { name: 'Calpol Paed Syrup 120ml', manufacturer: 'GSK Pharma', category: 'Paediatric', price: 68, sku: 'CAL120GSK' },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB:', process.env.MONGODB_URI);

    // ── 1. Upsert medicines ──────────────────────────────────────────
    let inserted = 0, skipped = 0;
    const medicineIds = [];

    for (const med of MEDICINES) {
      const existing = await Medicine.findOne({ sku: med.sku });
      if (existing) {
        medicineIds.push(existing._id);
        skipped++;
      } else {
        const created = await Medicine.create({ ...med, status: 'active' });
        medicineIds.push(created._id);
        inserted++;
      }
    }
    console.log(`\n💊 Medicines: ${inserted} inserted, ${skipped} already existed`);

    // ── 2. Find active pharmacies to add inventory to ────────────────
    const pharmacies = await Pharmacy.find({ status: 'active' }).limit(10);
    if (pharmacies.length === 0) {
      console.log('\n⚠️  No active pharmacies found in the database.');
      console.log('   Please register & approve at least one pharmacy first, then re-run this script.');
      await mongoose.disconnect();
      return;
    }
    console.log(`\n🏥 Found ${pharmacies.length} active pharmacy/pharmacies`);

    // ── 3. Add all medicines to each pharmacy's inventory ────────────
    let invInserted = 0, invSkipped = 0;
    const quantities = [50, 100, 200, 150, 80, 300, 120, 60, 90, 250];

    for (const pharmacy of pharmacies) {
      for (let i = 0; i < medicineIds.length; i++) {
        const medId = medicineIds[i];
        const qty = quantities[i % quantities.length];
        const existing = await Inventory.findOne({ pharmacy: pharmacy._id, medicine: medId });
        if (existing) {
          invSkipped++;
        } else {
          await Inventory.create({ pharmacy: pharmacy._id, medicine: medId, quantity: qty });
          invInserted++;
        }
      }
      console.log(`   ✔ ${pharmacy.pharmacyName}: ${MEDICINES.length} medicines stocked`);
    }

    console.log(`\n📦 Inventory: ${invInserted} records inserted, ${invSkipped} already existed`);
    console.log('\n🎉 Seed complete! You can now search medicines and place real orders.\n');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
