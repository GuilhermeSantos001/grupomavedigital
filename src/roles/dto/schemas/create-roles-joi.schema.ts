import * as Joi from 'joi';

import { CreateRoleDto } from '@/roles/dto/create-roles.dto';

export const CreateRoleSchema = Joi.object<CreateRoleDto>({
  name: Joi.string().required(),
});
