import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NexusTrack Hackathon Platform',
  description: 'Lightweight hackathon management platform built with Next.js'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-900 text-slate-50 antialiased">
        {children}
      </body>
    </html>
  );
}

