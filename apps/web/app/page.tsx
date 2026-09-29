'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type DashboardStats = {
  customers: number;
  vendors: number;
  inventoryItems: number;
  openTickets: number;
  taxInvoices: number;
  purchaseInvoices: number;
  ledgerEntries: number;
  totalRevenue: number;
  totalPurchases: number;
};

const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const formatMoney = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

export default function HomePage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    fetch(`${apiBase}/api/dashboard`)
      .then((response) => response.json())
      .then((data) => setStats(data))
      .catch(() => {
        setStats({
          customers: 2,
          vendors: 2,
          inventoryItems: 4,
          openTickets: 2,
          taxInvoices: 1,
          purchaseInvoices: 1,
          ledgerEntries: 8,
          totalRevenue: 590000,
          totalPurchases: 413000,
        });
      });
  }, []);

  const moduleCards = [
    'Sales & Quotation Management',
    'Inventory & Rental Tracking',
    'Service Tickets & AMC',
    'Automated Ledger Posting',
    'GST Export and Reconciliation',
    'Invoice OCR Capture',
  ];

  if (!stats) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="rounded-xl border border-slate-800 bg-slate-900 px-8 py-6 text-center text-slate-200">
          Loading AV ERP dashboard...
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-teal-300">AV ERP SYSTEM</p>
          <h1 className="mt-3 text-4xl font-bold text-white">Lean operations for AV trading & services</h1>
        </div>

        <div className="flex gap-3">
          <Link href="/inventory" className="rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 hover:border-slate-600">
            Inventory
          </Link>
          <button className="rounded-md bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-teal-400">
            New Quotation
          </button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Customers', value: stats.customers },
          { label: 'Vendors', value: stats.vendors },
          { label: 'Inventory Items', value: stats.inventoryItems },
          { label: 'Open Service Tickets', value: stats.openTickets },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-lg shadow-slate-950/30">
            <div className="text-sm text-slate-400">{card.label}</div>
            <div className="mt-3 text-3xl font-bold text-white">{card.value}</div>
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold text-white">Operational Snapshot</h2>

          <div className="mt-6 space-y-5">
            <div>
              <div className="mb-2 flex justify-between text-sm text-slate-300">
                <span>Rental Availability</span>
                <span>94%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800">
                <div className="h-2 w-[94%] rounded-full bg-teal-400" />
              </div>
            </div>

            <div>
              <div className="mb-2 flex justify-between text-sm text-slate-300">
                <span>Finance Posting Health</span>
                <span>96%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800">
                <div className="h-2 w-[96%] rounded-full bg-cyan-400" />
              </div>
            </div>

            <div>
              <div className="mb-2 flex justify-between text-sm text-slate-300">
                <span>GST Return Readiness</span>
                <span>92%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800">
                <div className="h-2 w-[92%] rounded-full bg-emerald-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold text-white">Finance Overview</h2>
          <div className="mt-6 space-y-4 text-sm text-slate-300">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span>Sales Invoices</span>
              <span>{stats.taxInvoices}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span>Purchase Invoices</span>
              <span>{stats.purchaseInvoices}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span>Ledger Entries</span>
              <span>{stats.ledgerEntries}</span>
            </div>
            <div className="flex justify-between">
              <span>Revenue</span>
              <span>{formatMoney(stats.totalRevenue)}</span>
            </div>
            <div className="flex justify-between">
              <span>Purchases</span>
              <span>{formatMoney(stats.totalPurchases)}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-5 text-2xl font-semibold text-white">Core Modules</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {moduleCards.map((module) => (
            <div key={module} className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-slate-200 shadow-md shadow-slate-950/30">
              {module}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
