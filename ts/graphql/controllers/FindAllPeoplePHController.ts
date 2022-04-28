import { PersonPH } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { FindThrowErrorController } from '@/graphql/controllers/FindThrowErrorController';

export class FindAllPeoplePHController {
  async handle(request: Request, response: Response) {
    const {
      skip,
      limit
    } = request.params;

    const findThrowErrorController = new FindThrowErrorController();

    return response.json(await findThrowErrorController.handle<PersonPH[] | null>(
      prismaClient.personPH.findMany({
        skip: skip ? Number(skip) : undefined,
        take: limit ? Number(limit) : undefined,
        include: {
          person: {
            include: {
              cards: true,
              scale: true,
              address: {
                include: {
                  street: true,
                  neighborhood: true,
                  city: true,
                  district: true
                }
              },
              personService: {
                include: {
                  service: true
                }
              }
            }
          }
        }
      }),
      'Não foi possível retornar as pessoas nos Pacote de Horas.'
    ));
  }
}