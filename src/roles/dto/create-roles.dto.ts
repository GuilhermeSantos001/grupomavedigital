import { Role } from '@prisma/client';

export type CreateRoleDto = Pick<Role, 'name'>;
