import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { DeviceProvider } from '@/context/DeviceContext';
import { Navbar } from '@/components/layout/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Desk Hub Companion | Arduino Digital Companion & Ergonomics Portal',
  description:
    'Calm technology companion for the physical Arduino Desk Hub. Behavioral tracking, microbreak protocols, sedentary time loop, and researcher telemetry portal.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-calm-bg text-calm-text antialiased min-h-screen flex flex-col`}>
        <AuthProvider>
          <DeviceProvider>
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </main>
            <footer className="border-t border-calm-border/60 py-6 text-center text-xs text-slate-500 font-mono">
              <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                <div>
                  Desk Hub Companion • Built for Arduino IoT Physical Desk Hub • Cornell 20-8-2 Model
                </div>
                <div className="flex items-center gap-4 text-slate-400">
                  <span>Supabase RLS Protected</span>
                  <span>•</span>
                  <span>Researcher Telemetry Portal Active</span>
                </div>
              </div>
            </footer>
          </DeviceProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
