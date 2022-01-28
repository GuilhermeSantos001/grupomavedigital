import { Person } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/db/prismaClient';
import { FindThrowErrorController } from '@/graphql/controllers/FindThrowErrorController';

export class FindAllPeopleController {
  async handle(request: Request, response: Response) {
    const {
      skip,
      limit
    } = request.params;

    const findThrowErrorController = new FindThrowErrorController();

    return response.json(await findThrowErrorController.handle<Person[] | null>(
      prismaClient.person.findMany({
        skip: skip ? Number(skip) : undefined,
        take: limit ? Number(limit) : undefined,
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
          service: {
            select: {
              value: true
            }
          },
          cards: {
            select: {
              serialNumber: true,
              lastCardNumber: true,
              costCenter: {
                select: { value: true }
              }
            }
          }
        }
      }),
      'Não foi possível retornar as pessoas.'
    ));
  }
}