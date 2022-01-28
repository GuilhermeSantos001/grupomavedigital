import { Address } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/db/prismaClient';
import { FindThrowErrorController } from '@/graphql/controllers/FindThrowErrorController';

export class FindAllAddressesController {
  async handle(request: Request, response: Response) {
    const {
      skip,
      limit
    } = request.params;

    const findThrowErrorController = new FindThrowErrorController();

    return response.json(await findThrowErrorController.handle<Address[] | null>(
      prismaClient.address.findMany({
        skip: skip ? Number(skip) : undefined,
        take: limit ? Number(limit) : undefined,
        include: {
          street: {
            select: {
              value: true
            }
          },
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
          }
        }
      }),
      'Não foi possível retornar os endereços.'
    ));
  }
}