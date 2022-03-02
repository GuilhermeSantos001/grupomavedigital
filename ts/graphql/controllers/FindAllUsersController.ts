import { IUserInfo } from '@/database/UsersManagerDB';
import { Request, Response } from 'express';

import { UsersManagerDB } from '@/database/UsersManagerDB';
import { FindThrowErrorController } from '@/graphql/controllers/FindThrowErrorController';

export class FindAllUsersController {
  async handle(request: Request, response: Response) {
    const {
      skip,
      limit
    } = request.query;

    const findThrowErrorController = new FindThrowErrorController();
    const usersManagerDB = new UsersManagerDB();

    return response.json(await findThrowErrorController.handle<Omit<IUserInfo, "token">[] | null>(
      usersManagerDB.get({}, Number(skip), Number(limit)),
      'Não foi possível retornar os usuários.'
    ));
  }
}