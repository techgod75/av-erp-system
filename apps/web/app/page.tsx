const stats = [
  { label: 'Active Orders', value: '128' },
  { label: 'Rental Availability', value: '94%' },
  { label: 'GST Pending', value: '7 Reports' },
  { label: 'Open AMC Tickets', value: '18' },
];

const modules = [
  'Sales & Quotation Management',
  'Inventory & Rental Tracking',
  'Service Tickets & AMC',
  'Automated Ledger Posting',
  'GST Export and Reconciliation',
  'Invoice OCR Intake',
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-teal-300">AV ERP System</p>
            <h1 className="mt-3 text-4xl font-bold text-white">Lean operations for AV trade and service businesses</h1>
          </div>
          <button className="rounded-md bg-teal-500 px-4 py-2 font-medium text-slate-950 transition hover:bg-teal-400">
            New Quotation
          </button>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-lg shadow-slate-950/30">
              <div className="text-sm text-slate-400">{stat.label}</div>
              <div className="mt-3 text-3xl font-bold text-white">{stat.value}</div>
            </div>
          ))}
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold text-white">Operational Snapshot</h2>
            <div className="mt-6 space-y-4">
              <div>
                <div className="mb-2 flex justify-between text-sm text-slate-300">
                  <span>Rental Inventory Utilization</span>
                  <span>76%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800">
                  <div className="h-2 w-[76%] rounded-full bg-teal-400" />
                </div>
              </div>

              <div>
                <div className="mb-2 flex justify-between text-sm text-slate-300">
                  <span>Engineer Allocation Coverage</span>
                  <span>89%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800">
                  <div className="h-2 w-[89%] rounded-full bg-cyan-400" />
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
            <h2 className="text-xl font-semibold text-white">Top Modules</h2>
            <ul className="mt-6 space-y-3 text-sm text-slate-300">
              {modules.map((module) => (
                <li key={module} className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                  • {module}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
