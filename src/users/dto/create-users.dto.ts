import { User } from '@prisma/client';

export type CreateUserDto = Pick<User, 'username' | 'email' | 'password'>;
