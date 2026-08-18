# Bangladesh Digital Land Platform
## Bangladesh-Only Feature Guide — Features, Problems, Improvements & Where to Find Them

| | |
|---|---|
| **Document type** | Feature guide & improvement blueprint (Bangladesh only) |
| **Date** | 17 August 2026 |
| **Version** | 3.0 (Bangladesh-only edition) |
| **Scope** | Every current Bangladesh land feature — what it does, **which app/website it lives on**, the problem citizens face using it, and how to improve it. All foreign/international benchmarking has been removed. |

### How to read this document

For **each Bangladesh land feature** you will find the same four things, in the same order:

1. **What it is** — the current government capability.
2. **Where to find it** — the exact app or website (with the link).
3. **Problem** — what makes it hard to use today.
4. **Improvement** — how to make it better.

> Note on figures: all coverage/progress numbers are government-programme statistics as of the date cited. They change often — re-check them at the source link before using them for any decision.

---

## Table of Contents

1. Executive Summary
2. Where to Find Everything (quick app/website reference)
3. e-Mutation / নামজারি
4. Land Development Tax / ভূমি উন্নয়ন কর
5. Online Land Payment
6. Digital Land Maps & the Bangladesh Digital Survey (BDS)
7. Land History
8. Acquisition & Compensation
9. Lease & Settlement
10. Revenue Cases
11. Complaint & 16122 Support
12. Main Bangladesh Gaps
13. Proposed "My Land Bangladesh" Product
14. Technical Architecture, Database, PostGIS, Mapping, APIs
15. Security & Trust
16. Implementation Roadmap
17. Priority Feature Matrix
18. What NOT to Do
19. Core Product Concept
20. Conclusion
21. Appendix — Bangladesh Verified Figures & Sources

---

## 1. Executive Summary

Bangladesh has already built a substantial digital land-service ecosystem. The Ministry of Land groups services around **mutation, land-development tax, land records and maps, acquisition, lease/settlement, land administration, revenue cases, land-information services, and complaint/technical support**.

So the main problem is **not the absence of digital services**.

The bigger problem is that the citizen experience is still **service-centric and identifier-centric**:

> "Which service do I need?" → "Which khatian/dag/holding do I enter?" → "Which website do I use?" → "Where is my application now?"

A stronger future model is **parcel-centric**:

> **One land parcel → one persistent Parcel ID → one map → one ownership view → one history → one tax account → one document vault → one transaction timeline → one alert system.**

The opportunity for Bangladesh is to **connect and modernize what already exists**, rather than build yet another isolated land portal.

---

## 2. Where to Find Everything (quick app/website reference)

This is the single most-asked question — *"where do I actually find this?"* Here is every official Bangladesh land feature and the app or website it lives on.

| Feature | Where to find it (app / website) | Link |
|---|---|---|
| Main entry point (all services) | Ministry of Land website | https://www.land.gov.bd/ |
| Citizen services list (Bangla) | Ministry of Land — নাগরিক সুবিধা | https://land.gov.bd/nagorik-subidha?lang=bn |
| e-Mutation / নামজারি | **Web:** mutation portal • **App:** "নামজারি" (Android, Google Play) | https://mutation.land.gov.bd/ |
| Land Development Tax | LDTax portal | https://ldtax.gov.bd/ |
| Land Development Tax — how-to manual | LDTax citizen user manual | https://traininglims.land.gov.bd/limslrb/ldtax/citizen/user_manual |
| Online land-tax payment | LDTax portal + bKash | https://www.bkash.com/en/products-services/land-tax |
| Digital land map | Smart Bhumi Naksha (map portal) | https://map.land.gov.bd/ |
| Complaint / technical support | Land Service Hotline — **call 16122** or web | https://hotline.land.gov.bd/ |
| Service manuals / guides | Ministry of Land manual | https://www.land.gov.bd/manual |

Everything below explains each of these in detail.

---

## 3. e-Mutation / নামজারি

### What it is
Bangladesh provides an official e-Mutation workflow with online application and supporting-document handling. Current capability includes online application, document upload, fee payment, application tracking, online hearing/processing components, and digital/QR-verifiable mutation documents.

**Verified scale and performance:**

| Metric | Value | Note |
|---|---|---|
| Applications filed nationally | ~22 lakh (≈2.2 million) per year | Ministry of Land e-Namjari app listing |
| Statutory processing window | 45 working days | 2025 Ministry circular directing AC Land offices to prioritise online applications |
| Governing law | Land Reforms Ordinance 1984 | Sets the 60-bigha agricultural ownership ceiling that mutations are checked against |
| Channel | mutation.land.gov.bd + "নামজারি" Android app | In-person hearing and DCR collection are still typically required |

### Where to find it
- **Website:** https://mutation.land.gov.bd/
- **Mobile app:** "নামজারি" (e-Namjari) on Google Play
- **Guidance:** Ministry of Land manual — https://www.land.gov.bd/manual

### Problem
The workflow still makes citizens think in government data structures — **khatian, dag, mouza, land amount, mutation type, documents**. The citizen's real mental model is much simpler:

> "I bought / inherited / got this property. I want the government record updated."

### Improvement
Create a **Mutation Wizard** that starts from the property, not the paperwork:

```text
Select My Property
        ↓
Choose reason (Purchase / Inheritance / Gift / Partition)
        ↓
Government data auto-loaded
        ↓
Upload only the missing evidence
        ↓
Pay
        ↓
Track progress
        ↓
Receive verified result
```

---

## 4. Land Development Tax / ভূমি উন্নয়ন কর

### What it is
Bangladesh has a dedicated online Land Development Tax platform. Registration uses mobile number, NID number, NID date of birth, and Dakhila / Kharij-Khatian information. It supports online tax assessment/payment, with assisted service through Union Digital Centres.

### Where to find it
- **Website:** https://ldtax.gov.bd/
- **User manual:** https://traininglims.land.gov.bd/limslrb/ldtax/citizen/user_manual

### Problem
The portal's own dashboard exposes the relationship between khatian entries and holding entries, and the reconciliation rates are **not yet 100% across divisions**. In short:

> **A digital UI is not the same as clean digital data.**

### Improvement
Build a **Land Data Reconciliation Engine** that continuously cross-checks the chain:

```text
Khatian ↕ Dag ↕ Holding ↕ Mutation ↕ Parcel Geometry
```

Automatically flag: missing holding, duplicate record, area mismatch, inconsistent owner, unmapped parcel, stale record — then route exceptions to authorized human verification.

---

## 5. Online Land Payment

### What it is
Online land-tax payment exists through multiple digital channels, with digital confirmation/receipt workflows.

### Where to find it
- **LDTax portal:** https://ldtax.gov.bd/
- **bKash land-tax service:** https://www.bkash.com/en/products-services/land-tax

### Problem
The hardest problem is not a lack of payment channels — it is **payment certainty**. A citizen worries:

> "Money was deducted. Did the government actually receive it?"

### Improvement
Give every transaction a permanent reference (e.g. `BD-LAND-TX-2026-0001938`) and a clear state machine:

```text
INITIATED → PROCESSING → CONFIRMED
INITIATED → FAILED
PROCESSING → RECONCILIATION → CONFIRMED
```

**Critical safety feature** — when status is uncertain, show:

> **Payment verification in progress. Do not pay again.**

And show a completion timeline the citizen can trust:

```text
Tax calculated       ✓
Payment initiated    ✓
Gateway confirmed    ✓
Treasury confirmed   ✓
Tax account updated  ✓
Dakhila generated    ✓
```

---

## 6. Digital Land Maps & the Bangladesh Digital Survey (BDS)

### What it is
Bangladesh already has meaningful digital mapping work **and** a live national cadastral re-survey — the most important piece of real infrastructure for a parcel-centric platform.

**Mouza and Plot Based National Digital Land Zoning Project:**

| Metric | Figure |
|---|---|
| Mouzas covered | 56,348 |
| Unions covered | 4,562 |
| Upazilas covered | 493 (all 64 districts) |
| Map sheets scanned/geo-referenced/field-checked | 1,38,412 |
| Purpose | Classify land use (agricultural, residential, forest, waterway, industrial, tea garden, coastal, grazing, etc.) to protect arable land and support planning |

The **Smart Bhumi Naksha** citizen map built on this already supports plot viewing, land-use info, location-based mouza/plot lookup, plot search and area information.

**Bangladesh Digital Survey (BDS)** — a full re-survey of the national cadastre using satellites, drones/UAVs, GNSS and Ground Control Stations, run under the EDLMS project by DLRS (with South Korean technology partners). It:
- Replaces the old paper-based survey with a geo-referenced one
- Implements a **"1 person, 1 khatian, 1 dag"** consolidation policy
- Produces geo-referenced mouza maps that update as mutation records change
- Is designed as a module of the National Land Service Automation System

**Verified rollout status:**

| Metric | Figure |
|---|---|
| First-phase pilot area | Chattogram, Narayanganj & Rajshahi City Corporations; Dhamrai & Kushtia Sadar upazilas; Manikganj municipality |
| Pilot coverage | 634 mouzas across 933 sq km |
| Geo-referencing points nationally | 2,60,310 across 470 upazilas (excluding three Chattogram Hill Tract districts) |
| Mouza-map database | 1,33,188 mouza maps |
| Reported progress (EDLMS/BDS) | ~37% (Ministry briefing, pre-2026) |
| Target completion | 2026 |

BDS is the mechanism that makes a stable, geo-referenced **Parcel ID** possible at national scale — the real-world prerequisite for the "BD Parcel ID" idea in this report, not a hypothetical.

### Where to find it
- **Smart Bhumi Naksha map:** https://map.land.gov.bd/

### Problem
The map is valuable, but today it works like a **separate lookup tool**. It should be the **entry point to the whole property record**.

### Improvement
Make the map the front door to the land record:

```text
Open Map → Tap Parcel → Parcel ID → Owner / ownership status
        → Khatian / Dag → Mutation → Tax → Documents
        → History → Restrictions → Recent activity
```

**Architecture rule:** never treat Google Maps or another commercial basemap as the authoritative cadastral source. Use official cadastral/survey data as the authoritative parcel geometry, and use Google Maps / Mapbox / MapLibre / OSM only as a visualization/context layer. Also provide controlled APIs so authorized third parties can query a parcel and get its record.

---

## 7. Land History

### What it is
Bangladesh's digital-land objectives include online access to land/ownership/dag history.

### Where to find it
- Accessed via the Ministry of Land service ecosystem — https://www.land.gov.bd/ and https://land.gov.bd/nagorik-subidha?lang=bn

### Problem
A **list of documents is not the same as an understandable history**.

### Improvement
Show a **Land Timeline** where every event carries date, authority, Parcel ID, what changed, supporting document and verification status:

```text
1998  Survey record
2007  Purchase registered
2008  Mutation completed
2018  Record correction
2024  Land tax paid
2026  New application
```

Also expose **three clear states** of property information so a buyer or owner always knows the real position:
- **CURRENT** — who owns it now
- **HISTORICAL** — what happened previously
- **PENDING** — what has been lodged but not yet finalized

This makes suspicious or inconsistent events much easier to spot.

---

## 8. Acquisition & Compensation

### What it is
Bangladesh has a dedicated acquisition/requisition service area, and official descriptions include digitization of acquisition information and compensation-related services. Some parts have been described as under construction/development.

### Where to find it
- Under the Ministry of Land service areas — https://www.land.gov.bd/

### Problem
Citizens often can't see where their acquisition case stands or who is handling it.

### Improvement
Provide a citizen-facing **Acquisition Case Timeline**:

```text
Notice issued → Parcel verified → Valuation → Compensation calculated
→ Approval → Payment → Completed
```

The citizen should always know: **What happened? What happens next? Who is handling the case?**

---

## 9. Lease & Settlement

### What it is
The Ministry includes lease/settlement among its land-service areas, with ongoing digitalization efforts.

### Where to find it
- Under the Ministry of Land service areas — https://www.land.gov.bd/

### Problem
The lease/settlement journey is not transparent end-to-end.

### Improvement
Build a clear, trackable flow (with transparent status where legally appropriate):

```text
Available land → Eligibility → Application → Verification
→ Selection / auction → Payment → Lease → Renewal
```

---

## 10. Revenue Cases

### What it is
Land revenue cases are an official service area.

### Where to find it
- Under the Ministry of Land service areas — https://www.land.gov.bd/

### Problem
A case is shown mostly as an abstract case number (e.g. `Case ID: 2026-XXXXX`) instead of being tied to the actual property.

### Improvement
Link every case directly to the parcel:

```text
Case → Parcel ID → Land involved → Issue → Parties
→ Documents → Hearings → Order → Current status
```

This creates a parcel-centric legal/administrative history.

---

## 11. Complaint & 16122 Support

### What it is
Bangladesh provides land-service support through **16122**, including complaint and technical-support pathways.

### Where to find it
- **Call:** 16122
- **Web:** https://hotline.land.gov.bd/
- **Manual:** https://www.land.gov.bd/manual

### Problem
Support usually starts **after** something has already gone wrong, and it's hard to track.

### Improvement
Create a **Land Service Case Management** system so support is measurable and transparent:

```text
Problem → Select parcel → Select affected service → Describe issue
→ Attach evidence → Case number → Officer/office assigned
→ SLA/status tracking → Resolution
```

---

## 12. Main Bangladesh Gaps

| # | Gap | Fix |
|---|---|---|
| 1 | No single parcel-centric experience | BD Parcel ID + My Land dashboard |
| 2 | Fragmented identifiers | Keep existing IDs internally, expose one stable **Parcel ID** |
| 3 | Incomplete reconciliation | Continuous data-quality/reconciliation service |
| 4 | Maps aren't the universal property interface | Make the map the front door to the land record |
| 5 | Weak proactive notification model | Property Activity Alerts |
| 6 | History less intuitive than it could be | Timeline + document links + change explanation |
| 7 | Payment uncertainty | Transaction ID + reconciliation + "do not pay again" + auto receipt |
| 8 | Application-centric UX | Start from the citizen's property, not the service |
| 9 | Limited interoperability | Common APIs around Parcel ID + authorization |
| 10 | Limited property-intelligence view | One Property Profile: Map, Ownership, Tax, Mutation, History, Documents, Restrictions, Alerts |

---

## 13. Proposed "My Land Bangladesh" Product

### Home
```text
MY LAND
3 Properties
1 Tax Due
1 Application in Progress
2 Recent Alerts
```

### Property card
```text
Savar Property — 5.00 Decimal
Ownership ✓   Mutation ✓   Tax ✓   Map ✓
Documents 8   History 12 events
[Open Property]
```

### Property Profile
```text
PARCEL BD-DHK-SAV-000001
Location        Savar, Dhaka
Recorded area   5.00 decimal
Mapped area     5.02 decimal
Ownership       Verified
Mutation        Completed
Land tax        Paid
Restrictions    No active record-based alert
Documents       8
History         12 events
Recent activity None
```
> A mapped-area comparison is a **verification flag**, not proof of a legal boundary discrepancy.

### Land Verification / Risk Report
```text
LAND RECORD CHECK
Ownership 🟢  Parcel geometry 🟢  Tax status 🟢  Mutation 🟢
Historical records 🟢  Pending activity 🟡  Restrictions 🟡  Document consistency 🟢
Record-based status: REVIEW RECOMMENDED
```
> Never market this as a legal guarantee. Suggested disclaimer: *"This report summarizes available government-record signals and does not replace legal due diligence, survey verification or professional advice."*

### Improved Payment Experience
```text
Before:  Tax ৳1,220 + charge ৳30 = ৳1,250  [Pay]
Uncertain:  "Your payment may have been received. Do NOT pay again."  TX: BD-LAND-TX-2026-0001938
After:   ✓ Government payment confirmed  ✓ Tax account updated  ✓ Dakhila generated
```

### Property Activity Alerts
```text
PROPERTY ALERT — New official activity detected
Parcel:   BD-DHK-SAV-000001
Activity: Mutation application
Time:     17 Aug 2026     [Review]
```
Alerts could cover mutation applications, ownership changes, record corrections, mortgage/charge events, and other defined official activity. The alert should say **"activity detected,"** not automatically label it fraud.

### Land Transaction Workspace
A collaborative space to run a full sale/transfer in one place:
```text
Seller ✓  Buyer ✓  Parcel ✓  Documents ✓  Tax ✓  Bank ✓
Registration →  Mutation →  Settlement →
```

### Satellite & GIS Intelligence (monitoring layer, not an ownership source)
Land-use change, water-body change, urban expansion, erosion/accretion, infrastructure change, government-land monitoring. Possible stack: PostGIS, GeoJSON/vector tiles, Sentinel/Landsat (or other authorized imagery), Google Earth Engine (within licensing), MapLibre/Mapbox.
> Satellite imagery is evidence for monitoring, **not** proof of legal ownership or cadastral boundary.

---

## 14. Technical Architecture, Database, PostGIS, Mapping, APIs

### Recommended architecture
```text
USER → MY LAND APP → { MAP, PROPERTY PROFILE, TAX } → BD PARCEL ID
   → { Ownership, Mutation, Documents, History, Tax, Restrictions }
   → ALERT ENGINE → CASE MANAGEMENT → API / SERVICES → GOVERNMENT SYSTEMS
```

### Suggested database model
Core table `land_parcel`: parcel_id, district, upazila, mouza, jl_number, dag_number, area_recorded, geometry, status, created_at, updated_at.

Related tables: parcel_owners, ownership_history, khatian_records, mutation_records, land_tax_records, deeds, survey_records, restrictions, court_cases, acquisition_cases, lease_records, payments, documents, notifications, audit_logs.

Everything links through **`parcel_id`**.

### PostGIS
A strong fit — it extends PostgreSQL with geographic types, spatial operations and indexing (parcel polygons, point-in-polygon, area calculation, geometry comparison, proximity search, spatial filtering/indexes). Source: https://postgis.net/

### Mapping
Use authoritative Bangladesh GIS → PostGIS → vector tiles → MapLibre / Mapbox / Google Maps for display only. Google Maps/OSM are context layers, **not** the authoritative land registry, and don't derive a cadastral dataset by tracing commercial imagery.

### API architecture
Controlled, role-based, privacy-aware APIs around Parcel ID:
```http
GET /parcels/{parcelId}
GET /parcels/{parcelId}/ownership
GET /parcels/{parcelId}/map
GET /parcels/{parcelId}/tax
GET /parcels/{parcelId}/mutation
GET /parcels/{parcelId}/history
GET /parcels/{parcelId}/documents
GET /parcels/{parcelId}/restrictions
GET /parcels/{parcelId}/alerts
```
Not all ownership/personal information should be public.

---

## 15. Security & Trust

- **Identity:** strong authentication for high-risk actions.
- **MFA:** especially for ownership-changing activities.
- **Audit log:** WHO / WHAT / WHEN / WHICH PARCEL / WHICH RECORD / WHAT CHANGED.
- **Digital signatures:** use legally recognized signing infrastructure where appropriate.
- **Document verification:** QR/verification code → official validation endpoint.
- **Role-based access:** citizen, land officer, surveyor, bank, lawyer/conveyancer, government agency.
- **Privacy:** expose only data appropriate to the user and legal purpose.

---

## 16. Implementation Roadmap

- **Phase 1 — Data foundation:** parcel schema, Parcel ID, PostGIS, GIS ingestion, khatian/dag/holding relationships, data-quality checks. *Goal: one digital identity for land.*
- **Phase 2 — Citizen platform:** My Land, property profile, interactive map, documents, timeline. *Goal: property (not service) at the center.*
- **Phase 3 — Service integration:** tax, mutation, payment, document verification, complaints, case tracking. *Goal: existing services feel like one system.*
- **Phase 4 — Trust & security:** activity alerts, payment reconciliation, MFA, audit logs, digital signatures, document verification. *Goal: trustworthy digital transactions.*
- **Phase 5 — Intelligence:** satellite change detection, land-use layers, area-discrepancy detection, anomaly detection, property-risk screening, planning tools. *Goal: a land-intelligence system.*
- **Phase 6 — Ecosystem:** controlled APIs for banks, legal professionals, surveyors, property companies, developers, government agencies, authorized apps. *Goal: interoperable land data.*

---

## 17. Priority Feature Matrix

| Feature | Value | Difficulty | Priority |
|---|---:|---:|---:|
| BD Parcel ID | 10/10 | High | 🔥 P0 |
| My Land dashboard | 10/10 | Medium | 🔥 P0 |
| Parcel-centric map | 10/10 | High | 🔥 P0 |
| Data reconciliation | 10/10 | Very High | 🔥 P0 |
| Land Timeline | 9/10 | Medium | P1 |
| Payment reconciliation | 9/10 | High | P1 |
| Property alerts | 10/10 | Medium/High | P1 |
| Mutation wizard | 9/10 | Medium | P1 |
| Document vault | 8/10 | Medium | P1 |
| Transaction workspace | 10/10 | Very High | P2 |
| API ecosystem | 9/10 | High | P2 |
| Satellite intelligence | 8/10 | High | P2 |
| 3D visualization | 5/10 | High | P3 |

---

## 18. What NOT to Do

Do not create another isolated tax portal, mutation portal, map viewer, payment page or document repository. Bangladesh already has substantial pieces of these. The higher-value product is the **integration layer**.

---

## 19. Core Product Concept

### Bangladesh Parcel-Centric Digital Land Platform
> **One Parcel. One Identity. One History. One Trusted View.**

**Citizen sees:** MAP → PARCEL → OWNER → DOCUMENTS → MUTATION → TAX → HISTORY → RESTRICTIONS → PAYMENT → ALERTS

**Government gets:** cleaner data → better interoperability → lower duplication → better auditability → faster services → better planning → fraud-detection support

---

## 20. Conclusion

Bangladesh already has strong building blocks: **e-Mutation + Land Development Tax + digital maps + land history + digital documents + 16122 support**, plus the live BDS re-survey that will make a national Parcel ID real.

The strategic shift is from:

```text
OLD MODEL:  Service → Form → Record → Payment

TARGET MODEL:
                  PARCEL ID
     ┌───────────────┼────────────────┐
 Ownership          Map              Tax
     ├───────────────┼────────────────┤
 Mutation         History         Documents
     └───────────────┼────────────────┘
              Alerts & Security
                     ▼
             Digital Transactions
```

**The goal is not another land website.** The goal is a **parcel-centric national digital land platform** that connects Bangladesh's existing land services into one understandable, auditable, trustworthy property experience.

---

## 21. Appendix — Bangladesh Verified Figures & Sources

### Key verified figures

| Programme | Figure | As of |
|---|---|---|
| e-Namjari (mutation) applications, nationally | ~22 lakh (2.2M) per year | Ministry of Land / e-Namjari app listing |
| e-Namjari statutory processing window | 45 working days | 2025 Ministry circular |
| National Land Zoning Project coverage | 56,348 mouzas, 4,562 unions, 493 upazilas, 64 districts | Ministry of Land project document |
| National Land Zoning map sheets | 1,38,412 | Ministry of Land project document |
| BDS pilot-phase coverage | 634 mouzas, 933 sq km | Nov 2023 |
| BDS national geo-referencing points target | 2,60,310 across 470 upazilas | Ministry of Land briefing |
| BDS/EDLMS reported progress | ~37% | Ministry of Land briefing (pre-2026) |
| BDS target completion | 2026 | Land Ministry direction to EDLMS project |

> Re-verify all figures at the primary source before using them for planning, funding or academic work — Bangladesh's land-digitisation programmes are updated frequently.

### Bangladesh official portals & apps
- Ministry of Land: https://www.land.gov.bd/
- Citizen services (Bangla): https://land.gov.bd/nagorik-subidha?lang=bn
- e-Mutation portal: https://mutation.land.gov.bd/  •  App: "নামজারি" on Google Play
- Land Development Tax portal: https://ldtax.gov.bd/
- LDTax user manual: https://traininglims.land.gov.bd/limslrb/ldtax/citizen/user_manual
- Smart Bhumi Naksha (map): https://map.land.gov.bd/
- Smart Bhumi Naksha privacy policy: https://map.land.gov.bd/land-zoning/privacy-policy
- Land Service Hotline (16122): https://hotline.land.gov.bd/
- Ministry of Land manual: https://www.land.gov.bd/manual
- bKash land-tax service: https://www.bkash.com/en/products-services/land-tax

### Bangladesh news & project reporting
- Bangladesh Post — "Journey of digital land survey officially begins in Bangladesh"
- Bangladesh Post — "Bangladesh digital survey will help reduce public sufferings: Minister"
- The Business Standard — "Land minister launches Bangladesh Digital Survey in Chattogram"
- The Business Standard — "Digital land survey to be completed soon: Minister"
- Daily Country Today — "Land Minister directs to complete BDS operations under EDLMS project by 2026"
- The Financial Express — "Digital push aims to revolutionise land management"
- United News of Bangladesh (UNB) — "Bangladesh to automate land management and services"
- Dhaka Tribune (archive) — "Bangladesh to automate land management and services"

### Technology reference
- PostGIS: https://postgis.net/

---

*Compiled from publicly available Bangladesh government sources and news reporting current as of 17 August 2026, alongside original product-design recommendations. All international/foreign benchmarking has been removed at the reader's request. Government statistics change frequently — always confirm at the primary source before using them in a decision-making, funding or academic context.*
