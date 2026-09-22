import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { isChecked } = await request.json();

    const updated = await prisma.taskChecklist.update({
      where: { id: params.id },
      data: { isChecked },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating checklist:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal update checklist' },
      { status: 500 }
    );
  }
}