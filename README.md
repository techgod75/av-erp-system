# AV ERP System

A lean, cost-effective ERP/CRM starter tailored for Audio-Visual trading, rental operations, service management, and GST-aware accounting for Indian businesses.

## Included in this implementation

- AV inventory domain for trading and rental/service items
- Sales and purchase workflow logic
- Double-entry accounting ledger generation
- GST summary and monthly report outputs using ledger data
- OCR invoice intake demo for vendor document capture
- RBAC-oriented role model ready for expansion
- PWA-friendly dashboard interface for desktop and mobile
- API-first architecture ready for production deployment

## Implemented modules

### Inventory and sales
- Customer master
- Vendor master
- Inventory catalog
- Quotation endpoints
- Sales invoice generation with GST logic

### Finance and ledger
- Debtor and creditor accounting logic
- GST output and input posting rules
- Trial-ready general ledger entries

### Service operations
- Ticket tracking with engineer assignment
- Site issue summaries
- Status tracking for service operations

### GST reporting
- GSTR-1 summary
- GSTR-2B summary
- GSTR-3B summary

### OCR intake
- Upload/camera-ready flow
- OCR invoice draft generation and tracking
- Approval-ready data structure for purchase invoice generation

## Running the project

```bash
npm install
cp .env.example .env
npm run dev
```

Access:
- API: http://localhost:4000
- Web: http://localhost:3000

## Recommended business deployment

- One VPS with PostgreSQL and Nginx
- Keep the app mobile-first and PWA-ready
- Store invoice files locally or in S3-compatible object storage
- Use open-source OCR first, LLM only as fallback

## Notes

This repository now contains a workable ERP starter and business workflow scaffold. It is designed for rapid extension into full production with more inventory movements, multi-tenant authorization, and full GST automation.

## License

MIT
