import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkMutationAuth } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await checkMutationAuth(request);
    if (!auth.authorized || !auth.userId) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Autentikasi diperlukan.' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // 1. Cek keberadaan tugas
    const existingTask = await prisma.task.findUnique({
      where: { id },
      include: { checklists: true },
    });

    if (!existingTask) {
      return NextResponse.json(
        { success: false, error: 'Tugas tidak ditemukan' },
        { status: 404 }
      );
    }

    // 2. Resource Ownership Check: Hanya pemilik (atau bot resmi) yang dapat mengedit
    if (!auth.isBot && existingTask.userId !== auth.userId) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Anda bukan pemilik tugas ini' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      course,
      status,
      currentDeadline,
      difficulty,
      basePriority,
      estimatedTimeMinutes,
      progressPercent,
      checklists,
    } = body;

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (course !== undefined) updateData.course = course;
    if (status !== undefined) updateData.status = status;
    if (difficulty !== undefined) updateData.difficulty = difficulty;
    if (basePriority !== undefined) updateData.basePriority = basePriority;
    if (estimatedTimeMinutes !== undefined) updateData.estimatedTimeMinutes = estimatedTimeMinutes;

    if (currentDeadline !== undefined) {
      const deadlineDate = new Date(currentDeadline);
      if (!isNaN(deadlineDate.getTime())) {
        updateData.currentDeadline = deadlineDate;
      }
    }

    if (progressPercent !== undefined) {
      updateData.progressPercent = progressPercent;
      updateData.progressUpdatedAt = new Date();
    } else if (status === 'completed' && existingTask.status !== 'completed') {
      updateData.progressPercent = 100;
      updateData.progressUpdatedAt = new Date();
    }

    // 3. Sinkronisasi Checklists (jika dikirimkan di payload)
    if (Array.isArray(checklists)) {
      await prisma.taskChecklist.deleteMany({
        where: { taskId: id },
      });

      if (checklists.length > 0) {
        await prisma.taskChecklist.createMany({
          data: checklists.map((item: { title: string; type?: string; isChecked?: boolean }) => ({
            taskId: id,
            title: item.title,
            type: item.type || 'subtask',
            isChecked: Boolean(item.isChecked),
          })),
        });
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
      include: { checklists: true },
    });

    return NextResponse.json({ success: true, data: updatedTask });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui tugas' },
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
    if (!auth.authorized || !auth.userId) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Autentikasi diperlukan.' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // 1. Cek keberadaan tugas
    const existingTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask) {
      return NextResponse.json(
        { success: false, error: 'Tugas tidak ditemukan' },
        { status: 404 }
      );
    }

    // 2. Resource Ownership Check: Hanya pemilik (atau bot resmi) yang dapat menghapus
    if (!auth.isBot && existingTask.userId !== auth.userId) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Anda bukan pemilik tugas ini' },
        { status: 403 }
      );
    }

    // 3. Eksekusi Hapus (Cascade onDelete di schema Prisma otomatis membersihkan checklist & notificationLog)
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
