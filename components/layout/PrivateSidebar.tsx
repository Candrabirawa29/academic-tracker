'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Zap,
  ListTodo,
  Kanban,
  Flame,
  BarChart3,
  GraduationCap,
  FolderGit2,
  Bot,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';

type Props = {
  userName: string;
};

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
};

type NavSection = {
  title: string | null;
  items: NavItem[];
};

export default function PrivateSidebar({ userName }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoggingOut(false);
    }
  };

  const navSections: NavSection[] = [
    {
      title: null,
      items: [
        { label: 'Dashboard', href: '/home', icon: LayoutDashboard },
        { label: 'Quick Actions', href: '/home#quick-actions', icon: Zap },
      ],
    },
    {
      title: 'TUGAS & AGENDA',
      items: [
        { label: 'Semua Tugas', href: '/home/tasks', icon: ListTodo },
        { label: 'Kanban Board', href: '/home/kanban', icon: Kanban, badge: 'Soon' },
        { label: 'Focus Mode', href: '/home/focus', icon: Flame, badge: 'Soon' },
        { label: 'Progres', href: '/home/progress', icon: BarChart3, badge: 'Soon' },
      ],
    },
    {
      title: 'AKADEMIK',
      items: [
        { label: 'Mata Kuliah', href: '/home/courses', icon: GraduationCap, badge: 'Soon' },
        { label: 'Materi Kuliah', href: '/home/materials', icon: FolderGit2, badge: 'Soon' },
      ],
    },
    {
      title: 'INTEGRASI AI',
      items: [
        { label: 'AI Companion', href: '/home/companion', icon: Bot, badge: 'Phase 8' },
      ],
    },
    {
      title: 'PENGATURAN',
      items: [
        { label: 'Pengaturan', href: '/home/settings', icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* ── Mobile Header ────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur-md lg:hidden">
        <Link href="/home" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-xs">
            AO
          </div>
          <div>
            <span className="text-xs font-semibold text-foreground tracking-tight">Academic OS</span>
            <span className="block text-[10px] text-muted-foreground">Workspace</span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            className="h-8 w-8"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      {/* ── Mobile Backdrop ──────────────────────────────────────── */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* ── Sidebar Container (Desktop & Mobile Drawer) ─────────── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-border bg-card/95 backdrop-blur-md transition-transform duration-200 lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <Link href="/home" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-xs shadow-xs">
              AO
            </div>
            <div>
              <h1 className="text-xs font-semibold tracking-tight text-foreground">
                Academic OS
              </h1>
              <p className="text-[10px] font-medium text-muted-foreground">
                Personal Workspace
              </p>
            </div>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            className="h-7 w-7 text-muted-foreground hover:text-foreground lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navSections.map((sec, idx) => (
            <div key={idx} className="space-y-0.5">
              {sec.title && (
                <p className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {sec.title}
                </p>
              )}
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "group flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                      isActive
                        ? "bg-muted text-foreground font-semibold shadow-2xs"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={cn(
                          "h-3.5 w-3.5 shrink-0 transition-colors",
                          isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <Badge
                        variant="secondary"
                        className="px-1.5 py-0 text-[9px] font-normal h-4"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* User profile & actions footer */}
        <div className="border-t border-border p-3 space-y-2">
          <div className="flex items-center justify-between rounded-md border border-border/60 bg-muted/30 p-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground text-xs font-semibold border border-border">
                {userName.charAt(0)}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-foreground truncate">{userName}</p>
                <p className="text-[10px] text-muted-foreground">Pengelola</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <ThemeToggle />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                disabled={loggingOut}
                title="Keluar (Logout)"
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
