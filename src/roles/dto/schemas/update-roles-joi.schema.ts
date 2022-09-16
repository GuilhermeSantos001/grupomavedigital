import * as Joi from 'joi';

import { UpdateRoleDto } from '@/roles/dto/update-roles.dto';

export const UpdateRoleSchema = Joi.object<UpdateRoleDto>({
  name: Joi.string().optional(),
});
