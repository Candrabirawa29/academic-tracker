import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, title, description, currentDeadline, checklists } = body;

    // Insert data tugas sekaligus checklist barang bawaannya
    const newTask = await prisma.task.create({
      data: {
        userId,
        title,
        description,
        currentDeadline: new Date(currentDeadline),
        // Prisma memungkinkan kita insert relasi (checklists) secara langsung
        checklists: {
          create: checklists.map((item: any) => ({
            title: item.title,
            type: item.type, // 'preparation_item'
          })),
        },
      },
      include: {
        checklists: true, // Kembalikan response beserta checklistnya
      },
    });

    return NextResponse.json({ success: true, data: newTask }, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ success: false, error: 'Gagal membuat tugas' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  // Ambil userId dari URL query parameter (misal: /api/tasks?userId=123)
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ success: false, error: 'User ID tidak ditemukan' }, { status: 400 });
  }

  try {
    const tasks = await prisma.task.findMany({
      where: { userId: userId },
      include: {
        checklists: true, // Tarik juga data barang bawaan/subtask
      },
      orderBy: {
        currentDeadline: 'asc', // Urutkan dari deadline paling dekat
      },
    });

    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ success: false, error: 'Gagal menarik data tugas' }, { status: 500 });
  }
}