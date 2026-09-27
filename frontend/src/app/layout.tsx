import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: 'Profile Vault', description: 'Consent-first profile data workspace' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
