import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/contexts/AuthContext';

export const metadata: Metadata = {
  title: 'LinkUp - Find Your Perfect Dev Partner',
  description: 'AI-powered matching platform for developers to find hackathon teammates and collaborators',
  keywords: ['developer', 'hackathon', 'matching', 'collaboration', 'networking'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
