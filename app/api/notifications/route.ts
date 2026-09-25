import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    const notificationType = searchParams.get('type');
    const channel = searchParams.get('channel') || 'whatsapp';

    if (!taskId || !notificationType) {
      return NextResponse.json(
        { success: false, error: 'taskId dan type wajib diisi' },
        { status: 400 }
      );
    }

    const existing = await prisma.notificationLog.findUnique({
      where: {
        taskId_notificationType_channel: { taskId, notificationType, channel },
      },
    });

    return NextResponse.json({ success: true, exists: Boolean(existing) });
  } catch (error) {
    console.error('Error checking notification log:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengecek log notifikasi' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { taskId, notificationType, channel = 'whatsapp' } = body;

    if (!taskId || !notificationType) {
      return NextResponse.json(
        { success: false, error: 'taskId dan notificationType wajib diisi' },
        { status: 400 }
      );
    }

    const log = await prisma.notificationLog.create({
      data: { taskId, notificationType, channel },
    });

    return NextResponse.json({ success: true, data: log }, { status: 201 });
  } catch (error: unknown) {
    // Unique constraint violation = memang sudah pernah dicatat sebelumnya.
    // Ini kondisi normal (race condition/retry), bukan error sungguhan.
    if (error && typeof error === 'object' && 'code' in error && (error as { code?: string }).code === 'P2002') {
      return NextResponse.json({ success: true, exists: true });
    }
    console.error('Error creating notification log:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mencatat notifikasi' },
      { status: 500 }
    );
  }
}