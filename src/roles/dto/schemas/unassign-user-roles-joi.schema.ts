import * as Joi from 'joi';

import { UnassignUserRoleDto } from '@/roles/dto/unassign-user-roles.dto';

export const UnassignUserRoleSchema = Joi.object<UnassignUserRoleDto>({
  id: Joi.string().required(),
  userId: Joi.string().required(),
});
