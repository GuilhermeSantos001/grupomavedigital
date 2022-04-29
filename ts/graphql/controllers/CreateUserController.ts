import { UserInterface } from '@/schemas/UsersSchema';
import { Request, Response } from 'express';

import { UsersManagerDB } from '@/database/UsersManagerDB'
import { CreateThrowErrorController } from '@/graphql/controllers/CreateThrowErrorController';

export class CreateUserController {
    async handle(request: Request, response: Response) {
        const {
            authorization,
            name,
            surname,
            username,
            email,
            password,
            cnpj,
            location,
            photoProfile,
            privileges,
        }: UserInterface = request.body;

        const createThrowErrorController = new CreateThrowErrorController();
        const usersManagerDB = new UsersManagerDB();

        return response.json(await createThrowErrorController.handle<boolean>(
            usersManagerDB.register({
                authorization,
                name,
                surname,
                username,
                email,
                password,
                cnpj,
                location,
                photoProfile,
                privileges,
            }),
            'Não foi possível criar o usuário.'
        ));
    }
}