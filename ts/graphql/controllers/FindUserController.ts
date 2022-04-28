import { IUserInfo } from '@/database/UsersManagerDB';
import { Request, Response } from 'express';

import { UsersManagerDB } from '@/database/UsersManagerDB';
import { FindThrowErrorController } from '@/graphql/controllers/FindThrowErrorController';

export class FindUserController {
    async handle(request: Request, response: Response) {
        const {
            auth
        } = request.params;

        const findThrowErrorController = new FindThrowErrorController();
        const usersManagerDB = new UsersManagerDB();

        return response.json(await findThrowErrorController.handle<Omit<IUserInfo, "token"> | null>(
            usersManagerDB.getInfo(auth),
            'Não foi possível retornar o usuário.'
        ));
    }
}