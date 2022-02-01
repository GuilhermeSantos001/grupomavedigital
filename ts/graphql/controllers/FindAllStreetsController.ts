import { Street } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { FindThrowErrorController } from '@/graphql/controllers/FindThrowErrorController';

export class FindAllStreetsController {
  async handle(request: Request, response: Response) {
    const {
      skip,
      limit
    } = request.params;

    const findThrowErrorController = new FindThrowErrorController();

    return response.json(await findThrowErrorController.handle<Street[] | null>(
      prismaClient.street.findMany({
        skip: skip ? Number(skip) : undefined,
        take: limit ? Number(limit) : undefined
      }),
      'Não foi possível retornar as ruas.'
    ));
  }
}