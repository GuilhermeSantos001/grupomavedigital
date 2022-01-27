import { ReasonForAbsence } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/db/prismaClient';
import { UpdateThrowErrorController } from '@/graphql/controllers/UpdateThrowErrorController';

export class UpdateReasonForAbsenceController {
  async handle(request: Request, response: Response) {
    const
      { id } = request.params,
      {
        value
      }: Pick<ReasonForAbsence, 'value'> = request.body;

    const updateThrowErrorController = new UpdateThrowErrorController();

    return response.json(await updateThrowErrorController.handle<ReasonForAbsence>(
      prismaClient.reasonForAbsence.update({
        where: {
          id
        },
        data: {
          value
        }
      }),
      'Não foi possível atualizar o motivo da falta.'
    ));
  }
}