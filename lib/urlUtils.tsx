import React from 'react';
import { ExternalLink } from 'lucide-react';

export type LinkMetadata = {
  url: string;
  label: string;
  badge: string;
  isSubmission: boolean;
  domain: string;
};

/**
 * Ekstrak seluruh URL HTTP/HTTPS unik dari teks
 */
export function extractUrls(text?: string | null): string[] {
  if (!text) return [];
  const urlRegex = /(https?:\/\/[^\s<>()"']+)/gi;
  const rawMatches = text.match(urlRegex) || [];

  // Bersihkan tanda baca di akhir URL seperti titik, koma, kurung tutup
  const cleaned = rawMatches.map((u) => u.replace(/[.,;:)]]+$/, ''));
  return Array.from(new Set(cleaned));
}

/**
 * Deteksi metadata portal atau tujuan dari URL
 */
export function getLinkMetadata(url: string): LinkMetadata {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    const full = url.toLowerCase();

    if (host.includes('classroom.google.com')) {
      return { url, label: 'Google Classroom', badge: 'Classroom', isSubmission: true, domain: host };
    }
    if (host.includes('forms.gle') || (host.includes('docs.google.com') && full.includes('/forms/'))) {
      return { url, label: 'Google Forms (Pengumpulan)', badge: 'G-Forms', isSubmission: true, domain: host };
    }
    if (host.includes('drive.google.com')) {
      return { url, label: 'Google Drive Folder / Berkas', badge: 'G-Drive', isSubmission: true, domain: host };
    }
    if (host.includes('esemesta') || host.includes('e-semesta')) {
      return { url, label: 'Portal E-SEMESTA', badge: 'E-Semesta', isSubmission: true, domain: host };
    }
    if (host.includes('moodle') || host.includes('elearning') || host.includes('kuliah') || host.includes('spada')) {
      return { url, label: 'LMS / Portal E-Learning', badge: 'LMS', isSubmission: true, domain: host };
    }
    if (host.includes('github.com')) {
      return { url, label: 'Repositori GitHub', badge: 'GitHub', isSubmission: false, domain: host };
    }
    if (host.includes('notion.so') || host.includes('notion.site')) {
      return { url, label: 'Halaman Dokumen Notion', badge: 'Notion', isSubmission: false, domain: host };
    }
    if (host.includes('zoom.us') || host.includes('meet.google.com')) {
      return { url, label: 'Ruang Meeting Virtual', badge: 'Meeting', isSubmission: false, domain: host };
    }
    if (host.includes('youtube.com') || host.includes('youtu.be')) {
      return { url, label: 'Video Panduan / Referensi', badge: 'YouTube', isSubmission: false, domain: host };
    }

    const cleanDomain = host.replace(/^www\./, '');
    return { url, label: cleanDomain, badge: 'Tautan Luar', isSubmission: false, domain: cleanDomain };
  } catch {
    return { url, label: 'Tautan Web', badge: 'Tautan', isSubmission: false, domain: 'web' };
  }
}

/**
 * Memecah teks biasa menjadi elemen React dengan tautan yang dapat diklik (clickable)
 */
export function formatTextWithLinks(text?: string | null): React.ReactNode {
  if (!text) return null;

  // Split by URL pattern
  const urlRegex = /(https?:\/\/[^\s<>()"']+)/gi;
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (part.match(/^https?:\/\//i)) {
      const cleanUrl = part.replace(/[.,;:)]]+$/, '');
      const trailingPunctuation = part.slice(cleanUrl.length);
      return (
        <React.Fragment key={index}>
          <a
            href={cleanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-medium underline underline-offset-2 hover:text-primary/80 transition-colors inline-flex items-center gap-0.5 break-all"
            onClick={(e) => e.stopPropagation()}
          >
            {cleanUrl}
            <ExternalLink className="inline-block h-3 w-3 shrink-0 ml-0.5" />
          </a>
          {trailingPunctuation}
        </React.Fragment>
      );
    }
    return part;
  });
}
