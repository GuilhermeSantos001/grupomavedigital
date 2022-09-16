import * as _ from 'lodash';

import { RoleDatabaseContract } from '@/roles/contracts/roles-database.contract';
import { PrismaService } from '@/core/prisma/prisma.service';

import { Role, User } from '@prisma/client';
import { RoleEntity } from '@/roles/entities/roles.entity';

import {
  SimilarityFilter,
  SimilarityType,
} from '@/core/utils/similarity-filter.util';

export class RolePrismaDB extends RoleDatabaseContract {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async create(data: Role): Promise<RoleEntity> {
    const role = await this.prismaService.role.create({
      data,
      include: {
        users: {
          select: {
            user: true,
          },
        },
      },
    });

    return role
      ? {
          ...role,
          users: role.users.map((data) => data.user) as User[],
        }
      : null;
  }

  async findAll(): Promise<RoleEntity[]> {
    const roles = await this.prismaService.role.findMany({
      include: {
        users: {
          select: {
            user: true,
          },
        },
      },
    });

    return roles.map((role) => ({
      ...role,
      users: role.users.map((data) => data.user) as User[],
    }));
  }

  async findOne(id: string): Promise<RoleEntity | never> {
    const role = await this.prismaService.role.findFirst({
      where: { id },
      include: {
        users: {
          select: {
            user: true,
          },
        },
      },
    });

    return role
      ? {
          ...role,
          users: role.users.map((data) => data.user) as User[],
        }
      : null;
  }

  async findBy(
    filter: Partial<Role>,
    similarity?: SimilarityType,
  ): Promise<RoleEntity[]> {
    const roles = await this.prismaService.role.findMany({
      include: {
        users: {
          select: {
            user: true,
          },
        },
      },
    });

    return roles
      .filter((role) =>
        SimilarityFilter<Role>(filter, role as any, similarity || 'full'),
      )
      .map((role) => ({
        ...role,
        users: role.users.map((data) => data.user) as User[],
      }));
  }

  async findByName(name: string): Promise<RoleEntity | never> {
    const role = await this.prismaService.role.findFirst({
      where: {
        name,
      },
      include: {
        users: {
          select: {
            user: true,
          },
        },
      },
    });

    return role
      ? {
          ...role,
          users: role.users.map((data) => data.user) as User[],
        }
      : null;
  }

  async update(id: string, newData: Role): Promise<RoleEntity> {
    const role = await this.prismaService.role.update({
      where: { id },
      data: { ..._.omitBy(newData, _.isNil) },
      include: {
        users: {
          select: {
            user: true,
          },
        },
      },
    });

    return role
      ? {
          ...role,
          users: role.users.map((data) => data.user) as User[],
        }
      : null;
  }

  async remove(id: string): Promise<boolean> {
    if ((await this.prismaService.role.count()) <= 0) return false;

    const role = await this.prismaService.role.delete({
      where: { id },
    });

    if (!role) return false;

    return true;
  }

  async assignUser(roleId: string, userId: string): Promise<boolean> {
    const role = await this.prismaService.role.findFirst({
      where: { id: roleId },
    });

    const user = await this.prismaService.user.findFirst({
      where: { id: userId },
    });

    if (!role || !user) return false;

    const rolesOnUsers = await this.prismaService.rolesOnUsers.create({
      data: {
        roleId,
        userId,
      },
    });

    if (!rolesOnUsers) return false;

    return true;
  }

  async unassignUser(roleId: string, userId: string): Promise<boolean> {
    const role = await this.prismaService.rolesOnUsers.findFirst({
      where: {
        roleId,
        userId,
      },
    });

    if (!role) return false;

    const rolesOnUsers = await this.prismaService.rolesOnUsers.delete({
      where: {
        userId_roleId: {
          roleId,
          userId,
        },
      },
    });

    if (!rolesOnUsers) return false;

    return true;
  }
}
