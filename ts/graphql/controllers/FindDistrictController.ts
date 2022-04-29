import { District } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { FindThrowErrorController } from '@/graphql/controllers/FindThrowErrorController';

export class FindDistrictController {
    async handle(request: Request, response: Response) {
        const {
            id
        } = request.params;

        const findThrowErrorController = new FindThrowErrorController();

        return response.json(await findThrowErrorController.handle<District | null>(
            prismaClient.district.findFirst({
                where: {
                    id
                }
            }),
            'Não foi possível retornar o distrito (Estado).'
        ));
    }
}