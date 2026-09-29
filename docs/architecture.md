# AV ERP System

A lean ERP/CRM starter focused on AV trading, rental operations, service management, and GST-based accounting in India.

## Value

The system targets businesses with the following realities:

- Inventory includes both sales and rental/service flows
- Equipment is serialized, site-specific, and often event-driven
- Financial postings must be immediate and auditable
- GST filing and reconciliation need periodic exports in familiar formats
- Field technicians, sales staff, and finance teams need radically different access

## Domain model

### Core entities

- Customer
- Vendor
- Product / Inventory Item
- Warehouse / Location
- Sales Quotation
- Sales Order
- Proforma Invoice
- Tax Invoice
- Purchase Order
- Purchase Invoice
- Payment Receipt
- Expense Voucher
- Ledger Account
- Ledger Posting
- Journal Entry
- Service Ticket
- AMC Contract
- Site Visit / Engineer Allocation
- GST Report
- OCR Invoice Draft

## Accounting engine

The accounting engine should enforce deterministic posting rules:

- Sales invoice posting creates:
  - debtor debit
  - sales credit
  - CGST/SGST/IGST output credit
- Purchase invoice posting creates:
  - inventory/expense debit
  - GST input debit
  - creditor credit
- Receipts and payments adjust cash/bank and customer/vendor balances

Use a standard double-entry accounting framework with a ledger entry table designed for branch, cost center, and document references.

## Access model

- Owner/Admin: full access, financial visibility, tax exports, deletion rights, system settings
- Sales Team: quotations, stock visibility, customer lookups, no purchase pricing or GST reports
- Service Technicians: service tickets, site logs, status updates, no financial access
- Accountant: invoice validation, GST reports, accounting review, no system configuration changes

## GST-specific design

### GSTR-1
- B2B and B2C outward supply summaries
- HSN summary
- documents issued

### GSTR-2 / 2B reconciliation
- vendor invoice tracker
- ITC matching against vendor invoices and books
- reconciliation by GSTIN and tax amount

### GSTR-3B
- monthly summary payload for liability and ITC self-assessment

## OCR pipeline

### Tier 1: free/open-source
- Tesseract.js (web) or Python OCR pipeline with layout-parser or PaddleOCR
- Extract key fields:
  - vendor name
  - GSTIN
  - invoice number
  - invoice date
  - taxable value
  - GST amount
  - total

### Tier 2: cost-controlled fallback
- Gemini Flash / Claude Haiku structured JSON response
- Minimal cost per image via strict schema and OCR confidence gates

## GSTIN lookup strategy

Prefer official or secure government-fed endpoints when available. If those are not accessible, use a controlled API relay or internal scraper layer that fetches:

- legal name
- trade name
- registration address
- GSTIN status

Keep this service isolated and rate-limited.

## Recommended deployment

### For lowest cost
- 1 VPS with Ubuntu
- PostgreSQL database
- Nginx reverse proxy
- PM2 or systemd for process management

### For fast MVP
- Next.js frontend
- Express/Node backend
- PostgreSQL + Prisma
- PWA support for mobile and desktop browsers

## MVP priority order

1. Tenant + RBAC
2. Customer/vendor and product masters
3. Inventory + serial tracking
4. Quotation + sales order + invoice cycle
5. Purchase invoice intake + OCR drafting
6. Ledger + tax postings
7. GST exports and reports
8. Service & AMC operations

## Scalability note

The domain is modular enough that this project can begin as a lean vertical MVP and later evolve into a more complete ERP with:

- multi-branch support
- warehouse-level controls
- contract billing
- project costing
- integration with Tally or government portals
