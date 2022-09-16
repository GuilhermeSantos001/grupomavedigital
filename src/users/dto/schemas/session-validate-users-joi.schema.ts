import * as Joi from 'joi';

import { SessionValidateUserDto } from '@/users/dto/session-validate-users.dto';

export const SessionValidateUserSchema = Joi.object<SessionValidateUserDto>({
  id: Joi.string().required(),
  token_value: Joi.string().required(),
  token_signature: Joi.string().required(),
  token_revalidate_value: Joi.string().required(),
  token_revalidate_signature: Joi.string().required(),
});
