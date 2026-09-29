import './globals.css';

export const metadata = {
  title: 'AV ERP System',
  description: 'Lean ERP/CRM for AV trading and services',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
