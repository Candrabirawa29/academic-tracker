import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import PrivateSidebar from '@/components/layout/PrivateSidebar';

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login?from=/home');
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans antialiased">
      {/* Sidebar navigation */}
      <PrivateSidebar userName={session.name} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
