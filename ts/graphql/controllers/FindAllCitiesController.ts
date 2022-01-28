import { City } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/db/prismaClient';
import { FindThrowErrorController } from '@/graphql/controllers/FindThrowErrorController';

export class FindAllCitiesController {
  async handle(request: Request, response: Response) {
    const {
      skip,
      limit
    } = request.params;

    const findThrowErrorController = new FindThrowErrorController();

    return response.json(await findThrowErrorController.handle<City[] | null>(
      prismaClient.city.findMany({
        skip: skip ? Number(skip) : undefined,
        take: limit ? Number(limit) : undefined
      }),
      'Não foi possível retornar as cidades.'
    ));
  }
}