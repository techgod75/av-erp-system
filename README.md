# AV ERP System

A lean, cost-effective ERP/CRM starting point tailored for Audio-Visual trading, rental operations, service management, and GST-aware accounting for Indian businesses.

## What is included

- AV inventory domain for trading and rental/service items
- Sales and purchase workflows
- Double-entry ledger posting engine
- GST report generation (GSTR-1, GSTR-2B, GSTR-3B)
- OCR-based vendor invoice draft flow
- GSTIN lookup-ready module design
- Multi-role RBAC access model
- Progressive web app dashboard for mobile and desktop
- API-first architecture ready for real deployment

## Architecture

- Frontend: Next.js + TailwindCSS + PWA-ready UI
- API: Node.js + Express + TypeScript
- Database: PostgreSQL (Prisma-ready schema included)
- Storage: local file system or S3-compatible storage for documents
- Hosting: single VPS deployment with PostgreSQL and Nginx

## Quick start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

### 3. Run the app

```bash
npm run dev
```

This starts:
- API on http://localhost:4000
- Web app on http://localhost:3000

## Key modules

### Inventory and sales
- Customer master
- Vendor master
- Inventory items with trading and rental/service flags
- Quote to invoice flow
- Tax invoice generation with GST split

### Financial engine
- Ledger account structure
- Real-time posting rules
- Cash/bank and debtor/creditor balances
- Journal entries and audit trail

### GST and compliance
- GSTR-1 outward summary
- GSTR-2 / 2B reconciliation support
- GSTR-3B monthly summary payload
- Excel and JSON export-ready data

### Service operations
- Service tickets
- AMC tracking
- Engineer allocation
- Site reports

### OCR intake
- Vendor invoice upload flow
- OCR extraction with local fallback
- Low-cost LLM fallback for low-confidence extraction
- Draft purchase invoice creation for review

## Recommended deployment stack

- 1 VPS, 2 vCPU, 4 GB RAM is enough for MVP workloads
- PostgreSQL on the same machine or nearby managed instance
- Nginx for reverse proxy
- PM2 or systemd for process management
- Optional Redis for queueing or cache

## Core business logic summary

### Sales invoice posting
- Debtor A/c Dr
- Sales A/c Cr
- CGST/SGST or IGST Output A/c Cr

### Purchase invoice posting
- Inventory or Expense A/c Dr
- Input GST A/c Dr
- Creditor A/c Cr

### Role access summary
- Admin: full access and deletion rights
- Sales: quotations and stock visibility only
- Technician: service execution only
- Accountant: invoice validation and GST reports only

## Files in this repo

- `apps/api`: Express API with domain logic and demo data
- `apps/web`: Next.js front-end for dashboard and operations
- `packages/db/prisma/schema.prisma`: PostgreSQL schema blueprint
- `docs/`: functional domain and GST planning documents

## License

MIT
