'use client';

import { useState, useEffect } from 'react';
import { Settings, Shield, Smartphone, CheckCircle2, SunMoon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from 'next-themes';

export default function SettingsPage() {
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setUser(data.user);
        }
      });
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground px-4 py-6 sm:px-8 md:py-8 space-y-6 max-w-4xl mx-auto w-full">
      <div className="border-b border-border pb-5">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Pengaturan Akun & Sistem
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Konfigurasi preferensi tampilan, autentikasi, dan integrasi notifikasi
        </p>
      </div>

      <div className="space-y-4">
        {/* Appearance / Theme Card */}
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <SunMoon className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-semibold">Tema Tampilan</CardTitle>
            </div>
            <ThemeToggle />
          </CardHeader>

          <CardContent className="pt-4 text-xs space-y-3">
            <p className="text-muted-foreground">
              Pilih mode tampilan antarmuka yang paling nyaman untuk Anda.
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'light', label: 'Light Mode (Terang)' },
                { id: 'dark', label: 'Dark Mode (Gelap)' },
                { id: 'system', label: 'System Default (Otomatis)' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                    theme === t.id
                      ? 'border-primary bg-primary/10 text-primary font-semibold'
                      : 'border-input bg-card text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Profile Card */}
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center gap-2 pb-3 border-b border-border">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-semibold">Profil Pemilik</CardTitle>
          </CardHeader>

          <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-muted-foreground font-medium mb-1">Nama Pemilik</p>
              <p className="text-foreground font-semibold text-sm">{user?.name || 'Damar Raditya'}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium mb-1">Status Autentikasi</p>
              <Badge variant="success" className="gap-1">
                <CheckCircle2 className="h-3 w-3" /> Owner Authenticated
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp Notification Integration Card */}
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center gap-2 pb-3 border-b border-border">
            <Smartphone className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-semibold">Integrasi WhatsApp Bot</CardTitle>
          </CardHeader>

          <CardContent className="pt-4 space-y-4 text-xs">
            <p className="text-muted-foreground leading-relaxed">
              Bot WhatsApp terhubung langsung ke backend Academic OS untuk mengirimkan pengingat tenggat waktu, checklist persiapan barang, dan briefing harian.
            </p>

            <div className="rounded-md border border-border bg-muted/30 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status Bot Notifikasi</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Aktif & Terhubung
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-muted-foreground">Endpoint Notifikasi</span>
                <span className="font-mono text-muted-foreground text-[11px]">/api/notifications</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
