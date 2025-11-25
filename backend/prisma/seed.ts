// Seed скрипт для начальных данных
// Создает роли, категории, админа

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Начало seed...');

  // Создание ролей
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: 'ROLE_ADMIN' },
      update: {},
      create: { name: 'ROLE_ADMIN', description: 'Администратор системы' },
    }),
    prisma.role.upsert({
      where: { name: 'ROLE_EDITOR' },
      update: {},
      create: { name: 'ROLE_EDITOR', description: 'Редактор новостей' },
    }),
    prisma.role.upsert({
      where: { name: 'ROLE_SUBSCRIBER' },
      update: {},
      create: { name: 'ROLE_SUBSCRIBER', description: 'Подписчик' },
    }),
  ]);

  console.log('✅ Роли созданы:', roles.map(r => r.name));

  // Создание категорий
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'IT' },
      update: {},
      create: { name: 'IT', description: 'Информационные технологии' },
    }),
    prisma.category.upsert({
      where: { name: 'Спорт' },
      update: {},
      create: { name: 'Спорт', description: 'Спортивные новости' },
    }),
    prisma.category.upsert({
      where: { name: 'Экономика' },
      update: {},
      create: { name: 'Экономика', description: 'Экономические новости' },
    }),
  ]);

  console.log('✅ Категории созданы:', categories.map(c => c.name));

  // Создание админа
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

  console.log('✅ Админ создан: admin@example.com / admin123');
  console.log('🎉 Seed завершен!');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
