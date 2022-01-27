import { ReasonForAbsence } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/db/prismaClient';
import { CreateThrowErrorController } from '@/graphql/controllers/CreateThrowErrorController';

export class CreateReasonForAbsenceController {
    async handle(request: Request, response: Response) {
        const {
          value
        }: Pick<ReasonForAbsence, 'value'> = request.body;

        const createThrowErrorController = new CreateThrowErrorController();

        return response.json(await createThrowErrorController.handle<ReasonForAbsence>(
            prismaClient.reasonForAbsence.create({
                data: {
                    value
                }
            }),
            'Não foi possível criar o motivo da falta.'
        ));
    }
}