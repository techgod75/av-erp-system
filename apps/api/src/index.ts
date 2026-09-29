import bcrypt from 'bcryptjs';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { type NextFunction, type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient, type UserRole } from '@prisma/client';
import { z } from 'zod';

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const port = Number(process.env.PORT || 4000);
const jwtSecret = process.env.JWT_SECRET || 'av-erp-local-secret';

app.use(cors());
app.use(express.json({ limit: '5mb' }));

type AuthenticatedUser = {
  id: string;
  email: string;
  role: UserRole;
  tenantId: string;
};

type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['OWNER', 'ADMIN', 'SALES_MANAGER', 'SERVICE_TECHNICIAN', 'ACCOUNTANT', 'INVENTORY_MANAGER']).optional(),
  tenantName: z.string().min(2).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const productSchema = z.object({
  sku: z.string().min(2),
  name: z.string().min(2),
  category: z.string().min(2),
  itemType: z.enum(['trading', 'service-rental']),
  buyingPrice: z.number().default(0),
  sellingPrice: z.number().default(0),
  stockQty: z.number().default(0),
  warehouse: z.string().default('Main Warehouse'),
});

const customerSchema = z.object({
  name: z.string().min(2),
  gstin: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

const vendorSchema = z.object({
  name: z.string().min(2),
  gstin: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

const serviceTicketSchema = z.object({
  customerName: z.string().min(2),
  siteAddress: z.string().min(2),
  issueSummary: z.string().min(2),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  status: z.enum(['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED']).default('OPEN'),
  engineerName: z.string().optional(),
});

function generateToken(user: AuthenticatedUser) {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role, tenantId: user.tenantId }, jwtSecret, {
    expiresIn: '7d',
  });
}

async function createAuditLog(input: {
  tenantId: string;
  userId: string;
  userEmail: string;
  action: string;
  entity: string;
  details: string;
  ipAddress?: string;
}) {
  await prisma.auditLog.create({
    data: {
      tenantId: input.tenantId,
      userId: input.userId,
      userEmail: input.userEmail,
      action: input.action,
      entity: input.entity,
      details: input.details,
      ipAddress: input.ipAddress || 'unknown',
    },
  });
}

const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  try {
    const token = authorization.replace('Bearer ', '');
    const payload = jwt.verify(token, jwtSecret) as {
      sub: string;
      email: string;
      role: UserRole;
      tenantId: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        tenantId: true,
        name: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }

    (req as AuthenticatedRequest).user = {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

const requireRoles = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Insufficient access rights.' });
    }

    return next();
  };
};

async function bootstrapDatabase() {
  try {
    const tenant = await prisma.tenant.upsert({
      where: { name: 'Default Tenant' },
      update: {},
      create: { name: 'Default Tenant' },
    });

    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@averp.local' },
    });

    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash('admin123', 10);
      const adminUser = await prisma.user.create({
        data: {
          tenantId: tenant.id,
          email: 'admin@averp.local',
          passwordHash,
          name: 'System Admin',
          role: 'OWNER',
        },
      });

      await createAuditLog({
        tenantId: tenant.id,
        userId: adminUser.id,
        userEmail: adminUser.email,
        action: 'CREATE',
        entity: 'USER',
        details: 'Initial admin account created',
      });
    }

    console.log('Database bootstrap complete.');
  } catch (error) {
    console.error('Database bootstrap failed:', error);
  }
}

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true, service: 'av-erp-api', timestamp: new Date().toISOString() });
});

app.get('/api/roles', (_req: Request, res: Response) => {
  res.json([
    'OWNER',
    'ADMIN',
    'SALES_MANAGER',
    'SERVICE_TECHNICIAN',
    'ACCOUNTANT',
    'INVENTORY_MANAGER',
  ]);
});

app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.parse(req.body);

    const tenant = await prisma.tenant.upsert({
      where: { name: parsed.tenantName || 'Default Tenant' },
      update: {},
      create: { name: parsed.tenantName || 'Default Tenant' },
    });

    const existingUser = await prisma.user.findUnique({
      where: { email: parsed.email },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists.' });
    }

    const passwordHash = await bcrypt.hash(parsed.password, 10);
    const role = (parsed.role || 'SALES_MANAGER') as UserRole;

    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: parsed.email,
        passwordHash,
        name: parsed.name,
        role,
      },
    });

    await createAuditLog({
      tenantId: tenant.id,
      userId: user.id,
      userEmail: user.email,
      action: 'CREATE',
      entity: 'USER',
      details: `User ${user.name} registered as ${user.role}`,
    });

    return res.status(201).json({
      token: generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      }),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
    });
  } catch (error) {
    return res.status(400).json({ error: 'Invalid registration payload.' });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { email: parsed.email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const isValid = await bcrypt.compare(parsed.password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    });

    await createAuditLog({
      tenantId: user.tenantId,
      userId: user.id,
      userEmail: user.email,
      action: 'LOGIN',
      entity: 'SESSION',
      details: 'User signed in',
    });

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
    });
  } catch (error) {
    return res.status(400).json({ error: 'Invalid login payload.' });
  }
});

app.get('/api/auth/me', requireAuth, async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      tenantId: true,
      createdAt: true,
    },
  });

  return res.json(currentUser);
});

app.get('/api/customers', requireAuth, async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  const customers = await prisma.customer.findMany({
    where: { tenantId: user!.tenantId },
    orderBy: { createdAt: 'desc' },
  });
  return res.json(customers);
});

app.post('/api/customers', requireAuth, requireRoles('OWNER', 'ADMIN', 'SALES_MANAGER'), async (req: Request, res: Response) => {
  try {
    const parsed = customerSchema.parse(req.body);
    const user = (req as AuthenticatedRequest).user!;

    const customer = await prisma.customer.create({
      data: {
        tenantId: user.tenantId,
        name: parsed.name,
        gstin: parsed.gstin || null,
        phone: parsed.phone || null,
        address: parsed.address || null,
      },
    });

    await createAuditLog({
      tenantId: user.tenantId,
      userId: user.id,
      userEmail: user.email,
      action: 'CREATE',
      entity: 'CUSTOMER',
      details: `Customer ${customer.name} created`,
    });

    return res.status(201).json(customer);
  } catch (error) {
    return res.status(400).json({ error: 'Invalid customer payload.' });
  }
});

app.get('/api/vendors', requireAuth, async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  const vendors = await prisma.vendor.findMany({
    where: { tenantId: user!.tenantId },
    orderBy: { createdAt: 'desc' },
  });
  return res.json(vendors);
});

app.post('/api/vendors', requireAuth, requireRoles('OWNER', 'ADMIN', 'ACCOUNTANT', 'INVENTORY_MANAGER'), async (req: Request, res: Response) => {
  try {
    const parsed = vendorSchema.parse(req.body);
    const user = (req as AuthenticatedRequest).user!;

    const vendor = await prisma.vendor.create({
      data: {
        tenantId: user.tenantId,
        name: parsed.name,
        gstin: parsed.gstin || null,
        phone: parsed.phone || null,
        address: parsed.address || null,
      },
    });

    await createAuditLog({
      tenantId: user.tenantId,
      userId: user.id,
      userEmail: user.email,
      action: 'CREATE',
      entity: 'VENDOR',
      details: `Vendor ${vendor.name} created`,
    });

    return res.status(201).json(vendor);
  } catch (error) {
    return res.status(400).json({ error: 'Invalid vendor payload.' });
  }
});

app.get('/api/products', requireAuth, async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  const products = await prisma.product.findMany({
    where: { tenantId: user!.tenantId },
    orderBy: { createdAt: 'desc' },
  });
  return res.json(products);
});

app.post('/api/products', requireAuth, requireRoles('OWNER', 'ADMIN', 'INVENTORY_MANAGER'), async (req: Request, res: Response) => {
  try {
    const parsed = productSchema.parse(req.body);
    const user = (req as AuthenticatedRequest).user!;

    const product = await prisma.product.create({
      data: {
        tenantId: user.tenantId,
        sku: parsed.sku,
        name: parsed.name,
        category: parsed.category,
        itemType: parsed.itemType,
        buyingPrice: parsed.buyingPrice,
        sellingPrice: parsed.sellingPrice,
        stockQty: parsed.stockQty,
        warehouse: parsed.warehouse,
      },
    });

    await createAuditLog({
      tenantId: user.tenantId,
      userId: user.id,
      userEmail: user.email,
      action: 'CREATE',
      entity: 'PRODUCT',
      details: `Product ${product.name} created`,
    });

    return res.status(201).json(product);
  } catch (error) {
    return res.status(400).json({ error: 'Invalid product payload.' });
  }
});

app.get('/api/service-tickets', requireAuth, async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  const tickets = await prisma.serviceTicket.findMany({
    where: { tenantId: user!.tenantId },
    orderBy: { createdAt: 'desc' },
  });
  return res.json(tickets);
});

app.post('/api/service-tickets', requireAuth, requireRoles('OWNER', 'ADMIN', 'SERVICE_TECHNICIAN', 'SALES_MANAGER'), async (req: Request, res: Response) => {
  try {
    const parsed = serviceTicketSchema.parse(req.body);
    const user = (req as AuthenticatedRequest).user!;

    const ticket = await prisma.serviceTicket.create({
      data: {
        tenantId: user.tenantId,
        ticketNumber: `AV-${Date.now()}`,
        customerName: parsed.customerName,
        siteAddress: parsed.siteAddress,
        issueSummary: parsed.issueSummary,
        priority: parsed.priority,
        status: parsed.status,
        engineerName: parsed.engineerName || 'Unassigned',
      },
    });

    await createAuditLog({
      tenantId: user.tenantId,
      userId: user.id,
      userEmail: user.email,
      action: 'CREATE',
      entity: 'SERVICE_TICKET',
      details: `Service ticket ${ticket.ticketNumber} created`,
    });

    return res.status(201).json(ticket);
  } catch (error) {
    return res.status(400).json({ error: 'Invalid service ticket payload.' });
  }
});

app.get('/api/ledger', requireAuth, async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  const ledgerEntries = await prisma.ledgerEntry.findMany({
    where: { tenantId: user!.tenantId },
    orderBy: { createdAt: 'desc' },
  });
  return res.json(ledgerEntries);
});

app.post('/api/sales/invoice', requireAuth, requireRoles('OWNER', 'ADMIN', 'SALES_MANAGER', 'ACCOUNTANT'), async (req: Request, res: Response) => {
  try {
    const user = (req as AuthenticatedRequest).user!;
    const body = req.body as {
      customerId?: string;
      invoiceNumber?: string;
      taxableValue?: number;
      gstRate?: number;
      gstMode?: 'intra' | 'inter';
    };

    const taxableValue = Number(body.taxableValue || 0);
    const gstRate = Number(body.gstRate || 18);
    const gstValue = (taxableValue * gstRate) / 100;
    const total = taxableValue + gstValue;

    const customer = await prisma.customer.findFirst({
      where: {
        tenantId: user.tenantId,
        id: body.customerId || undefined,
      },
    });

    const invoice = await prisma.invoice.create({
      data: {
        tenantId: user.tenantId,
        invoiceType: 'SALES',
        invoiceNumber: body.invoiceNumber || `TS-${Date.now()}`,
        customerName: customer?.name || 'Walk-In Customer',
        vendorName: null,
        invoiceDate: new Date(),
        taxableValue,
        gstValue,
        total,
        status: 'APPROVED',
      },
    });

    await prisma.ledgerEntry.createMany({
      data: [
        {
          tenantId: user.tenantId,
          accountCode: 'Debtors A/c',
          debit: total,
          credit: 0,
          description: `Sales invoice ${invoice.invoiceNumber}`,
          documentType: 'SALES_INVOICE',
          documentId: invoice.id,
        },
        {
          tenantId: user.tenantId,
          accountCode: 'Sales A/c',
          debit: 0,
          credit: taxableValue,
          description: `Sales revenue ${invoice.invoiceNumber}`,
          documentType: 'SALES_INVOICE',
          documentId: invoice.id,
        },
      ],
    });

    await createAuditLog({
      tenantId: user.tenantId,
      userId: user.id,
      userEmail: user.email,
      action: 'CREATE',
      entity: 'SALES_INVOICE',
      details: `Sales invoice ${invoice.invoiceNumber} posted`,
    });

    return res.status(201).json({ invoice });
  } catch (error) {
    return res.status(400).json({ error: 'Unable to create sales invoice.' });
  }
});

app.get('/api/gst/reports', requireAuth, async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user!;
  const invoices = await prisma.invoice.findMany({
    where: { tenantId: user.tenantId },
  });

  const outward = invoices.filter((invoice) => invoice.invoiceType === 'SALES');
  const inward = invoices.filter((invoice) => invoice.invoiceType === 'PURCHASE');

  const outboundTotal = outward.reduce((sum, invoice) => sum + invoice.taxableValue, 0);
  const outboundGST = outward.reduce((sum, invoice) => sum + invoice.gstValue, 0);
  const inboundTotal = inward.reduce((sum, invoice) => sum + invoice.taxableValue, 0);
  const inboundGST = inward.reduce((sum, invoice) => sum + invoice.gstValue, 0);

  return res.json({
    gstr1: {
      reportType: 'GSTR-1',
      period: '2026-09',
      outwardSupplies: {
        taxable: outboundTotal,
        gst: outboundGST,
        total: outboundTotal + outboundGST,
      },
    },
    gstr2b: {
      reportType: 'GSTR-2B',
      period: '2026-09',
      inwardSupplies: {
        taxable: inboundTotal,
        gst: inboundGST,
        total: inboundTotal + inboundGST,
      },
    },
    gstr3b: {
      reportType: 'GSTR-3B',
      period: '2026-09',
      outwardTaxLiability: outboundGST,
      inwardTaxCredit: inboundGST,
      netLiability: Math.max(0, outboundGST - inboundGST),
    },
  });
});

app.get('/api/audit-logs', requireAuth, requireRoles('OWNER', 'ADMIN', 'ACCOUNTANT'), async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user!;
  const logs = await prisma.auditLog.findMany({
    where: { tenantId: user.tenantId },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  return res.json(logs);
});

app.post('/api/ocr/invoice', requireAuth, requireRoles('OWNER', 'ADMIN', 'ACCOUNTANT', 'INVENTORY_MANAGER'), async (req: Request, res: Response) => {
  try {
    const { vendorName, gstin, invoiceNumber, invoiceDate, taxableValue, gstAmount, total, source } = req.body as {
      vendorName?: string;
      gstin?: string;
      invoiceNumber?: string;
      invoiceDate?: string;
      taxableValue?: number;
      gstAmount?: number;
      total?: number;
      source?: string;
    };

    const user = (req as AuthenticatedRequest).user!;
    const draft = await prisma.oCRInvoiceDraft.create({
      data: {
        tenantId: user.tenantId,
        source: source || 'camera-upload',
        vendorName: vendorName || 'Unknown Vendor',
        gstin: gstin || null,
        invoiceNumber: invoiceNumber || `OCR-${Date.now()}`,
        invoiceDate: invoiceDate ? new Date(invoiceDate) : new Date(),
        taxableValue: taxableValue ? Number(taxableValue) : 0,
        gstAmount: gstAmount ? Number(gstAmount) : 0,
        total: total ? Number(total) : 0,
        status: 'PENDING_REVIEW',
      },
    });

    await createAuditLog({
      tenantId: user.tenantId,
      userId: user.id,
      userEmail: user.email,
      action: 'CREATE',
      entity: 'OCR_INVOICE_DRAFT',
      details: `OCR invoice draft ${draft.id} created`,
    });

    return res.status(201).json({ draft });
  } catch (error) {
    return res.status(400).json({ error: 'Unable to process OCR invoice.' });
  }
});

app.get('/api/ocr/invoices', requireAuth, async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user!;
  const drafts = await prisma.oCRInvoiceDraft.findMany({
    where: { tenantId: user.tenantId },
    orderBy: { createdAt: 'desc' },
  });
  return res.json(drafts);
});

bootstrapDatabase();

app.listen(port, () => {
  console.log(`AV ERP API running on http://localhost:${port}`);
});
