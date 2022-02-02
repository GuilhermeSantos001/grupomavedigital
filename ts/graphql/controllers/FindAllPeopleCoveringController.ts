import { PersonCovering } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { FindThrowErrorController } from '@/graphql/controllers/FindThrowErrorController';

export class FindAllPeopleCoveringController {
  async handle(request: Request, response: Response) {
    const {
      skip,
      limit
    } = request.params;

    const findThrowErrorController = new FindThrowErrorController();

    return response.json(await findThrowErrorController.handle<PersonCovering[] | null>(
      prismaClient.personCovering.findMany({
        skip: skip ? Number(skip) : undefined,
        take: limit ? Number(limit) : undefined,
        include: {
          mirror: {
            select: {
              authorId: true,
              fileId: true,
              filename: true,
              filetype: true,
              description: true,
              version: true,
              size: true,
              compressedSize: true,
              temporary: true,
              expiredAt: true,
            }
          },
          person: {
            select: {
              matricule: true,
              name: true,
              mail: true,
              cards: true,
            }
          },
          reasonForAbsence: {
            select: {
              value: true
            }
          }
        }
      }),
      'Não foi possível retornar as pessoas que estão sendo cobertas.'
    ));
  }
}