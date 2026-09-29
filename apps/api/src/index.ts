import cors from 'cors';
import dotenv from 'dotenv';
import express, { type Request, type Response } from 'express';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json({ limit: '5mb' }));

type GSTMode = 'intra' | 'inter';

type Customer = {
  id: string;
  name: string;
  gstin: string;
  state: string;
  type: 'B2B' | 'B2C';
};

type Vendor = {
  id: string;
  name: string;
  gstin: string;
  state: string;
};

type InventoryItem = {
  id: string;
  sku: string;
  name: string;
  category: string;
  itemType: 'trading' | 'service-rental';
  unitPrice: number;
  costPrice: number;
  warehouse: string;
  availableQty: number;
};

type LedgerEntry = {
  id: string;
  account: string;
  debit: number;
  credit: number;
  documentType: string;
  documentId: string;
  description: string;
};

type TaxInvoice = {
  id: string;
  customerId: string;
  customerName: string;
  invoiceNumber: string;
  date: string;
  taxableValue: number;
  gstRate: number;
  gstType: 'CGST+SGST' | 'IGST';
  gstValue: number;
  total: number;
  status: 'draft' | 'approved';
};

type PurchaseInvoice = {
  id: string;
  vendorId: string;
  vendorName: string;
  invoiceNumber: string;
  date: string;
  taxableValue: number;
  gstRate: number;
  gstValue: number;
  total: number;
  status: 'draft' | 'approved';
};

type ServiceTicket = {
  id: string;
  ticketNumber: string;
  customerName: string;
  siteAddress: string;
  issueSummary: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'Assigned' | 'In Progress' | 'Resolved';
  engineerName: string;
};

type OCRInvoiceDraft = {
  id: string;
  source: string;
  vendorName: string;
  gstin: string;
  invoiceNumber: string;
  invoiceDate: string;
  taxableValue: number;
  gstAmount: number;
  total: number;
  status: 'pending-review' | 'approved';
};

const customers: Customer[] = [
  {
    id: 'CUST-1001',
    name: 'SoundWorks Eventz',
    gstin: '29ABCDE1234F1Z5',
    state: 'Karnataka',
    type: 'B2B',
  },
  {
    id: 'CUST-1002',
    name: 'Apex Corporate Hall',
    gstin: '27LMNOP5678Q1Z9',
    state: 'Maharashtra',
    type: 'B2B',
  },
];

const vendors: Vendor[] = [
  {
    id: 'VEND-2001',
    name: 'Elite AV Supplies',
    gstin: '29PQRST1234F1Z6',
    state: 'Karnataka',
  },
  {
    id: 'VEND-2002',
    name: 'ProAudio Distributors',
    gstin: '24UVWXY9876Q1Z3',
    state: 'Gujarat',
  },
];

const inventoryItems: InventoryItem[] = [
  {
    id: 'INV-01',
    sku: 'PJ-3500',
    name: 'Projector - 3500 Lumens',
    category: 'Projection',
    itemType: 'trading',
    unitPrice: 390000,
    costPrice: 285000,
    warehouse: 'Bengaluru WH-1',
    availableQty: 8,
  },
  {
    id: 'INV-02',
    sku: 'LED-55',
    name: 'LED Panel 55 inch',
    category: 'Display',
    itemType: 'trading',
    unitPrice: 520000,
    costPrice: 395000,
    warehouse: 'Bengaluru WH-1',
    availableQty: 3,
  },
  {
    id: 'INV-03',
    sku: 'LINE-12',
    name: '12" Line Array Speaker Set',
    category: 'Audio',
    itemType: 'service-rental',
    unitPrice: 185000,
    costPrice: 128000,
    warehouse: 'Rental Pool',
    availableQty: 12,
  },
];

const ledgerEntries: LedgerEntry[] = [];
const taxInvoices: TaxInvoice[] = [];
const purchaseInvoices: PurchaseInvoice[] = [];
const serviceTickets: ServiceTicket[] = [
  {
    id: 'ST-0001',
    ticketNumber: 'AV-1001',
    customerName: 'SoundWorks Eventz',
    siteAddress: 'Bengaluru',
    issueSummary: 'Main LED wall dimer issue on stage rig',
    priority: 'High',
    status: 'Assigned',
    engineerName: 'Arun Kumar',
  },
];
const ocrDrafts: OCRInvoiceDraft[] = [];

function calculateGST(taxableValue: number, gstRate: number, mode: GSTMode) {
  const gstValue = (taxableValue * gstRate) / 100;
  if (mode === 'intra') {
    return {
      gstType: 'CGST+SGST' as const,
      gstValue,
      split: {
        cgst: gstValue / 2,
        sgst: gstValue / 2,
      },
    };
  }

  return {
    gstType: 'IGST' as const,
    gstValue,
    split: {
      igst: gstValue,
    },
  };
}

function buildSalesInvoiceLedger(invoice: TaxInvoice): LedgerEntry[] {
  const entries: LedgerEntry[] = [
    {
      id: `LED-${invoice.id}-1`,
      account: 'Debtors A/c',
      debit: invoice.total,
      credit: 0,
      documentType: 'TaxInvoice',
      documentId: invoice.id,
      description: `Customer receivable for ${invoice.invoiceNumber}`,
    },
    {
      id: `LED-${invoice.id}-2`,
      account: 'Sales A/c',
      debit: 0,
      credit: invoice.taxableValue,
      documentType: 'TaxInvoice',
      documentId: invoice.id,
      description: `Sales revenue for ${invoice.invoiceNumber}`,
    },
  ];

  if (invoice.gstType === 'CGST+SGST') {
    entries.push(
      {
        id: `LED-${invoice.id}-3`,
        account: 'CGST Output A/c',
        debit: 0,
        credit: invoice.gstValue / 2,
        documentType: 'TaxInvoice',
        documentId: invoice.id,
        description: `CGST output for ${invoice.invoiceNumber}`,
      },
      {
        id: `LED-${invoice.id}-4`,
        account: 'SGST Output A/c',
        debit: 0,
        credit: invoice.gstValue / 2,
        documentType: 'TaxInvoice',
        documentId: invoice.id,
        description: `SGST output for ${invoice.invoiceNumber}`,
      },
    );
  } else {
    entries.push({
      id: `LED-${invoice.id}-3`,
      account: 'IGST Output A/c',
      debit: 0,
      credit: invoice.gstValue,
      documentType: 'TaxInvoice',
      documentId: invoice.id,
      description: `IGST output for ${invoice.invoiceNumber}`,
    });
  }

  return entries;
}

function buildPurchaseInvoiceLedger(invoice: PurchaseInvoice): LedgerEntry[] {
  return [
    {
      id: `PL-${invoice.id}-1`,
      account: 'Inventory / Expense A/c',
      debit: invoice.taxableValue + invoice.gstValue,
      credit: 0,
      documentType: 'PurchaseInvoice',
      documentId: invoice.id,
      description: `Purchase invoice ${invoice.invoiceNumber}`,
    },
    {
      id: `PL-${invoice.id}-2`,
      account: 'Input GST A/c',
      debit: invoice.gstValue,
      credit: 0,
      documentType: 'PurchaseInvoice',
      documentId: invoice.id,
      description: `Input GST for ${invoice.invoiceNumber}`,
    },
    {
      id: `PL-${invoice.id}-3`,
      account: 'Creditor A/c',
      debit: 0,
      credit: invoice.total,
      documentType: 'PurchaseInvoice',
      documentId: invoice.id,
      description: `Vendor payable for ${invoice.invoiceNumber}`,
    },
  ];
}

function generateGSTReportSummary() {
  const outbound = taxInvoices.reduce(
    (sum, invoice) => {
      sum.taxable += invoice.taxableValue;
      sum.gst += invoice.gstValue;
      sum.total += invoice.total;
      return sum;
    },
    { taxable: 0, gst: 0, total: 0 },
  );

  const inbound = purchaseInvoices.reduce(
    (sum, invoice) => {
      sum.taxable += invoice.taxableValue;
      sum.gst += invoice.gstValue;
      sum.total += invoice.total;
      return sum;
    },
    { taxable: 0, gst: 0, total: 0 },
  );

  return {
    gstr1: {
      reportType: 'GSTR-1',
      period: '2026-09',
      outwardSupplies: outbound,
      records: taxInvoices,
    },
    gstr2b: {
      reportType: 'GSTR-2B',
      period: '2026-09',
      inwardSupplies: inbound,
      records: purchaseInvoices,
    },
    gstr3b: {
      reportType: 'GSTR-3B',
      period: '2026-09',
      outwardTaxLiability: outbound.gst,
      inwardTaxCredit: inbound.gst,
      netLiability: Math.max(0, outbound.gst - inbound.gst),
    },
  };
}

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true, service: 'av-erp-api', timestamp: new Date().toISOString() });
});

app.get('/api/modules', (_req: Request, res: Response) => {
  res.json({
    modules: [
      'customers',
      'vendors',
      'inventory',
      'quotes',
      'sales-invoices',
      'purchase-invoices',
      'ledger',
      'service-tickets',
      'gst-reports',
      'ocr-invoice-drafts',
    ],
  });
});

app.get('/api/dashboard', (_req: Request, res: Response) => {
  const summary = {
    customers: customers.length,
    vendors: vendors.length,
    inventoryItems: inventoryItems.length,
    openTickets: serviceTickets.filter((t) => t.status !== 'Resolved').length,
    taxInvoices: taxInvoices.length,
    purchaseInvoices: purchaseInvoices.length,
    ledgerEntries: ledgerEntries.length,
    totalRevenue: taxInvoices.reduce((sum, invoice) => sum + invoice.total, 0),
    totalPurchases: purchaseInvoices.reduce((sum, invoice) => sum + invoice.total, 0),
  };

  res.json(summary);
});

app.get('/api/customers', (_req: Request, res: Response) => {
  res.json(customers);
});

app.post('/api/customers', (req: Request, res: Response) => {
  const payload = req.body ?? {};

  const customer: Customer = {
    id: `CUST-${Date.now()}`,
    name: payload.name,
    gstin: payload.gstin ?? 'NA',
    state: payload.state ?? 'Karnataka',
    type: payload.type ?? 'B2B',
  };

  customers.push(customer);
  res.status(201).json(customer);
});

app.get('/api/vendors', (_req: Request, res: Response) => {
  res.json(vendors);
});

app.post('/api/vendors', (req: Request, res: Response) => {
  const payload = req.body ?? {};

  const vendor: Vendor = {
    id: `VEND-${Date.now()}`,
    name: payload.name,
    gstin: payload.gstin ?? 'NA',
    state: payload.state ?? 'Karnataka',
  };

  vendors.push(vendor);
  res.status(201).json(vendor);
});

app.get('/api/inventory', (_req: Request, res: Response) => {
  res.json(inventoryItems);
});

app.post('/api/inventory', (req: Request, res: Response) => {
  const payload = req.body ?? {};

  const item: InventoryItem = {
    id: `INV-${Date.now()}`,
    sku: payload.sku ?? `SKU-${Date.now()}`,
    name: payload.name,
    category: payload.category ?? 'General',
    itemType: payload.itemType ?? 'trading',
    unitPrice: Number(payload.unitPrice ?? 0),
    costPrice: Number(payload.costPrice ?? 0),
    warehouse: payload.warehouse ?? 'Bengaluru WH-1',
    availableQty: Number(payload.availableQty ?? 1),
  };

  inventoryItems.push(item);
  res.status(201).json(item);
});

app.get('/api/service-tickets', (_req: Request, res: Response) => {
  res.json(serviceTickets);
});

app.post('/api/service-tickets', (req: Request, res: Response) => {
  const payload = req.body ?? {};

  const ticket: ServiceTicket = {
    id: `ST-${Date.now()}`,
    ticketNumber: payload.ticketNumber ?? `AV-${Date.now()}`,
    customerName: payload.customerName ?? 'Unknown Customer',
    siteAddress: payload.siteAddress ?? 'Not provided',
    issueSummary: payload.issueSummary ?? 'New service request',
    priority: payload.priority ?? 'Medium',
    status: payload.status ?? 'Open',
    engineerName: payload.engineerName ?? 'Unassigned',
  };

  serviceTickets.push(ticket);
  res.status(201).json(ticket);
});

app.post('/api/sales/invoice', (req: Request, res: Response) => {
  const payload = req.body ?? {};
  const taxableValue = Number(payload.taxableValue ?? 0);
  const gstRate = Number(payload.gstRate ?? 18);
  const mode: GSTMode = payload.gstMode === 'inter' ? 'inter' : 'intra';
  const customer = customers.find((item) => item.id === payload.customerId) ?? customers[0];

  const gstResult = calculateGST(taxableValue, gstRate, mode);
  const invoice: TaxInvoice = {
    id: `INV-S-${Date.now()}`,
    customerId: customer.id,
    customerName: customer.name,
    invoiceNumber: payload.invoiceNumber ?? `TS-${Date.now()}`,
    date: payload.date ?? new Date().toISOString().slice(0, 10),
    taxableValue,
    gstRate,
    gstType: gstResult.gstType,
    gstValue: gstResult.gstValue,
    total: taxableValue + gstResult.gstValue,
    status: 'approved',
  };

  const ledger = buildSalesInvoiceLedger(invoice);
  taxInvoices.push(invoice);
  ledgerEntries.push(...ledger);

  res.status(201).json({ invoice, ledgerEntries: ledger });
});

app.post('/api/purchase/invoice', (req: Request, res: Response) => {
  const payload = req.body ?? {};
  const taxableValue = Number(payload.taxableValue ?? 0);
  const gstRate = Number(payload.gstRate ?? 18);
  const vendor = vendors.find((item) => item.id === payload.vendorId) ?? vendors[0];
  const gstValue = (taxableValue * gstRate) / 100;

  const invoice: PurchaseInvoice = {
    id: `INV-P-${Date.now()}`,
    vendorId: vendor.id,
    vendorName: vendor.name,
    invoiceNumber: payload.invoiceNumber ?? `TP-${Date.now()}`,
    date: payload.date ?? new Date().toISOString().slice(0, 10),
    taxableValue,
    gstRate,
    gstValue,
    total: taxableValue + gstValue,
    status: 'approved',
  };

  const ledger = buildPurchaseInvoiceLedger(invoice);
  purchaseInvoices.push(invoice);
  ledgerEntries.push(...ledger);

  res.status(201).json({ invoice, ledgerEntries: ledger });
});

app.post('/api/ocr/invoice', (req: Request, res: Response) => {
  const payload = req.body ?? {};

  const draft: OCRInvoiceDraft = {
    id: `OCR-${Date.now()}`,
    source: payload.source ?? 'camera-upload',
    vendorName: payload.vendorName ?? 'Sample AV Supplier',
    gstin: payload.gstin ?? '29ABCDE1234F1Z5',
    invoiceNumber: payload.invoiceNumber ?? `OCR-${Date.now()}`,
    invoiceDate: payload.invoiceDate ?? new Date().toISOString().slice(0, 10),
    taxableValue: Number(payload.taxableValue ?? 120000),
    gstAmount: Number(payload.gstAmount ?? 21600),
    total: Number(payload.total ?? 141600),
    status: 'pending-review',
  };

  ocrDrafts.push(draft);
  res.status(201).json({ draft });
});

app.get('/api/ledger', (_req: Request, res: Response) => {
  res.json(ledgerEntries);
});

app.get('/api/gst/reports', (_req: Request, res: Response) => {
  res.json(generateGSTReportSummary());
});

app.get('/api/ocr/invoices', (_req: Request, res: Response) => {
  res.json(ocrDrafts);
});

app.listen(port, () => {
  console.log(`AV ERP API listening on http://localhost:${port}`);
});
