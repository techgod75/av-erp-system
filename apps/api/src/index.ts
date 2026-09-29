import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'av-erp-api',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/modules', (_req, res) => {
  res.json({
    modules: [
      'customers',
      'vendors',
      'inventory',
      'quotations',
      'sales-orders',
      'purchase-invoices',
      'ledger',
      'service-tickets',
      'gst-reports',
      'ocr-invoice-drafts',
    ],
  });
});

app.post('/api/invoice-ocr-demo', (req, res) => {
  const payload = req.body ?? {};

  res.json({
    ok: true,
    draft: {
      source: payload.source ?? 'upload',
      vendorName: payload.vendorName ?? 'Sample Vendor',
      gstin: payload.gstin ?? '29ABCDE1234F1Z5',
      invoiceNumber: payload.invoiceNumber ?? 'INV-2026-1042',
      invoiceDate: payload.invoiceDate ?? '2026-09-15',
      taxableValue: payload.taxableValue ?? 120000,
      gstAmount: payload.gstAmount ?? 21600,
      total: payload.total ?? 141600,
      status: 'pending-review',
    },
  });
});

app.listen(port, () => {
  console.log(`AV ERP API running at http://localhost:${port}`);
});
