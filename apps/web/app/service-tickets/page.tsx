'use client';

import { useEffect, useState } from 'react';

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

const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function ServiceTicketsPage() {
  const [tickets, setTickets] = useState<ServiceTicket[]>([]);

  useEffect(() => {
    fetch(`${apiBase}/api/service-tickets`)
      .then((res) => res.json())
      .then((data) => setTickets(data))
      .catch(() => {
        setTickets([
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
        ]);
      });
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="mb-6 text-3xl font-bold text-white">Service Tickets & AMC</h1>

      <div className="grid gap-4">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-teal-300">{ticket.ticketNumber}</div>
                <h2 className="mt-1 text-xl font-semibold text-white">{ticket.customerName}</h2>
              </div>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-200">
                {ticket.status}
              </span>
            </div>

            <p className="text-slate-300">{ticket.issueSummary}</p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-400">
              <span>Priority: {ticket.priority}</span>
              <span>Engineer: {ticket.engineerName}</span>
              <span>Site: {ticket.siteAddress}</span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
