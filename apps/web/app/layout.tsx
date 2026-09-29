import Link from 'next/link';

const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/inventory', label: 'Inventory' },
  { href: '/service-tickets', label: 'Service Tickets' },
  { href: '/gst', label: 'GST Reports' },
  { href: '/ocr', label: 'OCR Intake' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased">
        <div className="min-h-screen">
          <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
              <Link href="/" className="text-lg font-bold text-white">
                AV ERP
              </Link>

              <nav className="hidden items-center gap-4 md:flex">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href} className="text-sm text-slate-300 transition hover:text-white">
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="rounded-full border border-teal-500/40 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-300">
                Live ERP
              </div>
            </div>
          </header>

          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
