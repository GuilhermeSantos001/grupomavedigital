import { Neighborhood } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { FindThrowErrorController } from '@/graphql/controllers/FindThrowErrorController';

export class FindNeighborhoodController {
    async handle(request: Request, response: Response) {
        const {
            id
        } = request.params;

        const findThrowErrorController = new FindThrowErrorController();

        return response.json(await findThrowErrorController.handle<Neighborhood | null>(
            prismaClient.neighborhood.findFirst({
                where: {
                    id
                }
            }),
            'Não foi possível retornar o bairro.'
        ));
    }
}