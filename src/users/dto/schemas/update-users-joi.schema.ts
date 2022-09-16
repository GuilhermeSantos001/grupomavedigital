import * as Joi from 'joi';

import { UpdateUserDto } from '@/users/dto/update-users.dto';

export const UpdateUserSchema = Joi.object<UpdateUserDto>({
  username: Joi.string().optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().optional(),
});
