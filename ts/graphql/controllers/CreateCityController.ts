import { City } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { CreateThrowErrorController } from '@/graphql/controllers/CreateThrowErrorController';

export class CreateCityController {
    async handle(request: Request, response: Response) {
        const {
            value
        }: Pick<City, 'value'> = request.body;

        const createThrowErrorController = new CreateThrowErrorController();

        return response.json(await createThrowErrorController.handle<City>(
            prismaClient.city.create({
                data: {
                    value
                }
            }),
            'Não foi possível criar a cidade.'
        ));
    }
}