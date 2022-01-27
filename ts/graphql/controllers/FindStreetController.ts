import { Street } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/db/prismaClient';
import { FindThrowErrorController } from '@/graphql/controllers/FindThrowErrorController';

export class FindStreetController {
    async handle(request: Request, response: Response) {
        const {
            id
        } = request.params;

        const findThrowErrorController = new FindThrowErrorController();

        return response.json(await findThrowErrorController.handle<Street | null>(
            prismaClient.street.findFirst({
                where: {
                    id
                }
            }),
            'Não foi possível retornar a rua.'
        ));
    }
}