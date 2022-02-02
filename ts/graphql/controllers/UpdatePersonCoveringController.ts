import { PersonCovering } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { UpdateThrowErrorController } from '@/graphql/controllers/UpdateThrowErrorController';

export class UpdatePersonCoveringController {
  async handle(request: Request, response: Response) {
    const
      { id } = request.params,
      {
        mirrorId,
        reasonForAbsenceId
      }: Pick<PersonCovering, 'mirrorId' | 'reasonForAbsenceId'> = request.body;

    const updateThrowErrorController = new UpdateThrowErrorController();

    return response.json(await updateThrowErrorController.handle<PersonCovering>(
      prismaClient.personCovering.update({
        where: {
          id
        },
        data: {
          mirrorId,
          reasonForAbsenceId
        }
      }),
      'Não foi possível atualizar a pessoa que está sendo coberta.'
    ));
  }
}