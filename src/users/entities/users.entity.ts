import { User, Role } from '@prisma/client';

export type UserEntity = User & {
  roles: Role[];
};
