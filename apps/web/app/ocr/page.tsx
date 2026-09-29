'use client';

import { useEffect, useState } from 'react';

type OCRDraft = {
  id: string;
  vendorName: string;
  gstin: string;
  invoiceNumber: string;
  invoiceDate: string;
  taxableValue: number;
  gstAmount: number;
  total: number;
  status: string;
};

const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function OCRPage() {
  const [drafts, setDrafts] = useState<OCRDraft[]>([]);

  useEffect(() => {
    fetch(`${apiBase}/api/ocr/invoices`)
      .then((res) => res.json())
      .then((data) => setDrafts(data))
      .catch(() => {
        setDrafts([
          {
            id: 'OCR-01',
            vendorName: 'Elite AV Supplies',
            gstin: '29PQRST1234F1Z6',
            invoiceNumber: 'OCR-2026-041',
            invoiceDate: '2026-09-18',
            taxableValue: 220000,
            gstAmount: 39600,
            total: 259600,
            status: 'pending-review',
          },
        ]);
      });
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="mb-6 text-3xl font-bold text-white">OCR Invoice Intake</h1>

      <div className="mb-8 rounded-xl border border-dashed border-slate-700 bg-slate-900 p-6 text-slate-300">
        <p className="text-lg font-medium text-white">Upload invoice or capture via camera</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button className="rounded-md bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-900">Upload File</button>
          <button className="rounded-md border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200">Open Camera</button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
        <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-200">
          <thead className="bg-slate-950/80 text-slate-300">
            <tr>
              <th className="px-4 py-3">Vendor</th>
              <th className="px-4 py-3">GSTIN</th>
              <th className="px-4 py-3">Invoice</th>
              <th className="px-4 py-3">Taxable</th>
              <th className="px-4 py-3">GST</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {drafts.map((draft) => (
              <tr key={draft.id} className="border-t border-slate-800">
                <td className="px-4 py-3">{draft.vendorName}</td>
                <td className="px-4 py-3">{draft.gstin}</td>
                <td className="px-4 py-3">{draft.invoiceNumber}</td>
                <td className="px-4 py-3">₹{draft.taxableValue.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3">₹{draft.gstAmount.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3">₹{draft.total.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3 text-teal-300">{draft.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
