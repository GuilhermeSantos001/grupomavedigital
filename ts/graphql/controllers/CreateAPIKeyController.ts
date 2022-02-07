import { APIKey } from '@prisma/client';
import { Request, Response } from 'express';

import { createHash } from "crypto";
import { v4 as uuidv4 } from "uuid";

import { prismaClient } from '@/database/PrismaClient';
import { CreateThrowErrorController } from '@/graphql/controllers/CreateThrowErrorController';
import { ResponseThrowErrorController } from '@/graphql/controllers/ResponseThrowErrorController';
import { ValidationMailController } from '@/graphql/controllers/ValidationMailController';

export class CreateAPIKeyController {
    async handle(request: Request, response: Response) {
        let {
            title,
            key,
            passphrase,
            username,
            userMail
        }: Pick<APIKey,
            | 'title'
            | 'key'
            | 'passphrase'
            | 'username'
            | 'userMail'
        > = request.body;

        const createThrowErrorController = new CreateThrowErrorController();
        const responseThrowErrorController = new ResponseThrowErrorController();
        const validationMailController = new ValidationMailController();

        if (!key)
            key = createHash('sha256').update(uuidv4()).digest('hex');

        if (title.length < 8)
            return response.json(await responseThrowErrorController.handle(
                new Error('O titulo deve ter no mínimo 8 caracteres.'),
                'Propriedade title inválida.',
            ));

        if (key.length < 8)
            return response.json(await responseThrowErrorController.handle(
                new Error('A chave deve ter no mínimo 8 caracteres.'),
                'Propriedade key inválida.',
            ));

        if (passphrase.length < 5)
            return response.json(await responseThrowErrorController.handle(
                new Error('O segredo deve ter no mínimo 5 caracteres.'),
                'Propriedade passphrase inválida.',
            ));

        if (!await validationMailController.handle(userMail))
            return response.json(await responseThrowErrorController.handle(
                new Error('Formato do e-mail informado não está válido'),
                'Propriedade userMail inválida.',
            ));

        return response.json(await createThrowErrorController.handle<APIKey>(
            prismaClient.aPIKey.create({
                data: {
                    title,
                    key,
                    passphrase,
                    username,
                    userMail
                }
            }),
            'Não foi possível criar a chave de API.'
        ));
    }
}