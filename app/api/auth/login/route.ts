import { NextResponse } from 'next/server';
import { verifyAdminPassword, createSessionToken, setSessionCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password, identifier } = body;

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password wajib diisi' },
        { status: 400 }
      );
    }

    const { isValid, user } = await verifyAdminPassword(password, identifier);

    if (!isValid || !user) {
      return NextResponse.json(
        { success: false, error: 'Password salah atau akun tidak ditemukan' },
        { status: 401 }
      );
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Anda bukan admin pengelola' },
        { status: 403 }
      );
    }

    const token = await createSessionToken(user.id, user.name, user.role);
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
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
