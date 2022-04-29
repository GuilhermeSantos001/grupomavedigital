import { Request, Response } from 'express';

import { UsersManagerDB , UpdateUserInfo} from '@/database/UsersManagerDB';
import { UpdateThrowErrorController } from '@/graphql/controllers/UpdateThrowErrorController';

export class UpdateUserController {
  async handle(request: Request, response: Response) {
    const
      { auth } = request.params,
      {
        name,
        surname,
        username,
        email,
        cnpj,
        location,
      }: UpdateUserInfo = request.body;
    const updateThrowErrorController = new UpdateThrowErrorController();
    const usersManagerDB = new UsersManagerDB();

    return response.json(await updateThrowErrorController.handle<boolean>(
      usersManagerDB.updateData(auth, {
        name,
        surname,
        username,
        email,
        cnpj,
        location,
      }),
      'Não foi possível atualizar o usuário.'
    ));
  }
}