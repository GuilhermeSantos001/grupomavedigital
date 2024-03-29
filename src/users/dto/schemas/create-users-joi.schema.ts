import * as Joi from 'joi';

import { CreateUserDto } from '@/users/dto/create-users.dto';

export const CreateUserSchema = Joi.object<CreateUserDto>({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
