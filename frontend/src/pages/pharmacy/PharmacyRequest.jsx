import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search, MapPin, Package, TrendingDown, SlidersHorizontal,
  Truck, Building2, X, Plus, Minus, ArrowRight,
  Loader2, AlertCircle, Sparkles, Clock, WifiOff, Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../contexts/SocketContext';
import api from '../../services/api';

// ─── Dummy data (shown when API has no results / dev mode) ─────
const DUMMY_SUPPLIERS = [
  // ── Paracetamol cluster ──
  {
    userId: 'd1', role: 'Distributor', companyName: 'Apollo MedSupply Pvt Ltd',
    distance: 820,
    product: { _id: 'p1', name: 'Paracetamol 500mg', manufacturer: 'GSK Pharma', mrp: 25 },
    inventory: { inStockQty: 480, sellingPrice: 18 },
  },
  {
    userId: 'd2', role: 'Pharmacy', companyName: 'MedPlus Healthcare',
    distance: 1400,
    product: { _id: 'p2', name: 'Paracetamol 500mg', manufacturer: 'Cipla Ltd', mrp: 28 },
    inventory: { inStockQty: 7, sellingPrice: 21 },
  },
  {
    userId: 'd3', role: 'Distributor', companyName: 'Sun Pharma Distributors',
    distance: 2100,
    product: { _id: 'p3', name: 'Paracetamol 650mg', manufacturer: 'Sun Pharma', mrp: 35 },
    inventory: { inStockQty: 950, sellingPrice: 24 },
  },
  {
    userId: 'd4', role: 'Pharmacy', companyName: 'Fortis Medical Store',
    distance: 3500,
    product: { _id: 'p4', name: 'Paracetamol 500mg', manufacturer: "Dr. Reddy's", mrp: 26 },
    inventory: { inStockQty: 0, sellingPrice: 20 },
  },
  {
    userId: 'd5', role: 'Distributor', companyName: 'Cipla Pharma Hub',
    distance: 4200,
    product: { _id: 'p5', name: 'Paracetamol 500mg', manufacturer: 'Cipla Ltd', mrp: 25 },
    inventory: { inStockQty: 1200, sellingPrice: 15 },
  },
  {
    userId: 'd6', role: 'Pharmacy', companyName: 'HealthFirst Pharmacy',
    distance: 5800,
    product: { _id: 'p6', name: 'Paracetamol 500mg', manufacturer: 'Mankind Pharma', mrp: 22 },
    inventory: { inStockQty: 340, sellingPrice: 17 },
  },

  // ── Amoxicillin cluster ──
  {
    userId: 'd7', role: 'Distributor', companyName: 'Zydus MedHub',
    distance: 1100,
    product: { _id: 'p7', name: 'Amoxicillin 500mg', manufacturer: 'Zydus Cadila', mrp: 85 },
    inventory: { inStockQty: 620, sellingPrice: 62 },
  },
  {
    userId: 'd8', role: 'Pharmacy', companyName: 'Wellness Forever Rx',
    distance: 2600,
    product: { _id: 'p8', name: 'Amoxicillin 250mg', manufacturer: 'Alkem Labs', mrp: 48 },
    inventory: { inStockQty: 4, sellingPrice: 38 },
  },
  {
    userId: 'd9', role: 'Distributor', companyName: 'Alkem Wholesale Depot',
    distance: 5100,
    product: { _id: 'p9', name: 'Amoxicillin 500mg', manufacturer: 'Alkem Labs', mrp: 90 },
    inventory: { inStockQty: 0, sellingPrice: 70 },
  },

  // ── Metformin cluster ──
  {
    userId: 'd10', role: 'Distributor', companyName: 'Torrent Pharma Dist.',
    distance: 980,
    product: { _id: 'p10', name: 'Metformin 500mg', manufacturer: 'Torrent Pharma', mrp: 42 },
    inventory: { inStockQty: 2400, sellingPrice: 30 },
  },
  {
    userId: 'd11', role: 'Pharmacy', companyName: 'Noble Medicals',
    distance: 3200,
    product: { _id: 'p11', name: 'Metformin 850mg', manufacturer: 'USV Ltd', mrp: 58 },
    inventory: { inStockQty: 180, sellingPrice: 44 },
  },
  {
    userId: 'd12', role: 'Distributor', companyName: 'USV Distribution Centre',
    distance: 6400,
    product: { _id: 'p12', name: 'Metformin 1000mg', manufacturer: 'USV Ltd', mrp: 72 },
    inventory: { inStockQty: 850, sellingPrice: 52 },
  },

  // ── Omeprazole cluster ──
  {
    userId: 'd13', role: 'Pharmacy', companyName: 'Star Plus Pharmacy',
    distance: 750,
    product: { _id: 'p13', name: 'Omeprazole 20mg', manufacturer: 'AstraZeneca', mrp: 55 },
    inventory: { inStockQty: 290, sellingPrice: 40 },
  },
  {
    userId: 'd14', role: 'Distributor', companyName: 'Lupin Pharma Warehouse',
    distance: 3800,
    product: { _id: 'p14', name: 'Omeprazole 40mg', manufacturer: 'Lupin Ltd', mrp: 80 },
    inventory: { inStockQty: 760, sellingPrice: 55 },
  },

  // ── Azithromycin cluster ──
  {
    userId: 'd15', role: 'Distributor', companyName: 'Macleods Pharma Hub',
    distance: 1750,
    product: { _id: 'p15', name: 'Azithromycin 500mg', manufacturer: 'Macleods Pharma', mrp: 120 },
    inventory: { inStockQty: 310, sellingPrice: 85 },
  },
  {
    userId: 'd16', role: 'Pharmacy', companyName: 'Guardian Lifestyles',
    distance: 4500,
    product: { _id: 'p16', name: 'Azithromycin 250mg', manufacturer: 'Cipla Ltd', mrp: 65 },
    inventory: { inStockQty: 8, sellingPrice: 50 },
  },
  {
    userId: 'd17', role: 'Distributor', companyName: 'Hetero Wholesale Depot',
    distance: 7200,
    product: { _id: 'p17', name: 'Azithromycin 500mg', manufacturer: 'Hetero Labs', mrp: 115 },
    inventory: { inStockQty: 1500, sellingPrice: 78 },
  },

  // ── Insulin cluster ──
  {
    userId: 'd18', role: 'Distributor', companyName: 'Novo Nordisk Dist. India',
    distance: 2300,
    product: { _id: 'p18', name: 'Insulin Glargine 100IU', manufacturer: 'Novo Nordisk', mrp: 950 },
    inventory: { inStockQty: 60, sellingPrice: 820 },
  },
  {
    userId: 'd19', role: 'Pharmacy', companyName: 'Diabetes Care Centre',
    distance: 3100,
    product: { _id: 'p19', name: 'Insulin Regular 40IU', manufacturer: 'Eli Lilly', mrp: 180 },
    inventory: { inStockQty: 25, sellingPrice: 155 },
  },
  {
    userId: 'd20', role: 'Distributor', companyName: 'Biocon MedChain',
    distance: 8500,
    product: { _id: 'p20', name: 'Insulin Aspart 100IU', manufacturer: 'Biocon Ltd', mrp: 1100 },
    inventory: { inStockQty: 0, sellingPrice: 920 },
  },

  // ── Misc high-demand ──
  {
    userId: 'd21', role: 'Distributor', companyName: 'Mankind Pharma Depot',
    distance: 1950,
    product: { _id: 'p21', name: 'Pantoprazole 40mg', manufacturer: 'Mankind Pharma', mrp: 65 },
    inventory: { inStockQty: 1800, sellingPrice: 42 },
  },
  {
    userId: 'd22', role: 'Pharmacy', companyName: 'Apollo Pharmacy (HSR)',
    distance: 600,
    product: { _id: 'p22', name: 'Cetirizine 10mg', manufacturer: 'UCB Pharma', mrp: 30 },
    inventory: { inStockQty: 550, sellingPrice: 22 },
  },
  {
    userId: 'd23', role: 'Distributor', companyName: 'Glenmark Distribution',
    distance: 5500,
    product: { _id: 'p23', name: 'Montelukast 10mg', manufacturer: 'Glenmark Pharma', mrp: 145 },
    inventory: { inStockQty: 420, sellingPrice: 105 },
  },
  {
    userId: 'd24', role: 'Pharmacy', companyName: 'Netmeds Fulfilment Hub',
    distance: 9800,
    product: { _id: 'p24', name: 'Atorvastatin 10mg', manufacturer: 'Pfizer India', mrp: 110 },
    inventory: { inStockQty: 3200, sellingPrice: 75 },
  },
  {
    userId: 'd25', role: 'Distributor', companyName: 'Intas Pharma Warehouse',
    distance: 12000,
    product: { _id: 'p25', name: 'Amlodipine 5mg', manufacturer: 'Intas Pharma', mrp: 48 },
    inventory: { inStockQty: 2700, sellingPrice: 32 },
  },

  // ── Ibuprofen cluster ──
  {
    userId: 'd26', role: 'Pharmacy', companyName: 'Reliance Health Pharmacy',
    distance: 1200,
    product: { _id: 'p26', name: 'Ibuprofen 400mg', manufacturer: 'Abbott India', mrp: 38 },
    inventory: { inStockQty: 820, sellingPrice: 27 },
  },
  {
    userId: 'd27', role: 'Distributor', companyName: 'Abbott MedDistrib India',
    distance: 4700,
    product: { _id: 'p27', name: 'Ibuprofen 600mg', manufacturer: 'Abbott India', mrp: 55 },
    inventory: { inStockQty: 0, sellingPrice: 40 },
  },
  {
    userId: 'd28', role: 'Pharmacy', companyName: 'CureFast Medstore',
    distance: 2900,
    product: { _id: 'p28', name: 'Ibuprofen 200mg', manufacturer: 'Cipla Ltd', mrp: 28 },
    inventory: { inStockQty: 5, sellingPrice: 20 },
  },

  // ── Dexamethasone / Steroids ──
  {
    userId: 'd29', role: 'Distributor', companyName: 'Samarth Pharma Depot',
    distance: 3300,
    product: { _id: 'p29', name: 'Dexamethasone 0.5mg', manufacturer: 'Samarth Life Sciences', mrp: 18 },
    inventory: { inStockQty: 3600, sellingPrice: 11 },
  },
  {
    userId: 'd30', role: 'Pharmacy', companyName: 'Medico Plus Rx',
    distance: 6100,
    product: { _id: 'p30', name: 'Prednisolone 5mg', manufacturer: 'Wyeth India', mrp: 22 },
    inventory: { inStockQty: 1100, sellingPrice: 15 },
  },

  // ── Vitamin D3 / Supplements ──
  {
    userId: 'd31', role: 'Pharmacy', companyName: 'Nutrition Care Hub',
    distance: 890,
    product: { _id: 'p31', name: 'Vitamin D3 60000IU', manufacturer: 'Sun Pharma', mrp: 85 },
    inventory: { inStockQty: 640, sellingPrice: 58 },
  },
  {
    userId: 'd32', role: 'Distributor', companyName: 'Himalaya Pharma Dist.',
    distance: 2400,
    product: { _id: 'p32', name: 'Vitamin B12 1500mcg', manufacturer: 'Himalaya Drug Co', mrp: 120 },
    inventory: { inStockQty: 290, sellingPrice: 88 },
  },
  {
    userId: 'd33', role: 'Pharmacy', companyName: 'HealthVault Pharmacy',
    distance: 5200,
    product: { _id: 'p33', name: 'Multivitamin Tablet', manufacturer: 'Pfizer India', mrp: 210 },
    inventory: { inStockQty: 0, sellingPrice: 160 },
  },

  // ── Cough & Cold ──
  {
    userId: 'd34', role: 'Pharmacy', companyName: 'QuickRelief Medstore',
    distance: 520,
    product: { _id: 'p34', name: 'Dextromethorphan 10mg', manufacturer: 'Pfizer India', mrp: 42 },
    inventory: { inStockQty: 430, sellingPrice: 30 },
  },
  {
    userId: 'd35', role: 'Distributor', companyName: 'Franco India Pharma',
    distance: 3700,
    product: { _id: 'p35', name: 'Bromhexine 8mg', manufacturer: 'Franco India', mrp: 35 },
    inventory: { inStockQty: 720, sellingPrice: 24 },
  },
  {
    userId: 'd36', role: 'Pharmacy', companyName: 'Sneha Medical Stores',
    distance: 7600,
    product: { _id: 'p36', name: 'Salbutamol 2mg', manufacturer: 'GSK Pharma', mrp: 30 },
    inventory: { inStockQty: 9, sellingPrice: 22 },
  },

  // ── Antacids / GI ──
  {
    userId: 'd37', role: 'Distributor', companyName: 'Elder Pharma Dist.',
    distance: 1600,
    product: { _id: 'p37', name: 'Ranitidine 150mg', manufacturer: 'Elder Pharma', mrp: 28 },
    inventory: { inStockQty: 2200, sellingPrice: 18 },
  },
  {
    userId: 'd38', role: 'Pharmacy', companyName: 'GastroCare Pharmacy',
    distance: 4100,
    product: { _id: 'p38', name: 'Domperidone 10mg', manufacturer: 'Janssen India', mrp: 45 },
    inventory: { inStockQty: 380, sellingPrice: 32 },
  },
  {
    userId: 'd39', role: 'Distributor', companyName: 'Zydus GI Depot',
    distance: 8900,
    product: { _id: 'p39', name: 'Rabeprazole 20mg', manufacturer: 'Zydus Cadila', mrp: 72 },
    inventory: { inStockQty: 940, sellingPrice: 50 },
  },

  // ── Blood Pressure / Cardiac ──
  {
    userId: 'd40', role: 'Pharmacy', companyName: 'HeartCare Medicals',
    distance: 2750,
    product: { _id: 'p40', name: 'Losartan 50mg', manufacturer: 'Merck India', mrp: 95 },
    inventory: { inStockQty: 510, sellingPrice: 68 },
  },
  {
    userId: 'd41', role: 'Distributor', companyName: 'Cipla Cardiac Hub',
    distance: 5900,
    product: { _id: 'p41', name: 'Telmisartan 40mg', manufacturer: 'Cipla Ltd', mrp: 88 },
    inventory: { inStockQty: 1350, sellingPrice: 60 },
  },
  {
    userId: 'd42', role: 'Pharmacy', companyName: 'Prime Wellness Centre',
    distance: 10500,
    product: { _id: 'p42', name: 'Enalapril 5mg', manufacturer: 'Novartis India', mrp: 65 },
    inventory: { inStockQty: 0, sellingPrice: 48 },
  },

  // ── Thyroid ──
  {
    userId: 'd43', role: 'Pharmacy', companyName: 'ThyroCare Pharmacy',
    distance: 1850,
    product: { _id: 'p43', name: 'Levothyroxine 50mcg', manufacturer: 'Abbott India', mrp: 48 },
    inventory: { inStockQty: 660, sellingPrice: 34 },
  },
  {
    userId: 'd44', role: 'Distributor', companyName: 'Abbott EndoChain',
    distance: 6800,
    product: { _id: 'p44', name: 'Levothyroxine 100mcg', manufacturer: 'Abbott India', mrp: 78 },
    inventory: { inStockQty: 3, sellingPrice: 56 },
  },

  // ── Antibiotics (others) ──
  {
    userId: 'd45', role: 'Distributor', companyName: 'Wockhardt Pharma Dist.',
    distance: 3450,
    product: { _id: 'p45', name: 'Ciprofloxacin 500mg', manufacturer: 'Wockhardt Ltd', mrp: 75 },
    inventory: { inStockQty: 1040, sellingPrice: 52 },
  },
  {
    userId: 'd46', role: 'Pharmacy', companyName: 'RxWorld Medstore',
    distance: 7300,
    product: { _id: 'p46', name: 'Doxycycline 100mg', manufacturer: 'Lupin Ltd', mrp: 60 },
    inventory: { inStockQty: 230, sellingPrice: 44 },
  },
  {
    userId: 'd47', role: 'Distributor', companyName: 'Emcure Wholesale Hub',
    distance: 11200,
    product: { _id: 'p47', name: 'Cefixime 200mg', manufacturer: 'Emcure Pharma', mrp: 140 },
    inventory: { inStockQty: 580, sellingPrice: 95 },
  },

  // ── Diabetes (others) ──
  {
    userId: 'd48', role: 'Pharmacy', companyName: 'SugarFree Medicals',
    distance: 2050,
    product: { _id: 'p48', name: 'Glimepiride 2mg', manufacturer: 'Sanofi India', mrp: 55 },
    inventory: { inStockQty: 760, sellingPrice: 38 },
  },
  {
    userId: 'd49', role: 'Distributor', companyName: 'Sanofi Pharma India Dist.',
    distance: 9400,
    product: { _id: 'p49', name: 'Sitagliptin 100mg', manufacturer: 'MSD India', mrp: 320 },
    inventory: { inStockQty: 145, sellingPrice: 240 },
  },

  // ── Dermatology ──
  {
    userId: 'd50', role: 'Pharmacy', companyName: 'DermaCare Pharma',
    distance: 4300,
    product: { _id: 'p50', name: 'Clotrimazole 1% Cream', manufacturer: 'Bayer India', mrp: 90 },
    inventory: { inStockQty: 0, sellingPrice: 65 },
  },
  {
    userId: 'd51', role: 'Distributor', companyName: 'Glenmark Derm Depot',
    distance: 6600,
    product: { _id: 'p51', name: 'Fluconazole 150mg', manufacturer: 'Glenmark Pharma', mrp: 48 },
    inventory: { inStockQty: 870, sellingPrice: 32 },
  },
  {
    userId: 'd52', role: 'Pharmacy', companyName: 'SkinFirst Pharmacy',
    distance: 13500,
    product: { _id: 'p52', name: 'Betamethasone 0.1% Cream', manufacturer: 'GSK Pharma', mrp: 72 },
    inventory: { inStockQty: 410, sellingPrice: 50 },
  },

  // ── Paediatric / Syrups ──
  {
    userId: 'd53', role: 'Pharmacy', companyName: 'KidCare Medical Store',
    distance: 1350,
    product: { _id: 'p53', name: 'Amoxicillin 125mg Syrup', manufacturer: 'Ranbaxy Labs', mrp: 55 },
    inventory: { inStockQty: 190, sellingPrice: 40 },
  },
  {
    userId: 'd54', role: 'Distributor', companyName: 'Panacea Biotec Dist.',
    distance: 5400,
    product: { _id: 'p54', name: 'Calpol Paed Syrup 120ml', manufacturer: 'GSK Pharma', mrp: 68 },
    inventory: { inStockQty: 320, sellingPrice: 50 },
  },

  // ── Pain / Neurology ──
  {
    userId: 'd55', role: 'Distributor', companyName: 'Pfizer Neuro Depot',
    distance: 4900,
    product: { _id: 'p55', name: 'Pregabalin 75mg', manufacturer: 'Pfizer India', mrp: 180 },
    inventory: { inStockQty: 420, sellingPrice: 130 },
  },
  {
    userId: 'd56', role: 'Pharmacy', companyName: 'NeuroCare Pharma',
    distance: 8200,
    product: { _id: 'p56', name: 'Gabapentin 300mg', manufacturer: 'Sun Pharma', mrp: 95 },
    inventory: { inStockQty: 6, sellingPrice: 68 },
  },
  {
    userId: 'd57', role: 'Distributor', companyName: 'Torrent Neuro Hub',
    distance: 15000,
    product: { _id: 'p57', name: 'Tramadol 50mg', manufacturer: 'Torrent Pharma', mrp: 65 },
    inventory: { inStockQty: 900, sellingPrice: 45 },
  },
];

const LIVE_STUB = {
  userId: 'live1', role: 'Distributor', companyName: 'QuickMed Express', isNew: true,
  distance: 680,
  product: { _id: 'pl1', name: 'Paracetamol 500mg', manufacturer: 'Alkem Labs', mrp: 24 },
  inventory: { inStockQty: 200, sellingPrice: 14 },
};

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100" />
          <div>
            <div className="h-4 w-32 bg-gray-100 rounded mb-1.5" />
            <div className="h-3 w-20 bg-gray-100 rounded" />
          </div>
        </div>
        <div className="h-5 w-16 bg-gray-100 rounded-full" />
      </div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[1, 2, 3].map(i => <div key={i} className="h-14 bg-gray-50 rounded-xl" />)}
      </div>
      <div className="h-10 bg-gray-100 rounded-xl" />
    </div>
  );
}

function SupplierCard({ result, qty, onQtyChange, onOrder, onRequest, isOrdering }) {
  const isDistributor = result.role === 'Distributor' || !result.pharmacyName;
  const supplierName = result.companyName || result.contactPerson || 'Supplier';
  const distKm = result.distance >= 1000
    ? `${(result.distance / 1000).toFixed(1)} km`
    : `${result.distance} m`;
  const inStock = result.inventory.inStockQty > 0;
  const isLowStock = inStock && result.inventory.inStockQty < 10;
  const discount = result.product.mrp > result.inventory.sellingPrice
    ? Math.round(((result.product.mrp - result.inventory.sellingPrice) / result.product.mrp) * 100)
    : 0;

  return (
    <div className={`relative bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${!inStock ? 'border-gray-100 opacity-60' : 'border-gray-100 hover:border-[#37d38e]/40'
      } ${result.isNew ? 'ring-2 ring-[#37d38e] ring-offset-1 animate-pulse-once' : ''}`}>
      {result.isNew && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-[#37d38e] text-white text-[9px] font-black px-2 py-0.5 rounded-full">
          <Zap className="w-2.5 h-2.5" /> JUST ADDED
        </div>
      )}
      <div className={`h-1 w-full ${isDistributor ? 'bg-blue-400' : 'bg-[#37d38e]'}`} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-4 gap-2">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isDistributor ? 'bg-blue-50 text-blue-600' : 'bg-[#e4f7f0] text-[#37d38e]'
              }`}>
              {isDistributor ? <Truck className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-[#2a3441] text-sm leading-tight truncate pr-2">{supplierName}</h3>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isDistributor ? 'bg-blue-50 text-blue-600' : 'bg-[#e4f7f0] text-[#37d38e]'
                  }`}>
                  {isDistributor ? 'DISTRIBUTOR' : 'PHARMACY'}
                </span>
                <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                  <MapPin className="w-2.5 h-2.5" />{distKm}
                </span>
                {result.estimatedDeliveryTime && (
                  <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />{result.estimatedDeliveryTime}
                  </span>
                )}
              </div>
              {result.address && (
                <p className="text-[10px] text-gray-400 mt-0.5 truncate">{result.address}</p>
              )}
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 mt-0.5 ${!inStock ? 'bg-red-50 text-red-500' : isLowStock ? 'bg-orange-50 text-orange-500' : 'bg-[#e4f7f0] text-[#37d38e]'
            }`}>
            {!inStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3 text-center">
          <div className="bg-gray-50 rounded-xl p-2.5">
            <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">Stock</p>
            <p className="text-sm font-black text-[#2a3441] mt-0.5">{result.inventory.inStockQty}</p>
            <p className="text-[9px] text-gray-400">units</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-2.5">
            <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">MRP</p>
            <p className="text-sm font-black text-gray-400 line-through mt-0.5">₹{result.product.mrp}</p>
          </div>
          <div className="bg-[#e4f7f0] rounded-xl p-2.5">
            <p className="text-[9px] text-[#37d38e] font-semibold uppercase tracking-wide">Rate</p>
            <p className="text-sm font-black text-[#37d38e] mt-0.5">₹{result.inventory.sellingPrice}</p>
            {discount > 0 && <p className="text-[9px] text-[#37d38e] font-bold">{discount}% off</p>}
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-4 truncate">
          💊 <span className="font-semibold text-[#2a3441]">{result.product.name}</span>
          <span className="text-gray-400"> · {result.product.manufacturer}</span>
        </p>

        {!inStock ? (
          <button
            onClick={() => onRequest(result)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 text-sm font-semibold hover:border-[#2a3441] hover:text-[#2a3441] transition-colors"
          >
            <AlertCircle className="w-4 h-4" /> Broadcast Request
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-gray-50 rounded-xl px-2 py-1.5 border border-gray-100">
              <button
                onClick={() => onQtyChange(result.product._id + result.userId, Math.max(1, qty - 1))}
                className="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-8 text-center text-sm font-bold text-[#2a3441]">{qty}</span>
              <button
                onClick={() => onQtyChange(result.product._id + result.userId, Math.min(result.inventory.inStockQty, qty + 1))}
                className="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <button
              onClick={() => onOrder(result)}
              disabled={isOrdering || result.isDummy}
              title={result.isDummy ? 'Demo data — add real suppliers to place orders' : ''}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#37d38e] text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-60 shadow-sm shadow-[#37d38e]/30"
            >
              {isOrdering ? <Loader2 className="w-4 h-4 animate-spin" /> : result.isDummy ? <>Demo Only</> : <>Place Order <ArrowRight className="w-3.5 h-3.5" /></>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function LiveBadge({ connected }) {
  return (
    <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${connected ? 'bg-[#e4f7f0] text-[#37d38e]' : 'bg-gray-100 text-gray-400'
      }`}>
      {connected
        ? <><span className="w-1.5 h-1.5 rounded-full bg-[#37d38e] animate-pulse" />Live</>
        : <><WifiOff className="w-3 h-3" />Offline</>}
    </div>
  );
}

const SORT_OPTIONS = [
  { key: 'distance', label: 'Nearest', icon: MapPin },
  { key: 'price', label: 'Cheapest', icon: TrendingDown },
  { key: 'stock', label: 'Most Stock', icon: Package },
];

const TYPE_OPTIONS = [
  { key: 'all', label: 'All' },
  { key: 'Distributor', label: 'Distributors', icon: Truck },
  { key: 'Pharmacy', label: 'Pharmacies', icon: Building2 },
];

const PRICE_RANGES = [
  { key: 'all', label: 'Any Price' },
  { key: '0-50', label: '₹0 – ₹50', min: 0, max: 50 },
  { key: '50-150', label: '₹50 – ₹150', min: 50, max: 150 },
  { key: '150-500', label: '₹150 – ₹500', min: 150, max: 500 },
  { key: '500+', label: '₹500 +', min: 500, max: Infinity },
];

const QUICK_SEARCHES = ['Paracetamol', 'Amoxicillin', 'Insulin', 'Metformin', 'Omeprazole', 'Azithromycin'];

export default function PharmacyRequest() {
  const navigate = useNavigate();
  const { connected, subscribe } = useSocket();
  const inputRef = useRef(null);

  const [search, setSearch] = useState('');
  const [rawResults, setRawResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState({ lat: 12.9715987, lng: 77.5945627 });
  const [sortBy, setSortBy] = useState('distance');
  const [filterType, setFilterType] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [quantities, setQuantities] = useState({});
  const [orderingId, setOrderingId] = useState(null);
  const [requestingName, setRequestingName] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [liveToast, setLiveToast] = useState(null);
  const currentSearch = useRef('');

  const showLiveToast = (msg) => {
    setLiveToast(msg);
    setTimeout(() => setLiveToast(null), 3500);
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {} // fallback is the state default
      );
    }
  }, []);

  useEffect(() => {
    const unsub1 = subscribe('stock_updated', (data) => {
      if (!currentSearch.current) return;
      const q = currentSearch.current.toLowerCase();
      if (data.product?.name?.toLowerCase().includes(q)) {
        setRawResults((prev) => {
          const existing = prev.find(r => r.userId === data.userId && r.product._id === data.product._id);
          if (existing) {
            return prev.map(r =>
              r.userId === data.userId && r.product._id === data.product._id
                ? { ...r, inventory: { ...r.inventory, inStockQty: data.inStockQty } }
                : r
            );
          }
          return [{ ...data, isNew: true }, ...prev];
        });
        showLiveToast(`${data.companyName || 'A supplier'} updated stock`);
      }
    });

    const unsub2 = subscribe('supplier_available', (data) => {
      if (!currentSearch.current) return;
      const q = currentSearch.current.toLowerCase();
      if (data.product?.name?.toLowerCase().includes(q)) {
        setRawResults((prev) => {
          if (prev.find(r => r.userId === data.userId)) return prev;
          return [{ ...data, isNew: true }, ...prev];
        });
        showLiveToast(`New supplier: ${data.companyName || 'nearby'}`);
      }
    });

    return () => { unsub1(); unsub2(); };
  }, [subscribe]);

  useEffect(() => {
    currentSearch.current = search.trim();
    if (!search.trim() || !location) {
      Promise.resolve().then(() => {
        setRawResults([]);
        setHasSearched(false);
      });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setHasSearched(true);
      try {
        // Step 1: Search the medicine catalog by name
        const { data: catalogData } = await api.get(
          `/pharmacy/medicines/search?q=${encodeURIComponent(search.trim())}`
        );
        const medicines = catalogData?.data || [];

        if (medicines.length === 0) {
          // No medicines found in catalog — show dummy data as demo
          setRawResults(DUMMY_SUPPLIERS.map(s => ({ ...s, isDummy: true })));
          setLoading(false);
          return;
        }

        // Step 2: For each medicine found, search nearby pharmacies that have stock
        const allResults = [];
        for (const med of medicines.slice(0, 5)) {
          try {
            const { data: nearbyData } = await api.get(
              `/pharmacy/nearby-stock?medicineId=${med._id}&quantity=1&radius=50`
            );
            const nearby = nearbyData?.data || [];
            nearby.forEach(item => {
              allResults.push({
                userId: item.pharmacy?._id,
                role: 'Pharmacy',
                companyName: item.pharmacy?.pharmacyName || 'Unknown Pharmacy',
                pharmacyName: item.pharmacy?.pharmacyName,
                address: item.pharmacy?.address || '',
                distance: Math.round((item.distance || 0) * 1000),
                estimatedDeliveryTime: item.estimatedDeliveryTime || '',
                product: {
                  _id: med._id,
                  name: med.name,
                  manufacturer: med.manufacturer || '',
                  mrp: med.price || 0,
                },
                inventory: {
                  inStockQty: item.availableStock || 0,
                  sellingPrice: med.price || 0,
                },
              });
            });
          } catch {
            // skip this medicine if nearby search fails
          }
        }

        // If real results found, use them; otherwise show dummy data as demo
        if (allResults.length > 0) {
          setRawResults(allResults);
        } else {
          setRawResults(DUMMY_SUPPLIERS.map(s => ({ ...s, isDummy: true })));
        }
      } catch {
        setRawResults(DUMMY_SUPPLIERS.map(s => ({ ...s, isDummy: true })));
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [search, location]);

  useEffect(() => {
    if (!hasSearched || rawResults.length === 0) return;
    const t = setTimeout(() => {
      setRawResults((prev) => {
        if (prev.find(r => r.userId === LIVE_STUB.userId)) return prev;
        showLiveToast('QuickMed Express just came online nearby!');
        return [{ ...LIVE_STUB, isNew: true }, ...prev];
      });
    }, 4000);
    return () => clearTimeout(t);
  }, [hasSearched, rawResults.length]);

  const results = useMemo(() => {
    let list = [...rawResults];

    if (filterType !== 'all') {
      list = list.filter((r) => {
        const isDist = r.role === 'Distributor' || !r.pharmacyName;
        return filterType === 'Distributor' ? isDist : !isDist;
      });
    }

    if (priceRange !== 'all') {
      const range = PRICE_RANGES.find(p => p.key === priceRange);
      if (range) {
        list = list.filter(r =>
          r.inventory.sellingPrice >= range.min && r.inventory.sellingPrice < range.max
        );
      }
    }

    const newItems = list.filter(r => r.isNew);
    const rest = list.filter(r => !r.isNew);

    rest.sort((a, b) => {
      if (sortBy === 'distance') return a.distance - b.distance;
      if (sortBy === 'price') return a.inventory.sellingPrice - b.inventory.sellingPrice;
      if (sortBy === 'stock') return b.inventory.inStockQty - a.inventory.inStockQty;
      return 0;
    });

    const inStock = rest.filter(r => r.inventory.inStockQty > 0);
    const outOfStock = rest.filter(r => r.inventory.inStockQty === 0);

    return [...newItems, ...inStock, ...outOfStock];
  }, [rawResults, sortBy, filterType, priceRange]);

  const setQty = (key, qty) => setQuantities(prev => ({ ...prev, [key]: qty }));
  const getQty = (key) => quantities[key] || 1;

  const handleOrder = async (result) => {
    const key = result.product._id + result.userId;
    const qty = getQty(key);
    setOrderingId(key);
    try {
      await api.post('/pharmacy/requests', {
        supplierPharmacyId: result.userId,
        medicineId: result.product._id,
        quantity: qty,
      });
      navigate('/pharmacy/outgoing');
    } catch (err) {
      alert(err.response?.data?.message || 'Order failed');
    } finally {
      setOrderingId(null);
    }
  };

  const handleRequest = async (result) => {
    setRequestingName(result.product.name);
    try {
      await api.post('/pharmacy/requests', {
        supplierPharmacyId: result.userId,
        medicineId: result.product._id,
        quantity: 10,
      });
      showLiveToast(`Request sent for "${result.product.name}"`);
    } catch (err) {
      alert(err.response?.data?.message || 'Request failed');
    } finally {
      setRequestingName(null);
    }
  };

  const inStockCount = results.filter(r => r.inventory.inStockQty > 0).length;
  const cheapest = inStockCount > 0
    ? Math.min(...results.filter(r => r.inventory.inStockQty > 0).map(r => r.inventory.sellingPrice))
    : null;

  return (
    <div className="max-w-5xl mx-auto relative">
      {liveToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 bg-[#2a3441] text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl animate-fade-up">
          <Zap className="w-3.5 h-3.5 text-[#37d38e]" />
          {liveToast}
        </div>
      )}

      {/* Sticky search + filters */}
      <div className="sticky top-0 z-20 bg-[#f5f6f8] pt-1 pb-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            autoFocus
            placeholder="Search medicine, manufacturer, category..."
            className="w-full pl-12 pr-12 py-4 bg-white rounded-2xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#37d38e]/40 focus:border-[#37d38e] text-sm font-medium text-[#2a3441] placeholder-gray-400 transition-all"
          />
          {search && (
            <button
              onClick={() => { setSearch(''); setRawResults([]); setHasSearched(false); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X className="w-3 h-3 text-gray-500" />
            </button>
          )}
        </div>

        {/* Sort + Type row */}
        {hasSearched && (
          <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-0.5">
            <span className="text-[11px] text-gray-400 font-semibold whitespace-nowrap flex-shrink-0">Sort:</span>
            {SORT_OPTIONS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSortBy(key)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all flex-shrink-0 ${sortBy === key
                    ? 'bg-[#37d38e] text-white border-[#37d38e] shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#37d38e]/50'
                  }`}
              >
                <Icon className="w-3 h-3" />
                {label}
              </button>
            ))}
            <div className="w-px h-5 bg-gray-200 mx-1 flex-shrink-0" />
            {TYPE_OPTIONS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setFilterType(key)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all flex-shrink-0 ${filterType === key
                    ? 'bg-[#2a3441] text-white border-[#2a3441]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#2a3441]/30'
                  }`}
              >
                {Icon && <Icon className="w-3 h-3" />}
                {label}
              </button>
            ))}
            <div className="ml-auto flex-shrink-0">
              <LiveBadge connected={connected} />
            </div>
          </div>
        )}

        {/* Price range row */}
        {hasSearched && (
          <div className="flex items-center gap-2 mt-2 overflow-x-auto pb-0.5">
            <span className="text-[11px] text-gray-400 font-semibold whitespace-nowrap flex-shrink-0">Price:</span>
            {PRICE_RANGES.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setPriceRange(key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all flex-shrink-0 ${priceRange === key
                    ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-orange-400 hover:text-orange-500'
                  }`}
              >
                {label}
              </button>
            ))}
            {priceRange !== 'all' && (
              <button
                onClick={() => setPriceRange('all')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-bold text-orange-500 bg-orange-50 border border-orange-200 hover:bg-orange-100 transition-colors flex-shrink-0"
              >
                <X className="w-2.5 h-2.5" /> Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Idle state */}
      {!search.trim() && (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-[#e4f7f0] flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-[#37d38e]" />
          </div>
          <h3 className="text-base font-bold text-[#2a3441] mb-1">Find Medicine Stock</h3>
          <p className="text-sm text-center text-gray-500 max-w-xs leading-relaxed">
            Search by medicine name to find nearby pharmacies and distributors with live stock updates.
          </p>
          <div className="flex flex-wrap gap-2 mt-6 justify-center">
            {QUICK_SEARCHES.map((m) => (
              <button
                key={m}
                onClick={() => setSearch(m)}
                className="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-semibold text-gray-600 hover:border-[#37d38e] hover:text-[#37d38e] transition-colors shadow-sm"
              >
                {m}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 mt-6 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#37d38e] animate-pulse inline-block" />
            Results update in real-time via live socket
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Loader2 className="w-4 h-4 text-[#37d38e] animate-spin" />
            <p className="text-sm text-gray-500 font-medium">Searching nearby inventory...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && hasSearched && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div>
              {results.length > 0 ? (
                <>
                  <p className="text-sm font-bold text-[#2a3441]">
                    {inStockCount} supplier{inStockCount !== 1 ? 's' : ''} have stock
                    {results.length > inStockCount && (
                      <span className="text-gray-400 font-normal"> · {results.length - inStockCount} out of stock</span>
                    )}
                  </p>
                  {cheapest !== null && (
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                      <TrendingDown className="w-3 h-3 text-[#37d38e]" />
                      Best rate: <span className="font-bold text-[#37d38e]">₹{cheapest}</span>
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm font-bold text-gray-500">No suppliers found for "{search}"</p>
              )}
            </div>
            <LiveBadge connected={connected} />
          </div>

          {results.length > 0 ? (
            <>
              {/* Demo Mode banner – shown when results are sample/dummy data */}
              {results.some(r => r.isDummy) && (
                <div className="mb-4 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-amber-700">Demo Results</p>
                    <p className="text-[11px] text-amber-600 mt-0.5">
                      No real suppliers found nearby. These are sample cards — add real medicine stock in Inventory to enable live ordering.
                    </p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {results.map((r, i) => (
                  <SupplierCard
                    key={`${r.userId}-${r.product._id}-${i}`}
                    result={r}
                    qty={getQty(r.product._id + r.userId)}
                    onQtyChange={setQty}
                    onOrder={handleOrder}
                    onRequest={handleRequest}
                    isOrdering={orderingId === r.product._id + r.userId}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                <Search className="w-7 h-7 text-gray-300" />
              </div>
              <h3 className="font-bold text-[#2a3441] mb-1">No stock found nearby</h3>
              <p className="text-sm text-gray-400 max-w-xs leading-relaxed mb-5">
                No suppliers within 50 km have "{search}". Broadcast a shortage request to all nearby suppliers.
              </p>
              <button
                onClick={() => handleRequest(search)}
                disabled={!!requestingName}
                className="flex items-center gap-2 px-6 py-3 bg-[#2a3441] text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 shadow-sm"
              >
                {requestingName
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <><SlidersHorizontal className="w-4 h-4" /> Broadcast Request for "{search}"</>
                }
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
