import { Posting } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { FindThrowErrorController } from '@/graphql/controllers/FindThrowErrorController';

export class FindPostingController {
    async handle(request: Request, response: Response) {
        const {
            id
        } = request.params;

        const findThrowErrorController = new FindThrowErrorController();

        return response.json(await findThrowErrorController.handle<Posting | null>(
            prismaClient.posting.findFirst({
                where: {
                    id
                },
                include: {
                    costCenter: {
                        select: {
                            value: true
                        }
                    },
                    covering: true,
                    coverage: true,
                    coveringWorkplace: true,
                    coverageWorkplace: true
                }
            }),
            'Não foi possível retornar o lançamento financeiro.'
        ));
    }
}