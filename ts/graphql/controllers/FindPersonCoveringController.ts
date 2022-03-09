import { PersonCovering } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { FindThrowErrorController } from '@/graphql/controllers/FindThrowErrorController';

export class FindPersonCoveringController {
    async handle(request: Request, response: Response) {
        const {
            id
        } = request.params;

        const findThrowErrorController = new FindThrowErrorController();

        return response.json(await findThrowErrorController.handle<PersonCovering | null>(
            prismaClient.personCovering.findFirst({
                where: {
                    id
                },
                include: {
                    mirror: true,
                    person: true,
                    reasonForAbsence: true
                }
            }),
            'Não foi possível retornar a pessoa que está sendo coberta.'
        ));
    }
}