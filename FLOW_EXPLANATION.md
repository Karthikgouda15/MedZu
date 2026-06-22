# MedZu Platform - Flow Connection & Architecture Guide

This guide details the complete request-delivery lifecycle of the **MedZu** application. It explains exactly how requests flow from one module to another, which files are connected, and how the real-time WebSockets logic operates.

---

## ─── Medicine Procurement & Delivery Lifecycle ───

```mermaid
sequenceflow
    actor PharmacyA as 🏢 Pharmacy A (Buyer)
    actor PharmacyB as 🏢 Pharmacy B (Supplier)
    actor Rider as 🏍️ Delivery Partner (Rider)
    database DB as 🗄️ MongoDB Database

    %% Search & Request
    PharmacyA ->> DB: 1. Search nearby stock (Geospatial search)
    PharmacyA ->> DB: 2. Create procurement request (Status: pending)
    DB -->> PharmacyB: 3. Real-time Socket: new_request received

    %% Accept & Assign
    PharmacyB ->> DB: 4. Accept Incoming Request (Status: accepted)
    Note over DB: 5. Auto-assignment: Find nearest available distributor
    DB -->> Rider: 6. Real-time Socket: distributor_assigned
    DB -->> PharmacyA: 7. Real-time Socket: update tracking stepper

    %% Acceptance
    Rider ->> DB: 8. Accept Assignment
    Rider ->> PharmacyA: 9. Live GPS Updates via Socket (5s intervals)

    %% Stepper Flow
    Rider ->> DB: 10. Start Pickup (Status: pickup_started)
    Rider ->> DB: 11. Picked Up (Status: picked_up -> Deducts Supplier stock)
    Rider ->> DB: 12. Start Delivery (Status: en_route)
    Rider ->> DB: 13. Delivered (Status: completed -> Adds Buyer stock & pays Rider)
    DB -->> PharmacyA: 14. Real-time Socket: Delivery Completed!
    Rider ->> PharmacyA: 15. Redirect back to searching radar screen
```

---

## 1. Searching for Stock
* **User Action:** Pharmacy A (Buyer) searches for a medicine and a quantity.
* **Frontend Component:** [PharmacyRequest.jsx](file:///Users/karthikgouda/Desktop/Pharma/frontend/src/pages/pharmacy/PharmacyRequest.jsx)
* **Backend Endpoint:** `GET /api/pharmacy/nearby-stock?medicineId=X&quantity=Y`
* **Controller:** `findNearbyStock` in [pharmacy.controller.js](file:///Users/karthikgouda/Desktop/Pharma/backend/src/controllers/pharmacy.controller.js)
* **Connected Logic:** Calls `findNearbyPharmaciesWithStock` in [geoSearch.service.js](file:///Users/karthikgouda/Desktop/Pharma/backend/src/services/geoSearch.service.js), which executes a MongoDB `$near` query utilizing the coordinates index on the `Pharmacy` collection. It returns matching pharmacies with sufficient inventory within a 10km radius.

---

## 2. Placing the Request (Cart vs. Quick Request)
* **User Action:** Buyer clicks "Quick Request" or adds items to the cart on a supplier's catalog page and clicks "Confirm".
* **Frontend Component:** [SupplierDetail.jsx](file:///Users/karthikgouda/Desktop/Pharma/frontend/src/pages/pharmacy/SupplierDetail.jsx) or [PharmacyRequest.jsx](file:///Users/karthikgouda/Desktop/Pharma/frontend/src/pages/pharmacy/PharmacyRequest.jsx)
* **Backend Endpoint:** `POST /api/pharmacy/requests`
* **Controller:** `createMedicineRequest` in [pharmacy.controller.js](file:///Users/karthikgouda/Desktop/Pharma/backend/src/controllers/pharmacy.controller.js)
* **Connected Logic:** 
  1. Calls `createRequest` in [request.service.js](file:///Users/karthikgouda/Desktop/Pharma/backend/src/services/request.service.js).
  2. Saves a new `MedicineRequest` in MongoDB with `status: 'pending'`.
  3. Saves a notification and sends it via Socket.IO.
  4. Emits `new_request` to the supplier pharmacy's socket room: `pharmacy:supplierPharmacyId`.
  5. Automatically redirects the buyer to `/pharmacy/tracking` to watch the request's status in real-time.

---

## 3. Supplier Accepting the Request & Auto-Assigning Rider
* **User Action:** Pharmacy B (Supplier) views the incoming alert on the [PharmacyIncoming.jsx](file:///Users/karthikgouda/Desktop/Pharma/frontend/src/pages/pharmacy/PharmacyIncoming.jsx) page and clicks **Accept**.
* **Backend Endpoint:** `PATCH /api/pharmacy/requests/:id/accept`
* **Controller:** `acceptIncomingRequest` in [pharmacy.controller.js](file:///Users/karthikgouda/Desktop/Pharma/backend/src/controllers/pharmacy.controller.js)
* **Connected Logic:**
  1. Calls `acceptRequest` in [request.service.js](file:///Users/karthikgouda/Desktop/Pharma/backend/src/services/request.service.js) which changes the request status to `'accepted'`.
  2. Runs `findNearestDistributor` in [distributorAssign.service.js](file:///Users/karthikgouda/Desktop/Pharma/backend/src/services/distributorAssign.service.js) to locate the closest online rider (`availabilityStatus: 'available'`).
  3. If a rider is found, runs `assignDistributor` which transitions the status to `'distributor_assigned'` and flags the distributor's availability as `'busy'`.
  4. Emits `distributor_assigned` event in real-time to the rider (`distributor:distributorId`) and the buyer (`pharmacy:buyerPharmacyId`).
  5. The buyer's screen changes timeline status to **"Rider Assigned"**.
  6. The rider's screen ([DistributorDashboard.jsx](file:///Users/karthikgouda/Desktop/Pharma/frontend/src/pages/distributor/DistributorDashboard.jsx)) immediately triggers a pulsing, bottom sheet incoming request card.

---

## 4. Rider Accepting & Active Delivery Steps
* **User Action:** Rider clicks **Accept Order** on the dashboard and is redirected to the active routing screen.
* **Frontend Component:** [DistributorActive.jsx](file:///Users/karthikgouda/Desktop/Pharma/frontend/src/pages/distributor/DistributorActive.jsx)
* **Connected Stepper Actions:**
  * **Start Pickup:** Hits `PATCH /api/distributor/requests/:id/pickup-start`. Starts tracking rider coordinates via `navigator.geolocation.watchPosition()`. Emits `update_location` socket event every 5 seconds to update the buyer's live tracking map.
  * **Mark Picked Up:** Hits `PATCH /api/distributor/requests/:id/picked-up`. Backend executes `adjustInventory` to **deduct** medicine stock from the supplier's inventory.
  * **Start Delivery:** Hits `PATCH /api/distributor/requests/:id/en-route` (Rider is heading to the buyer).
  * **Mark Delivered:** Hits `PATCH /api/distributor/requests/:id/delivered`.
    1. Backend transitions the request state to `'delivered'` and then `'completed'`.
    2. Runs `adjustInventory` to **increment** medicine stock in the buyer's inventory.
    3. Resets the rider's availability back to `'available'`.
    4. Calculates platform commission and adds the delivery fee to the rider's `totalEarnings`.
    5. Redirects the rider back to `/distributor/dashboard` (searching radar screen).

---

## 5. Socket.IO Real-Time Channels (Rooms)
Real-time state changes are broadcasted on dedicated channels set up in [socket/index.js](file:///Users/karthikgouda/Desktop/Pharma/backend/src/socket/index.js):
* `user:userId` - Personal user alerts/notifications.
* `pharmacy:pharmacyId` - Broadcasts to a specific pharmacy (e.g. `new_request`, `request_accepted`).
* `distributor:distributorId` - Broadcasts to a specific rider (e.g. `distributor_assigned`).
* `request:requestId` - Joint channel for Buyer, Supplier, and Rider (e.g. live GPS `location_updated` coords).
* `admin` - Real-time statistics, live maps, and audit logs.
