# LogiFlow — Cargo Office Management System

LogiFlow is a state-of-the-art cargo office management and real-time logistics tracking suite. Recreated based on the Stitch UI design specifications and functional requirements outlined in the Cargo Office Management SRS, it offers supply chain administrators and cargo operators a centralized command center to monitor global freight movement.

---

## 🚀 Key Features

*   **Intelligent Dashboard:** Real-time metrics overview including shipment volume charts (last 7 days performance), system efficiency metrics, KPI widgets (revenue, active users, shipments, pending deliveries), and recent shipments logs.
*   **Comprehensive Shipment Management:** End-to-end tracking of cargo status (`Pending`, `In Transit`, `Delivered`, `Delayed`, `Cancelled`) with detail cards representing routes, dispatch times, cargo weights, and descriptions.
*   **Real-Time Milestone Tracking:** Interactive vertical timeline showing precise package transit status, current logistics vessel details, and historical timestamps.
*   **Public Parcel Tracking (No-Auth):** Allows external customers to track parcels without logging in. Searching for non-existent tracking numbers seamlessly triggers a contextual `404 - Shipment Not Found` layout.
*   **Financial & Invoicing Registry:** Log payment statuses (`Paid`, `Pending`, `Overdue`), invoice identifiers, tax values, total collected earnings, and outstanding client invoices.
*   **Warehouse Condition Log:** Keep records of stored cargo, barcode/QR tags, rack positioning, storage dates, and parcel conditions (`Safe`, `Damaged`, `Lost`).
*   **User Access Control & Profiles:** Complete directory of system operators with role categories (`Admin`, `Operations`, `Finance`, `Customer Service`, `Warehouse`). Users can personalize timezones, write biographies, update contact details, and manage 2FA security.

---

## 🛠️ Tech Stack

*   **Frontend Framework:** React (Vite-based scaffolding)
*   **Styling Engine:** Tailwind CSS & Custom CSS Utility Tokens (extending Stitch UI color palette)
*   **Routing System:** React Router v6 (using Protected Route guards for role validation)
*   **Charts & Visuals:** Recharts API & Custom SVG indicators
*   **Database ORM:** Prisma Client
*   **Database Engine:** SQLite (structured local file store)
*   **Server Framework:** Node.js + Express (Scaffold setup ready)

---

## 📁 Repository Structure

```directory
Cargo-office-management-system/
├── frontend/                     # React + Vite Client App
│   ├── src/
│   │   ├── components/
│   │   │   └── layout/          # DashboardLayout (Sidebar & top Navbar)
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Authentication state & provider
│   │   ├── data/
│   │   │   └── mockData.js      # Consolidated sample store (Shipments, Invoices, Users)
│   │   ├── pages/
│   │   │   ├── auth/            # Login, SignUp, Forgot/Reset Password
│   │   │   ├── cargo/           # Shipments lists & Real-time tracking
│   │   │   ├── customers/       # Customer directories
│   │   │   ├── dashboard/       # Operations dashboard
│   │   │   ├── finance/         # Financial registry
│   │   │   ├── profile/         # My Profile (Stitch layout)
│   │   │   ├── users/           # User administration
│   │   │   ├── warehouse/       # Warehouse inventory condition logs
│   │   │   └── NotFound.jsx     # 404 error page (Stitch Container layout)
│   │   ├── App.jsx              # Routing configurations
│   │   ├── index.css            # Stylesheets with Stitch font, animation & color tokens
│   │   └── main.jsx             # Entry point
│   ├── tailwind.config.js       # Extended design tokens matching Stitch prototype
│   └── package.json
│
└── backend/                      # Node.js + Express Server Scaffolding
    ├── prisma/
    │   ├── dev.db               # SQLite local database
    │   └── schema.prisma        # Prisma Relational Schema Definitions
    ├── .env                     # Server port and database source URL configuration
    └── package.json
```

---

## ⚙️ Quick Start Guide

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### 1. Launch the Frontend
Navigate to the frontend folder, install the packages, and fire up the Vite development server:
```bash
cd frontend
npm install
npm run dev
```
The client app will launch locally at **http://localhost:5173/**.

### 2. Configure the Backend Database
Navigate to the backend directory, install the packages, and synchronize your local SQLite database with the Prisma schema layout:
```bash
cd ../backend
npm install
npx prisma db push
```

---

## 🔐 Mock Credentials (For testing)

You can log into the workspace using any of the default mock accounts below:

| Role | Username / Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@logiflow.com` | `admin123` |
| **Operations Staff** | `ops@logiflow.com` | `ops123` |
| **Finance Staff** | `finance@logiflow.com` | `finance123` |
| **Customer Service** | `cs@logiflow.com` | `cs123` |
| **Warehouse Operator** | `warehouse@logiflow.com` | `warehouse123` |

To trace a sample parcel without logging in, click **"Track a Parcel"** on the login page, then search using one of these mock codes:
*   `LOG-2401` (In Transit timeline)
*   `LOG-2402` (Delivered timeline)
*   `LOG-2398` (Delayed timeline)