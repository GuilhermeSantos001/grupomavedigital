import { Role, User } from '@prisma/client';

export type RoleEntity = Role & {
  users: User[];
};
