require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const crypto = require('crypto');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL tidak ditemukan di .env');
    process.exit(1);
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    console.log('⏳ 1. Menyiapkan kolom role, password, email di database PostgreSQL...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;
    `);
    console.log('✅ Kolom database berhasil dipastikan.');

    const adminPassword = process.argv[2] || process.env.OWNER_PASSWORD || 'damar2026';
    const hashedPassword = hashPassword(adminPassword);

    let user = await prisma.user.findFirst({
      orderBy: { createdAt: 'asc' },
    });

    if (user) {
      await prisma.$executeRawUnsafe(
        'UPDATE users SET role = $1, password = $2 WHERE id = $3::uuid',
        'admin',
        hashedPassword,
        user.id
      );
      console.log(`✅ Akun user "${user.name}" (${user.id}) sekarang berstatus ADMIN dengan password terenkripsi.`);
    } else {
      const newId = crypto.randomUUID();
      await prisma.$executeRawUnsafe(
        'INSERT INTO users (id, name, whatsapp_number, role, password) VALUES ($1::uuid, $2, $3, $4, $5)',
        newId,
        'Damar Raditya',
        process.env.WHATSAPP_NUMBER || '6281234567890',
        'admin',
        hashedPassword
      );
      console.log(`✅ Dibuat akun Admin baru: Damar Raditya (${newId})`);
    }

    console.log('🎉 Setup Admin Sukses!');
    console.log('🔐 Password Admin yang aktif:', adminPassword);
    console.log('Akun admin kamu sekarang 100% tersimpan di database PostgreSQL.');
  } catch (err) {
    console.error('❌ Gagal setup admin:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
