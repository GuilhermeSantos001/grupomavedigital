import { Street } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/db/prismaClient';
import { CreateThrowErrorController } from '@/graphql/controllers/CreateThrowErrorController';

export class CreateStreetController {
    async handle(request: Request, response: Response) {
        const {
            value
        }: Pick<Street, 'value'> = request.body;

        const createThrowErrorController = new CreateThrowErrorController();

        return response.json(await createThrowErrorController.handle<Street>(
            prismaClient.street.create({
                data: {
                    value
                }
            }),
            'Não foi possível criar a rua.'
        ));
    }
}