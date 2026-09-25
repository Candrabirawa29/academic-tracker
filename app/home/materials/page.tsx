import { FolderGit2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default function MaterialsPlaceholderPage() {
  return (
    <main className="min-h-screen bg-background text-foreground px-4 py-12 sm:px-8 max-w-xl mx-auto flex flex-col items-center justify-center text-center">
      <Card className="border-border bg-card shadow-xs w-full">
        <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-foreground mb-1">
            <FolderGit2 className="h-6 w-6 text-primary" />
          </div>

          <Badge variant="secondary" className="text-[10px]">
            Phase 6 & 7 Feature
          </Badge>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Materi & Hierarki Pembelajaran
          </h1>
          <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
            Struktur hierarki Course → Topic → Subtopic → Material (PDF, Dokumen, PPT, Link, Catatan) akan hadir pada Phase 6 & 7.
          </p>

          <Button asChild variant="outline" size="sm">
            <Link href="/home" className="flex items-center gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
