// User management controller (Admin only)

import type { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../db/prisma';
import { updateUserRoleSchema, updateUserStatusSchema } from '../schemas/user.schema';
import { logUserAction } from '../services/logging.service';
import { ACTION_TYPES } from '../config/constants';

export async function getAll(_request: unknown, reply: FastifyReply) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        isActive: true,
        roles: {
          include: { role: true },
        },
      },
    });

    reply.send({
      success: true,
      data: users,
    });
  } catch (error: any) {
    reply.status(400).send({
      success: false,
      error: error.message,
    });
  }
}

export async function updateRole(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: string };
    const data = updateUserRoleSchema.parse(request.body);
    const currentUserId = request.user?.userId;

    // Check: admin cannot remove their own admin role
    if (Number(id) === currentUserId && data.roleId !== 1) {
      return reply.status(403).send({
        success: false,
        error: 'You cannot change your own administrator role',
      });
    }

    // Check if user already has this role
    const existingRole = await prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId: Number(id),
          roleId: data.roleId,
        },
      },
    });

    if (existingRole) {
      return reply.status(400).send({
        success: false,
        error: 'User already has this role',
      });
    }

    // Add new role (do not remove existing ones!)
    await prisma.userRole.create({
      data: {
        userId: Number(id),
        roleId: data.roleId,
      },
    });

    await logUserAction({
      user: request.user,
      actionType: ACTION_TYPES.UPDATE_USER_ROLE,
      actionDetails: `Role ${data.roleId} added to user ID: ${id}`,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    });

    reply.send({
      success: true,
      message: 'Role added',
    });
  } catch (error: any) {
    reply.status(400).send({
      success: false,
      error: error.message,
    });
  }
}

export async function updateStatus(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: string };
    const data = updateUserStatusSchema.parse(request.body);
    const currentUserId = request.user?.userId;

    // Check: admin cannot deactivate themselves
    if (Number(id) === currentUserId && !data.isActive) {
      return reply.status(403).send({
        success: false,
        error: 'You cannot deactivate your own account',
      });
    }

    await prisma.user.update({
      where: { id: Number(id) },
      data: { isActive: data.isActive },
    });

    await logUserAction({
      user: request.user,
      actionType: data.isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
      actionDetails: `${data.isActive ? 'Activated' : 'Deactivated'} user ID: ${id}`,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    });

    reply.send({
      success: true,
      message: 'Status updated',
    });
  } catch (error: any) {
    reply.status(400).send({
      success: false,
      error: error.message,
    });
  }
}

export async function removeRole(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id, roleId } = request.params as { id: string; roleId: string };
    const currentUserId = request.user?.userId;

    // Check: admin cannot remove their own admin role
    if (Number(id) === currentUserId && Number(roleId) === 1) {
      return reply.status(403).send({
        success: false,
        error: 'You cannot remove your own administrator role',
      });
    }

    // Check that user has this role
    const userRole = await prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId: Number(id),
          roleId: Number(roleId),
        },
      },
    });

    if (!userRole) {
      return reply.status(404).send({
        success: false,
        error: 'Role not found for user',
      });
    }

    // Check that this is not the user's last role
    const userRolesCount = await prisma.userRole.count({
      where: { userId: Number(id) },
    });

    if (userRolesCount <= 1) {
      return reply.status(400).send({
        success: false,
        error: 'Cannot remove the user\'s last role',
      });
    }

    // Remove role
    await prisma.userRole.delete({
      where: {
        userId_roleId: {
          userId: Number(id),
          roleId: Number(roleId),
        },
      },
    });

    await logUserAction({
      user: request.user,
      actionType: 'REMOVE_USER_ROLE',
      actionDetails: `Role ${roleId} removed from user ID: ${id}`,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    });

    reply.send({
      success: true,
      message: 'Role removed',
    });
  } catch (error: any) {
    reply.status(400).send({
      success: false,
      error: error.message,
    });
  }
}
