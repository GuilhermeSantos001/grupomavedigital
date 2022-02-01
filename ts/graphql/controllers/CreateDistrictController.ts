import { District } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { CreateThrowErrorController } from '@/graphql/controllers/CreateThrowErrorController';

export class CreateDistrictController {
    async handle(request: Request, response: Response) {
        const {
            value
        }: Pick<District, 'value'> = request.body;

        const createThrowErrorController = new CreateThrowErrorController();

        return response.json(await createThrowErrorController.handle<District>(
            prismaClient.district.create({
                data: {
                    value
                }
            }),
            'Não foi possível criar o distrito (Estado).'
        ));
    }
}