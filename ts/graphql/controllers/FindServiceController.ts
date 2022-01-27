import { Service } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/db/prismaClient';
import { FindThrowErrorController } from '@/graphql/controllers/FindThrowErrorController';

export class FindServiceController {
    async handle(request: Request, response: Response) {
        const {
            id
        } = request.params;

        const findThrowErrorController = new FindThrowErrorController();

        return response.json(await findThrowErrorController.handle<Service | null>(
            prismaClient.service.findFirst({
                where: {
                    id
                }
            }),
            'Não foi possível retornar o serviço.'
        ));
    }
}