import { Neighborhood } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { CreateThrowErrorController } from '@/graphql/controllers/CreateThrowErrorController';

export class CreateNeighborhoodController {
    async handle(request: Request, response: Response) {
        const {
          value
        }: Pick<Neighborhood, 'value'> = request.body;

        const createThrowErrorController = new CreateThrowErrorController();

        return response.json(await createThrowErrorController.handle<Neighborhood>(
            prismaClient.neighborhood.create({
                data: {
                  value
                }
            }),
            'Não foi possível criar o bairro.'
        ));
    }
}