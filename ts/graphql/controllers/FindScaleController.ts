import { Scale } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { FindThrowErrorController } from '@/graphql/controllers/FindThrowErrorController';

export class FindScaleController {
    async handle(request: Request, response: Response) {
        const {
            id
        } = request.params;

        const findThrowErrorController = new FindThrowErrorController();

        return response.json(await findThrowErrorController.handle<Scale | null>(
            prismaClient.scale.findFirst({
                where: {
                    id
                }
            }),
            'Não foi possível retornar a escala de trabalho.'
        ));
    }
}