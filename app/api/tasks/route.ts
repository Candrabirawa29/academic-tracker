import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkMutationAuth, getOwnerUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const auth = await checkMutationAuth(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Hanya pemilik atau bot yang dapat membuat tugas.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      course,
      currentDeadline,
      difficulty,
      basePriority,
      estimatedTimeMinutes,
      checklists,
    } = body;

    // Use authorized user ID, or fallback to owner ID
    const targetUserId = auth.userId || body.userId;
    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: 'Target user ID tidak valid' },
        { status: 400 }
      );
    }

    const deadlineDate = new Date(currentDeadline);
    if (isNaN(deadlineDate.getTime())) {
      return NextResponse.json(
        { success: false, error: 'currentDeadline tidak valid (bukan format tanggal yang benar)' },
        { status: 400 }
      );
    }

    const newTask = await prisma.task.create({
      data: {
        userId: targetUserId,
        title,
        description,
        course,
        currentDeadline: deadlineDate,
        difficulty,
        basePriority,
        estimatedTimeMinutes,
        checklists: {
          create: Array.isArray(checklists)
            ? checklists.map((item: { title: string; type?: 'preparation_item' | 'subtask' }) => ({
                title: item.title,
                type: item.type || 'subtask',
              }))
            : [],
        },
      },
      include: {
        checklists: true,
      },
    });

    return NextResponse.json({ success: true, data: newTask }, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal membuat tugas' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get('userId');

    // If no userId query provided, resolve owner user automatically
    if (!userId) {
      const owner = await getOwnerUser();
      userId = owner?.id ?? null;
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    const tasks = await prisma.task.findMany({
      where: { userId },
      include: { checklists: true },
      orderBy: { currentDeadline: 'asc' },
    });

    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data' },
      { status: 500 }
    );
  }
}