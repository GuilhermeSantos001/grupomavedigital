import { PersonCoverage } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { FindThrowErrorController } from '@/graphql/controllers/FindThrowErrorController';

export class FindAllPeopleCoverageController {
  async handle(request: Request, response: Response) {
    const {
      cursorId,
      skip,
      take
    } = request.query;

    const findThrowErrorController = new FindThrowErrorController();

    let cursor = {};

    if (cursorId) {
      cursor = {
        cursor: {
          cursorId: Number(cursorId)
        }
      }
    }

    return response.json(await findThrowErrorController.handle<PersonCoverage[] | null>(
      prismaClient.personCoverage.findMany({
        skip: skip ? Number(skip) : undefined,
        take: take ? Number(take) : undefined,
        orderBy: {
          cursorId: 'asc'
        },
        ...cursor,
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
          }
        }
      }),
      'Não foi possível retornar as pessoas que estão cobrindo.'
    ));
  }
}