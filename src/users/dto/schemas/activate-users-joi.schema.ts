import * as Joi from 'joi';

import { ActivateUserDto } from '@/users/dto/activate-users.dto';

export const ActivateUserSchema = Joi.object<ActivateUserDto>({
  token: Joi.string().required(),
});
