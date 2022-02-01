import { Card } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { FindThrowErrorController } from '@/graphql/controllers/FindThrowErrorController';

export class FindAllCardsController {
  async handle(request: Request, response: Response) {
    const {
      skip,
      limit
    } = request.params;

    const findThrowErrorController = new FindThrowErrorController();

    return response.json(await findThrowErrorController.handle<Card[] | null>(
      prismaClient.card.findMany({
        skip: skip ? Number(skip) : undefined,
        take: limit ? Number(limit) : undefined,
        include: {
          costCenter: {
            select: {
              value: true
            }
          },
          person: {
            select: {
              matricule: true,
              name: true
            }
          }
        }
      }),
      'Não foi possível retornar os cartões benefícios (Alelo).'
    ));
  }
}