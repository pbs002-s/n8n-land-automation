# 🇧🇩 Land Automation & Cadastral GIS Platform (ভূমি সেবা পোর্টাল)

An enterprise cadastral land management, spatial vector audit, e-mutation tracking, and automated Land Development (LD) Tax payment platform built for Bangladesh land administration.

---

## 🌟 Key Features

- **Authoritative UPID & Ownership Ledger**: Citizen NID and holding record management with automated measurement conversions (Decimals, Sq Ft, Katha).
- **Cadastral PostGIS GIS Map**: Vector boundary overlay against RS Mouza sheets with WGS84 projection (`EPSG:4326`).
- **Data Cross-Audit**: Multi-source reconciliation engine comparing e-Parcha, DLRS GIS Cadastre, and Sub-Registry Deeds.
- **e-Mutation Tracker**: 4-stage AC (Land) judicial hearing lifecycle tracking with automated DCR generation.
- **LD Tax & Digital Dakhila**: Instant tax settlement gateway simulation (bKash/Nagad/Ekpay) issuing cryptographically verifiable QR digital receipts.
- **Automation Hub**: Event-driven n8n webhook listeners & PostgreSQL change data capture (CDC) pipelines.
- **Nova UI / Night Mood**: Full-screen minimalist theme, dark/light mood toggle, and crisp Bengali typography (`Anek Bangla`).

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, HTML5 Canvas.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM.
- **Database**: PostgreSQL 15 + PostGIS Spatial Extension.
- **Automation**: n8n Webhook & Event-driven workflows.

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- [Node.js (v18+)](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/)
- [Git](https://git-scm.com/)

### 2. Start PostGIS Database
```bash
docker-compose up -d
```
> Runs PostgreSQL + PostGIS on `localhost:5433`.

### 3. Setup & Start Backend
```bash
cd backend
npm install
npx prisma db push
npm run prisma:seed
npm run dev
```
> Backend API will be running on `http://localhost:5000`.

### 4. Setup & Start Frontend
```bash
cd ../frontend
npm install
npm run dev
```
> Frontend web app will be running on `http://localhost:5173`.

---

## 📄 License
MIT License.
