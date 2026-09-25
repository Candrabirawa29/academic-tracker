import { NextResponse } from 'next/server';
import { verifyOwnerPassword, getOwnerUser, createSessionToken, setSessionCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password wajib diisi' },
        { status: 400 }
      );
    }

    if (!verifyOwnerPassword(password)) {
      return NextResponse.json(
        { success: false, error: 'Password salah. Akses ditolak.' },
        { status: 401 }
      );
    }

    const owner = await getOwnerUser();
    if (!owner) {
      return NextResponse.json(
        { success: false, error: 'User owner tidak ditemukan di database' },
        { status: 500 }
      );
    }

    const token = await createSessionToken(owner.id, owner.name);
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: owner.id,
        name: owner.name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat login' },
      { status: 500 }
    );
  }
}
