import { Person } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { FindThrowErrorController } from '@/graphql/controllers/FindThrowErrorController';

export class FindAllPeopleController {
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

    return response.json(await findThrowErrorController.handle<Person[] | null>(
      prismaClient.person.findMany({
        skip: skip ? Number(skip) : undefined,
        take: take ? Number(take) : undefined,
        orderBy: {
          cursorId: 'asc'
        },
        ...cursor,
        include: {
          address: {
            select: {
              id: true,
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
              id: true,
              value: true
            }
          },
          personService: {
            select: {
              id: true,
              service: {
                select: {
                  id: true,
                  value: true
                }
              }
            }
          },
          cards: {
            select: {
              id: true,
              lotNum: true,
              serialNumber: true,
              lastCardNumber: true,
              costCenter: {
                select: {
                  id: true,
                  value: true
                }
              }
            }
          }
        }
      }),
      'Não foi possível retornar as pessoas.'
    ));
  }
}