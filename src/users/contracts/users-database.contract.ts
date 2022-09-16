import { CoreDatabaseContract } from '@/core/contracts/core-database.contract';

import { User } from '@prisma/client';
import { UserEntity } from '@/users/entities/users.entity';

export abstract class UserDatabaseContract extends CoreDatabaseContract<
  User,
  UserEntity
> {
  abstract findByEmail(email: string): Promise<UserEntity | never>;
}
