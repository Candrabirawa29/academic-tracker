import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, progressPercent } = body;

    const data: Record<string, unknown> = {};
    if (status !== undefined) data.status = status;
    if (progressPercent !== undefined) {
      data.progressPercent = progressPercent;
      data.progressUpdatedAt = new Date(); // reset jam stagnation setiap progress berubah
    }

    const updated = await prisma.task.update({
      where: { id },
      data,
      include: { checklists: true },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal update tugas' },
      { status: 500 }
    );
  }
}