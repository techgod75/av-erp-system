# AV ERP System

A lean, cost-effective ERP/CRM system tailored for Audio-Visual trading and services businesses operating in India.

This repository is a practical starter architecture for a deployment that prioritizes:

- Open-source software and self-hosted tooling
- Minimal recurring software costs
- Fast mobile-first workflows in a PWA UI
- GST-aware ledger accounting and reporting
- Service ticket and AMC operations for AV installations and rentals
- OCR-based vendor invoice intake with low-cost fallback AI processing

## Product vision

The platform is designed for AV businesses handling:

- Trading inventory: projectors, LED walls, line arrays, microphones, mixers, cables, accessories
- Service/rental inventory: equipment checked in/out for events, tours, rentals, and site installs
- AMC and service support: tickets, engineer assignments, site reports, repair status tracking
- Commercial workflow: quotation, sales order, pro forma, tax invoice, payment receipt, bank reconciliation
- Finance: automated accounting ledger entries, GST liability, input tax credit reconciliation

## Recommended architecture

### Core stack

- Frappe/ERPNext (preferred for operational ERP + Indian accounting + GST workflows)
-or-
- Next.js + Express/NestJS + PostgreSQL + Prisma + TailwindCSS for a custom, lightweight, low-cost SaaS stack

### Why this stack

- Can run on a single VPS (
  $5–$10/month in DigitalOcean, Hetzner, or AWS Lightsail)
- Keeps dependency cost low by using open-source and free-tier services
- Enables a mobile-first PWA without native app store deployment
- Keeps custom logic manageable for GST/legal compliance and integration-specific workflows

## Repository structure

- `apps/web` – progressive web app frontend built with Next.js + Tailwind
- `apps/api` – lightweight API service and business logic layer
- `packages/db` – Prisma schema for PostgreSQL domain model
- `docs/` – domain design, accounting logic, GST plan, MVP roadmap

## Module blueprint

### 1. Sales & inventory
- Customer master
- Vendor master
- Product catalog with item type: trading vs service/rental
- Stock tracking by warehouse/site
- Serial-number and equipment availability tracking

### 2. Accounting engine
- Automated double-entry ledger posting for:
  - quotation to sales order to invoice
  - purchase order to purchase invoice
  - receipt and expense vouchers
- Real-time cash and bank balances
- Indian ledger account mapping for GST and taxation flows

### 3. GST & compliance
- GSTR-1, GSTR-2 / 2B reconciliation, GSTR-3B summary
- Excel and JSON export matching GST offline tool expectations
- GSTIN-driven customer/vendor master enrichment

### 4. Service operations
- Service tickets with SLA statuses
- AMC contracts
- Engineer allocation and work log tracking
- On-site report capture and part replacements

### 5. Invoice OCR
- Mobile and web invoice upload using camera or file
- Local OCR using Tesseract.js or lightweight Python OCR backend
- Fallback LLM interpretation for failed extractions
- Draft purchase invoice generation for review and approval

## MVP roadmap

### Phase 1 – Foundation
- Tenant-ready RBAC
- Product & customer/vendor masters
- Inventory + stock ledger
- Quotations and sales orders

### Phase 2 – Finance automation
- General ledger posting engine
- Vendor invoice intake
- GST tax code mapping
- Excel and JSON GST export

### Phase 3 – Service ops
- Service tickets and engineer assignment
- Rental availability tracking
- AMC modules and site reports

### Phase 4 – Optimization
- GSTIN lookups and master enrichment
- PWA polish, offline support, mobile UX
- Reporting dashboards and audit trails

## Quick start

### Prerequisites
- Node.js 20+
- npm 10+
- PostgreSQL 15+

### Setup

```bash
npm install
cp .env.example .env
npm run dev
```

### Docker setup

```bash
docker-compose up -d
```

## Security and governance

- RBAC by role, tenant, and module
- Restricted access to banking, vendor pricing, taxes, and settings
- Audit trails for edits and financial posting
- Manual approval gates for invoice OCR and ledger drafts

## Important recommendation

For a business needing fast deployment with compliance coverage, the best choice is usually:

1. Use Frappe/ERPNext for the accounting and compliance core if the team values a mature Indian accounting model.
2. Use a custom Next.js + PostgreSQL stack when a more tailored AV workflow, lower lock-in, and lighter deployment are the priority.

This repository intentionally favors the custom Next.js approach because it is easier to version, extend, and tailor to AV-specific workflows.

## Contribution

This is an MVP starter repository. It is designed to be extended by a product team with ERP logic, compliance modules, and lifecycle workflows specific to your industry.

## License

MIT
