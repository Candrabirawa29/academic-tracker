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
        { success: false, error: 'Akses ditolak: Hanya pemilik atau bot yang dapat mengubah checklist.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { isChecked } = await request.json();

    const updated = await prisma.taskChecklist.update({
      where: { id },
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