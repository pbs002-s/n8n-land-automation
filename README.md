# n8n Land Automation

Automation layer for the **Bangladesh Digital Land Platform**.

n8n connects the backend, PostgreSQL/PostGIS, payment services, notifications, and land-service APIs to automate repetitive workflows.

## Main Automations

* 💳 **Payment Reconciliation** — verifies land-tax payments and prevents duplicate payments.
* 🔔 **Property Activity Alerts** — notifies owners when important activity happens on their land.
* 🔍 **Land Data Reconciliation** — detects mismatches between Khatian, Dag, Holding, Tax, Mutation and Map data.
* 🔄 **Mutation Status Tracking** — automatically updates citizens when mutation status changes.
* 📅 **Tax Reminders** — sends upcoming/overdue land-tax reminders.
* 📄 **Document Organization** — classifies and links uploaded land documents to parcels.
* 📨 **Complaint Routing** — sends complaints to the appropriate office/team.
* 📜 **Land Timeline** — records important events for each parcel.
* 🧾 **Dakhila/Receipt Automation** — starts the receipt workflow after confirmed payment.
* ❤️ **System Monitoring** — monitors APIs and services and alerts administrators when something fails.

## Architecture

```text
Frontend
   ↓
Backend API
   ↓
PostgreSQL + PostGIS
   ↓
n8n Automation
   ├── Payment APIs
   ├── Land-service APIs
   ├── SMS / Email / Push
   └── Document Services
```

## Core Identifier

All workflows use:

```text
BD Parcel ID
```

Example:

```text
BD-DHK-SAV-000001
```

The Parcel ID connects:

`Khatian → Dag → Holding → Ownership → Mutation → Tax → Map → Documents → History`

## Important

n8n is **not** the source of truth for land ownership or cadastral information.

The main backend and official government records remain authoritative.

n8n only handles:

**Events → Automation → Validation → Database updates → Notifications → Audit logs**
