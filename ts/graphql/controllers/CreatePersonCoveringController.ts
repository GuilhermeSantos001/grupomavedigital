import { PersonCovering } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { CreateThrowErrorController } from '@/graphql/controllers/CreateThrowErrorController';

export class CreatePersonCoveringController {
    async handle(request: Request, response: Response) {
        const {
            mirrorId,
            personId,
            reasonForAbsenceId
        }: Pick<PersonCovering, 'mirrorId' | 'personId' | 'reasonForAbsenceId'> = request.body;

        const createThrowErrorController = new CreateThrowErrorController();

        return response.json(await createThrowErrorController.handle<PersonCovering>(
            prismaClient.personCovering.create({
                data: {
                    mirrorId,
                    personId,
                    reasonForAbsenceId
                }
            }),
            'Não foi possível criar a pessoa que está sendo coberta.'
        ));
    }
}