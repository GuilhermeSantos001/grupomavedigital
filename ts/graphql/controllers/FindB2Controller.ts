import { B2 } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { FindThrowErrorController } from '@/graphql/controllers/FindThrowErrorController';

export class FindB2Controller {
  async handle(request: Request, response: Response) {
    const {
      id
    } = request.params;

    const findThrowErrorController = new FindThrowErrorController();

    return response.json(await findThrowErrorController.handle<B2 | null>(
      prismaClient.b2.findFirst({
        where: {
          id
        },
        include: {
          costCenter: true,
          personB2: {
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
          },
          workplaceOrigin: {
            include: {
              address: {
                include: {
                  street: true,
                  neighborhood: true,
                  city: true,
                  district: true
                }
              },
              scale: true,
              workplaceService: {
                include: {
                  service: true
                }
              },
            }
          },
          workplaceDestination: {
            include: {
              address: {
                include: {
                  street: true,
                  neighborhood: true,
                  city: true,
                  district: true
                }
              },
              scale: true,
              workplaceService: {
                include: {
                  service: true
                }
              },
            }
          }
        }
      }),
      'Não foi possível retornar o B2.'
    ));
  }
}