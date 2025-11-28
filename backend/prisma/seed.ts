// Seed script for initial data
// Creates roles, categories, admin

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create roles
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: 'ROLE_ADMIN' },
      update: {},
      create: { name: 'ROLE_ADMIN', description: 'System administrator' },
    }),
    prisma.role.upsert({
      where: { name: 'ROLE_EDITOR' },
      update: {},
      create: { name: 'ROLE_EDITOR', description: 'News editor' },
    }),
    prisma.role.upsert({
      where: { name: 'ROLE_SUBSCRIBER' },
      update: {},
      create: { name: 'ROLE_SUBSCRIBER', description: 'Subscriber' },
    }),
  ]);

  console.log('✅ Roles created:', roles.map(r => r.name));

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'IT' },
      update: {},
      create: { name: 'IT', description: 'Information technology' },
    }),
    prisma.category.upsert({
      where: { name: 'Спорт' },
      update: {},
      create: { name: 'Спорт', description: 'Sports news' },
    }),
    prisma.category.upsert({
      where: { name: 'Экономика' },
      update: {},
      create: { name: 'Экономика', description: 'Economic news' },
    }),
  ]);

  console.log('✅ Categories created:', categories.map(c => c.name));

  // Create admin
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@example.com',
      passwordHash: adminPassword,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: admin.id,
        roleId: roles[0].id, // ROLE_ADMIN
      },
    },
    update: {},
    create: {
      userId: admin.id,
      roleId: roles[0].id,
    },
  });

  console.log('✅ Admin created: admin@example.com / admin123');
  console.log('🎉 Seed finished!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
