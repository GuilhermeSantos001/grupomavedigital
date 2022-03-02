import { Request, Response } from 'express';

import { UsersManagerDB } from '@/database/UsersManagerDB';
import { DeleteThrowErrorController } from '@/graphql/controllers/DeleteThrowErrorController';

export class DeleteUserController {
    async handle(request: Request, response: Response) {
        const {
            auth
        } = request.params;

        const deleteThrowErrorController = new DeleteThrowErrorController();
        const usersManagerDB = new UsersManagerDB();

        return response.json(await deleteThrowErrorController.handle(
            usersManagerDB.delete(auth),
            'Não foi possível deletar o usuário.'
        ));
    }
}