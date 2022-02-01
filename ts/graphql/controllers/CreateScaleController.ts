import { Scale } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { CreateThrowErrorController } from '@/graphql/controllers/CreateThrowErrorController';

export class CreateScaleController {
    async handle(request: Request, response: Response) {
        const {
            value
        }: Pick<Scale, 'value'> = request.body;

        const createThrowErrorController = new CreateThrowErrorController();

        return response.json(await createThrowErrorController.handle<Scale>(
            prismaClient.scale.create({
                data: {
                    value
                }
            }),
            'Não foi possível criar a escala de trabalho.'
        ));
    }
}