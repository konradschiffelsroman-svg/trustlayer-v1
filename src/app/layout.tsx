import './globals.css';
import { SupabaseSessionProvider } from './supabase-session-provider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <SupabaseSessionProvider>{children}</SupabaseSessionProvider>
      </body>
    </html>
  );
}
