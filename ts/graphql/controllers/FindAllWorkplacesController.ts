import { Workplace } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { FindThrowErrorController } from '@/graphql/controllers/FindThrowErrorController';

export class FindAllWorkplacesController {
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

    return response.json(await findThrowErrorController.handle<Workplace[] | null>(
      prismaClient.workplace.findMany({
        skip: skip ? Number(skip) : undefined,
        take: take ? Number(take) : undefined,
        orderBy: {
          cursorId: 'asc'
        },
        ...cursor,
        include: {
          address: {
            select: {
              street: {
                select: {
                  value: true
                }
              },
              number: true,
              complement: true,
              neighborhood: {
                select: {
                  value: true
                }
              },
              city: {
                select: {
                  value: true
                }
              },
              district: {
                select: {
                  value: true
                }
              },
              zipCode: true
            }
          },
          scale: {
            select: {
              value: true
            }
          },
          workplaceService: {
            select: {
              id: true,
              service: {
                select: {
                  value: true
                }
              }
            }
          }
        }
      }),
      'Não foi possível retornar os locais de trabalho.'
    ));
  }
}