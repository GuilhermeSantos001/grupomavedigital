import { Address } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { FindThrowErrorController } from '@/graphql/controllers/FindThrowErrorController';

export class FindAllAddressesController {
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

    return response.json(await findThrowErrorController.handle<Address[] | null>(
      prismaClient.address.findMany({
        skip: skip ? Number(skip) : undefined,
        take: take ? Number(take) : undefined,
        orderBy: {
          cursorId: 'asc'
        },
        ...cursor,
        include: {
          street: true,
          neighborhood: true,
          city: true,
          district: true
        }
      }),
      'Não foi possível retornar os endereços.'
    ));
  }
}