import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      title,
      description,
      course,
      currentDeadline,
      difficulty,
      basePriority,
      estimatedTimeMinutes,
      checklists,
    } = body;

    const newTask = await prisma.task.create({
      data: {
        userId,
        title,
        description,
        course,
        currentDeadline: new Date(currentDeadline),
        difficulty,
        basePriority,
        estimatedTimeMinutes,
        checklists: {
          create: checklists.map((item: any) => ({
            title: item.title,
            type: item.type,
          })),
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