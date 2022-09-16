import { Injectable } from '@nestjs/common';

import { RoleEntity } from '@/roles/entities/roles.entity';

@Injectable()
export class RolesParser {
  toJSON(role: RoleEntity): Partial<RoleEntity> {
    return { ...role };
  }
}
