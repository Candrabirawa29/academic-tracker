import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rankTasksByFocus } from '@/lib/scoring';
import type { Task } from '@/lib/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId wajib diisi' },
        { status: 400 }
      );
    }

    const tasks = await prisma.task.findMany({
      where: { userId },
      include: { checklists: true },
    });

    const normalized: Task[] = tasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      course: t.course,
      status: t.status,
      currentDeadline: t.currentDeadline.toISOString(),
      progressPercent: t.progressPercent,
      progressUpdatedAt: t.progressUpdatedAt.toISOString(),
      difficulty: t.difficulty,
      basePriority: t.basePriority,
      estimatedTimeMinutes: t.estimatedTimeMinutes,
      checklists: t.checklists,
    }));

    const ranked = rankTasksByFocus(normalized);

    return NextResponse.json({ success: true, data: ranked });
  } catch (error) {
    console.error('Error computing focus ranking:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghitung focus ranking' },
      { status: 500 }
    );
  }
}