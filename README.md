# MedZu - Real-Time Inter-Pharmacy Medicine Procurement & Delivery Platform

MedZu connects pharmacies, distributors, and admins in a real-time medicine procurement workflow — similar to Swiggy/Zomato but for pharmacies.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, React Router, Socket.IO Client, React Leaflet, Recharts
- **Backend:** Node.js, Express, MongoDB, Mongoose, Socket.IO, JWT
- **Maps:** OpenStreetMap via React Leaflet

## Features

- Role-based dashboards (Admin, Pharmacy, Distributor)
- JWT authentication with refresh tokens
- MongoDB geospatial search for nearby pharmacies with stock
- Full medicine request lifecycle with Socket.IO real-time updates
- Auto distributor assignment and live GPS tracking (5s intervals)
- Inventory management with automatic stock adjustments
- Notifications, analytics, and audit logs

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Docker)

### 1. Start MongoDB

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
npm install
npm run seed    # Seed demo data
npm run dev
```

Backend runs at `http://localhost:5001` (port 5001 avoids macOS AirPlay conflict on 5000)

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

## Demo Accounts

| Role        | Email                  | Password     |
|-------------|------------------------|--------------|
| Admin       | admin@medzu.com        | admin123     |
| Pharmacy    | pharmacy1@medzu.com    | pharmacy123  |
| Pharmacy 2  | pharmacy2@medzu.com    | pharmacy123  |
| Distributor | distributor1@medzu.com | dist123      |

## Request Lifecycle

```
pending → accepted → distributor_assigned → pickup_started → picked_up → en_route → delivered → completed
```

Rejected path: `pending → rejected`

## Socket.IO Events

- `new_request`, `request_accepted`, `request_rejected`
- `distributor_assigned`, `pickup_started`, `medicine_picked`
- `location_updated`, `delivery_started`, `delivery_completed`
- `inventory_updated`, `notification_created`

## Project Structure

```
Pharma/
├── backend/          # Express API + Socket.IO
├── frontend/         # React Vite app
├── docker-compose.yml
└── README.md
```

## Environment Variables

Copy `.env.example` to `backend/.env` and `frontend/.env`. See the example file for all required variables.
