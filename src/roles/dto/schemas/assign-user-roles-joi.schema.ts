import * as Joi from 'joi';

import { AssignUserRoleDto } from '@/roles/dto/assign-user-roles.dto';

export const AssignUserRoleSchema = Joi.object<AssignUserRoleDto>({
  id: Joi.string().required(),
  userId: Joi.string().required(),
});
