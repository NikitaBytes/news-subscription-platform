// Authentication service

import { prisma } from '../db/prisma';
import { hashPassword, verifyPassword } from '../utils/hash';
import { ROLES } from '../config/constants';
import type { RegisterInput, LoginInput } from '../schemas/auth.schema';
import type { SafeUser } from '../types';

export async function registerUser(data: RegisterInput): Promise<SafeUser> {
  // Check if user exists
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email: data.email }, { username: data.username }],
    },
  });

  if (existing) {
    throw new Error('A user with this email or username already exists');
  }

  // Password hashing (OWASP: bcrypt)
  const passwordHash = await hashPassword(data.password);

  // Create user
  const user = await prisma.user.create({
    data: {
      username: data.username,
      email: data.email,
      passwordHash,
    },
  });

  // Assign SUBSCRIBER role by default
  const subscriberRole = await prisma.role.findUnique({
    where: { name: ROLES.SUBSCRIBER },
  });

  if (subscriberRole) {
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: subscriberRole.id,
      },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
}

export async function loginUser(data: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    include: {
      roles: {
        include: { role: true },
      },
    },
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    throw new Error('Account is deactivated');
  }

  const valid = await verifyPassword(data.password, user.passwordHash);
  if (!valid) {
    throw new Error('Invalid email or password');
  }

  const roles = user.roles.map((ur) => ur.role.name);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _, ...safeUser } = user;

  return {
    user: safeUser,
    roles,
  };
}

export async function getUserWithRoles(userId: number) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: {
        include: { role: true },
      },
    },
  });
}
