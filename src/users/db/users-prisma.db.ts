import * as _ from 'lodash';

import { UserDatabaseContract } from '@/users/contracts/users-database.contract';
import { PrismaService } from '@/core/prisma/prisma.service';

import { User, Role } from '@prisma/client';
import { UserEntity } from '@/users/entities/users.entity';

import {
  SimilarityFilter,
  SimilarityType,
} from '@/core/utils/similarity-filter.util';

export class UserPrismaDB extends UserDatabaseContract {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async create(data: User): Promise<UserEntity> {
    const user = await this.prismaService.user.create({
      data,
      include: {
        roles: {
          select: {
            role: true,
          },
        },
      },
    });

    return user
      ? {
          ...user,
          roles: user.roles.map((data) => data.role) as Role[],
        }
      : null;
  }

  async findAll(): Promise<UserEntity[]> {
    const users = await this.prismaService.user.findMany({
      include: {
        roles: {
          select: {
            role: true,
          },
        },
      },
    });

    return users.map((user) => ({
      ...user,
      roles: user.roles.map((data) => data.role) as Role[],
    }));
  }

  async findOne(id: string): Promise<UserEntity | never> {
    const user = await this.prismaService.user.findFirst({
      where: { id },
      include: {
        roles: {
          select: {
            role: true,
          },
        },
      },
    });

    return user
      ? {
          ...user,
          roles: user.roles.map((data) => data.role) as Role[],
        }
      : null;
  }

  async findBy(
    filter: Partial<UserEntity>,
    similarity?: SimilarityType,
  ): Promise<UserEntity[]> {
    const users = await this.prismaService.user.findMany({
      include: {
        roles: {
          select: {
            role: true,
          },
        },
      },
    });

    return users
      .filter((user) =>
        SimilarityFilter<User>(filter, user as any, similarity || 'full'),
      )
      .map((user) => ({
        ...user,
        roles: user.roles.map((data) => data.role) as Role[],
      }));
  }

  async findByEmail(email: string): Promise<UserEntity | never> {
    const hash = await this.hashByText(email);

    const user = await this.prismaService.user.findFirst({
      where: {
        hash: {
          path: ['email'],
          equals: hash,
        },
      },
      include: {
        roles: {
          select: {
            role: true,
          },
        },
      },
    });

    return user
      ? {
          ...user,
          roles: user.roles.map((data) => data.role) as Role[],
        }
      : null;
  }

  async update(id: string, newData: User): Promise<UserEntity> {
    const user = await this.prismaService.user.update({
      where: { id },
      data: { ..._.omitBy(newData, _.isNil) },
      include: {
        roles: {
          select: {
            role: true,
          },
        },
      },
    });

    return user
      ? {
          ...user,
          roles: user.roles.map((data) => data.role) as Role[],
        }
      : null;
  }

  async remove(id: string): Promise<boolean> {
    if ((await this.prismaService.user.count()) <= 0) return false;

    const user = await this.prismaService.user.delete({
      where: { id },
    });

    if (!user) return false;

    return true;
  }
}
