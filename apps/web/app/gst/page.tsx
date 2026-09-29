'use client';

import { useEffect, useState } from 'react';

type GSTSummary = {
  gstr1: {
    reportType: string;
    period: string;
    outwardSupplies: { taxable: number; gst: number; total: number };
  };
  gstr2b: {
    reportType: string;
    period: string;
    inwardSupplies: { taxable: number; gst: number; total: number };
  };
  gstr3b: {
    reportType: string;
    period: string;
    outwardTaxLiability: number;
    inwardTaxCredit: number;
    netLiability: number;
  };
};

const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const formatMoney = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

export default function GSTPage() {
  const [report, setReport] = useState<GSTSummary | null>(null);

  useEffect(() => {
    fetch(`${apiBase}/api/gst/reports`)
      .then((res) => res.json())
      .then((data) => setReport(data))
      .catch(() => {
        setReport({
          gstr1: {
            reportType: 'GSTR-1',
            period: '2026-09',
            outwardSupplies: { taxable: 500000, gst: 90000, total: 590000 },
          },
          gstr2b: {
            reportType: 'GSTR-2B',
            period: '2026-09',
            inwardSupplies: { taxable: 350000, gst: 63000, total: 413000 },
          },
          gstr3b: {
            reportType: 'GSTR-3B',
            period: '2026-09',
            outwardTaxLiability: 90000,
            inwardTaxCredit: 63000,
            netLiability: 27000,
          },
        });
      });
  }, []);

  if (!report) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10 text-slate-200">Loading GST summary...</main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="mb-6 text-3xl font-bold text-white">GST Reporting</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-lg font-semibold text-white">{report.gstr1.reportType}</h2>
          <p className="mt-2 text-sm text-slate-400">{report.gstr1.period}</p>
          <div className="mt-4 space-y-2 text-sm text-slate-300">
            <div className="flex justify-between"><span>Taxable</span><span>{formatMoney(report.gstr1.outwardSupplies.taxable)}</span></div>
            <div className="flex justify-between"><span>GST</span><span>{formatMoney(report.gstr1.outwardSupplies.gst)}</span></div>
            <div className="flex justify-between"><span>Total</span><span>{formatMoney(report.gstr1.outwardSupplies.total)}</span></div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-lg font-semibold text-white">{report.gstr2b.reportType}</h2>
          <p className="mt-2 text-sm text-slate-400">{report.gstr2b.period}</p>
          <div className="mt-4 space-y-2 text-sm text-slate-300">
            <div className="flex justify-between"><span>Taxable</span><span>{formatMoney(report.gstr2b.inwardSupplies.taxable)}</span></div>
            <div className="flex justify-between"><span>GST</span><span>{formatMoney(report.gstr2b.inwardSupplies.gst)}</span></div>
            <div className="flex justify-between"><span>Total</span><span>{formatMoney(report.gstr2b.inwardSupplies.total)}</span></div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-lg font-semibold text-white">{report.gstr3b.reportType}</h2>
          <p className="mt-2 text-sm text-slate-400">{report.gstr3b.period}</p>
          <div className="mt-4 space-y-2 text-sm text-slate-300">
            <div className="flex justify-between"><span>Liability</span><span>{formatMoney(report.gstr3b.outwardTaxLiability)}</span></div>
            <div className="flex justify-between"><span>ITC</span><span>{formatMoney(report.gstr3b.inwardTaxCredit)}</span></div>
            <div className="flex justify-between"><span>Net</span><span>{formatMoney(report.gstr3b.netLiability)}</span></div>
          </div>
        </div>
      </div>
    </main>
  );
}
