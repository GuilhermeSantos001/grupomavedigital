import { Posting } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { FindThrowErrorController } from '@/graphql/controllers/FindThrowErrorController';

export class FindAllPostingsController {
  async handle(request: Request, response: Response) {
    const {
      skip,
      limit
    } = request.params;

    const findThrowErrorController = new FindThrowErrorController();

    return response.json(await findThrowErrorController.handle<Posting[] | null>(
      prismaClient.posting.findMany({
        skip: skip ? Number(skip) : undefined,
        take: limit ? Number(limit) : undefined,
        include: {
          costCenter: true,
          covering: true,
          coverage: true,
          coveringWorkplace: true,
          coverageWorkplace: true
        }
      }),
      'Não foi possível retornar os lançamentos financeiros.'
    ));
  }
}