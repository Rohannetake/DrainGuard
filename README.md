# 🛡️ DrainGuard — Municipal Road & Drain Hazard Management System

**DrainGuard** is a civic tech web platform designed for Pune City to streamline the reporting, tracking, and resolution of urban infrastructure hazards such as open drains, overflowing drains, and road potholes.

The application connects **Citizens**, **Municipal Workers**, and **City Administrators** into a single unified workflow powered by **React 19**, **TypeScript**, **Vite**, and **Supabase**.

---

## 🌟 Key Features

### 🏙️ 1. Public Dashboard & Tracking
* **Real-time Case Snapshot:** View active unresolved complaints and solved cases across Pune localities.
* **Instant Case Search:** Track any complaint by its unique ID (e.g., `RNE-PUN-2026-0048`) or filter by case status (`?filter=unsolved`, `?filter=solved`).
* **Citizen Feedback & Escalations:** Lodge formal escalations for unresolved issues or submit case-specific service feedback.

### 👤 2. Citizen Portal
* **Multi-Step Complaint Filing:** Guided 3-step reporting wizard (Locality & Hazard $\rightarrow$ Description $\rightarrow$ Proof & Attention).
* **Location Verification:** Mandatory Pune site location selection paired with illustrative municipal drain identifiers.
* **Multi-Photo Proof Upload:** Attach up to 8 site photos with instant browser preview, file validation (max 5 MB JPEG/PNG/WebP), and removal.
* **Voice Recording & Audio Upload:** Record voice complaints directly via browser microphone (`MediaRecorder API`) or upload audio files (MP3, WAV, WebM, M4A up to 10 MB) for accessible complaint creation.
* **Citizen Satisfaction Confirmation:** Citizens confirm their satisfaction independently from administrative case resolution.

### 🛠️ 3. Municipal Worker Portal
* **Duty Status Toggle:** Switch between *On Duty* and *Off Duty* modes.
* **Assigned Repair Tasks:** View assigned repair sites, location coordinates, drain cover IDs, and task details.
* **Material & Work Completion:** Requisition repair materials, verify site covers, submit completion records, and log repair history.

### 👑 4. Administrator / Officer Portal
* **City-Wide Analytics:** Review Pune municipal statistics and high-attention hazard cases.
* **Case Approval & Worker Assignment:** Review incoming citizen reports, assign tasks to workers, or record rejection reasons.
* **Regional & Asset Management:** Manage Pune localities and PIN code mappings.

---

## 🏗️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 19 + TypeScript 6 |
| **Build Tool & Bundler** | Vite 8 |
| **Routing** | React Router DOM v7 |
| **Backend & Database** | Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth (Role-Based: Citizen, Worker, Admin) |
| **File Storage** | Supabase Storage (Private buckets for photos & audio) |
| **Styling & UI** | Custom CSS with Theme Toggle (Light/Dark) & Font Scaling |
| **Code Quality & Linting** | Oxlint & TypeScript Strict Check |

---

## 🗄️ Database Architecture & Security

The backend is built on **Supabase** with strict **Row Level Security (RLS)** and role-based access control.

```
📁 Database Tables
 ├── profiles              ── User profiles linked to auth.users (roles: citizen, worker, admin)
 ├── regions               ── Pune locality listings and PIN code mappings
 ├── complaints            ── Hazard reports with site coordinates, status & operational fields
 └── complaint_attachments ── File metadata linking photo and audio storage objects

📁 Storage Buckets (Private)
 ├── complaint-photos      ── Max 5 MB per photo (image/jpeg, image/png, image/webp)
 └── complaint-audio       ── Max 10 MB per audio clip (audio/mpeg, audio/wav, audio/webm, etc.)
```

### 🔒 Security Implementations
1. **Row Level Security (RLS):** Enabled across all database tables. Public/anonymous access is completely revoked.
2. **Defensive SQL Triggers:** Database triggers prevent citizens from tampering with operational fields (status, worker assigned, rejection reasons).
3. **Storage Isolation:** Files are stored under user-scoped paths (`{user_id}/{complaint_id}/{filename}`), preventing unauthorized user writes.
4. **`SECURITY DEFINER` Functions:** Custom SQL functions operate with explicit `search_path = public` to protect against path high-jacking.

---

## 📂 Project Directory Structure

```
DrainGuard/
├── public/                    # Static assets & SVG icons
├── src/
│   ├── assets/                # Images and illustrations
│   ├── components.tsx         # Reusable UI components (Header, Footer, Badges, Modals)
│   ├── context.tsx            # Global AppContext (Session, Theme, Complaints, Regions state)
│   ├── data.ts                # Pune locality seeds and mock initial datasets
│   ├── index.css              # Global design system & theme variables
│   ├── main.tsx               # Application entry point
│   ├── pages-citizen.tsx      # Citizen home & multi-step complaint filing forms
│   ├── pages-public.tsx       # Public dashboard, auth pages, status tracking, feedback
│   ├── pages-staff.tsx        # Worker and Administrator portal dashboards
│   ├── types.ts               # Core TypeScript definitions
│   └── lib/
│       ├── api.ts             # Supabase database CRUD & storage upload operations
│       └── supabase.ts        # Supabase client setup & credential validator
├── supabase/
│   └── migrations/            # SQL migration scripts (Tables, RLS, Storage Buckets)
├── .env.example               # Template for environment variables
├── package.json               # Node dependencies and scripts
├── tsconfig.json              # TypeScript configuration
└── vite.config.ts             # Vite build configuration
```

---

## 🚀 Getting Started

### 1. Prerequisites
* **Node.js** (v18.0 or higher)
* **npm** or **yarn**
* A **Supabase** account and project

### 2. Installation
Clone the repository and install project dependencies:

```bash
git clone https://github.com/Rohannetake/DrainGuard.git
cd DrainGuard
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env
```

Open `.env` and fill in your Supabase project credentials:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_PUBLIC_KEY
```

> 💡 *Note: If `.env` contains placeholder keys, DrainGuard will seamlessly run in **Demo Fallback Mode** with sample Pune datasets.*

### 4. Database Setup (Supabase)
Run the SQL migration script located in `supabase/migrations/20261009120000_stage2_schema_rls_storage.sql` inside your **Supabase SQL Editor** to create the tables, triggers, RLS policies, and storage buckets.

### 5. Running the Application

```bash
# Start local development server
npm run dev

# Run linting checks
npm run lint

# Build for production
npm run build
```

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).
