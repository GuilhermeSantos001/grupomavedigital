import { ReasonForAbsence } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { FindThrowErrorController } from '@/graphql/controllers/FindThrowErrorController';

export class FindReasonForAbsenceController {
    async handle(request: Request, response: Response) {
        const {
            id
        } = request.params;

        const findThrowErrorController = new FindThrowErrorController();

        return response.json(await findThrowErrorController.handle<ReasonForAbsence | null>(
            prismaClient.reasonForAbsence.findFirst({
                where: {
                    id
                }
            }),
            'Não foi possível retornar o motivo de falta'
        ));
    }
}