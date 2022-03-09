import { PersonCoverage } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { FindThrowErrorController } from '@/graphql/controllers/FindThrowErrorController';

export class FindPersonCoverageController {
    async handle(request: Request, response: Response) {
        const {
            id
        } = request.params;

        const findThrowErrorController = new FindThrowErrorController();

        return response.json(await findThrowErrorController.handle<PersonCoverage | null>(
            prismaClient.personCoverage.findFirst({
                where: {
                    id
                },
                include: {
                    mirror: true,
                    person: true
                }
            }),
            'Não foi possível retornar a pessoa que está cobrindo.'
        ));
    }
}