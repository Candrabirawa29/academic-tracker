import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkMutationAuth } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await checkMutationAuth(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Hanya pemilik atau bot yang dapat mengubah tugas.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const {
      title,
      description,
      course,
      status,
      currentDeadline,
      progressPercent,
      difficulty,
      basePriority,
      estimatedTimeMinutes,
    } = body;

    const data: Record<string, unknown> = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (course !== undefined) data.course = course;
    if (status !== undefined) data.status = status;
    if (difficulty !== undefined) data.difficulty = difficulty;
    if (basePriority !== undefined) data.basePriority = basePriority;
    if (estimatedTimeMinutes !== undefined) data.estimatedTimeMinutes = estimatedTimeMinutes;
    if (currentDeadline !== undefined) {
      const deadlineDate = new Date(currentDeadline);
      if (!isNaN(deadlineDate.getTime())) {
        data.currentDeadline = deadlineDate;
      }
    }
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await checkMutationAuth(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Hanya pemilik yang dapat menghapus tugas.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Tugas berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus tugas' },
      { status: 500 }
    );
  }
}