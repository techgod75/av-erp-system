'use client';

import { useEffect, useState } from 'react';

type InventoryItem = {
  id: string;
  sku: string;
  name: string;
  category: string;
  itemType: 'trading' | 'service-rental';
  warehouse: string;
  availableQty: number;
  unitPrice: number;
};

const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);

  useEffect(() => {
    fetch(`${apiBase}/api/inventory`)
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch(() => {
        setItems([
          {
            id: 'INV-01',
            sku: 'PJ-3500',
            name: 'Projector - 3500 Lumens',
            category: 'Projection',
            itemType: 'trading',
            warehouse: 'Bengaluru WH-1',
            availableQty: 8,
            unitPrice: 390000,
          },
          {
            id: 'INV-03',
            sku: 'LINE-12',
            name: '12" Line Array Speaker Set',
            category: 'Audio',
            itemType: 'service-rental',
            warehouse: 'Rental Pool',
            availableQty: 12,
            unitPrice: 185000,
          },
        ]);
      });
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="mb-6 text-3xl font-bold text-white">Inventory & Rental Status</h1>

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
        <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-200">
          <thead className="bg-slate-950/80 text-slate-300">
            <tr>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Warehouse</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Unit Price</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-slate-800">
                <td className="px-4 py-3">{item.sku}</td>
                <td className="px-4 py-3">{item.name}</td>
                <td className="px-4 py-3">{item.itemType}</td>
                <td className="px-4 py-3">{item.warehouse}</td>
                <td className="px-4 py-3">{item.availableQty}</td>
                <td className="px-4 py-3">₹{item.unitPrice.toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
