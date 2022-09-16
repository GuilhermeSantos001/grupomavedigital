import { Injectable } from '@nestjs/common';

import { UserEntity } from '@/users/entities/users.entity';

@Injectable()
export class UsersParser {
  toJSON(user: UserEntity): Partial<UserEntity> {
    return {
      id: user.id,
      username: user.username,
      roles: user.roles,
      session: user.session,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
