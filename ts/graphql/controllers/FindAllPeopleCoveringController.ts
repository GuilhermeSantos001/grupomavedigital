import { PersonCovering } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { FindThrowErrorController } from '@/graphql/controllers/FindThrowErrorController';

export class FindAllPeopleCoveringController {
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

    return response.json(await findThrowErrorController.handle<PersonCovering[] | null>(
      prismaClient.personCovering.findMany({
        skip: skip ? Number(skip) : undefined,
        take: take ? Number(take) : undefined,
        orderBy: {
          cursorId: 'asc'
        },
        ...cursor,
        include: {
          mirror: true,
          person: {
            include: {
              address: {
                include: {
                  street: true,
                  neighborhood: true,
                  city: true,
                  district: true
                }
              },
              scale: true,
              cards: {
                include: {
                  costCenter: true,
                }
              },
              personService: {
                include: {
                  service: true
                }
              }
            }
          },
          reasonForAbsence: true
        }
      }),
      'Não foi possível retornar as pessoas que estão sendo cobertas.'
    ));
  }
}