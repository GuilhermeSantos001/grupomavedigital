import { PackageHours } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { FindThrowErrorController } from '@/graphql/controllers/FindThrowErrorController';

export class FindPackageHoursController {
  async handle(request: Request, response: Response) {
    const {
      id
    } = request.params;

    const findThrowErrorController = new FindThrowErrorController();

    return response.json(await findThrowErrorController.handle<PackageHours | null>(
      prismaClient.packageHours.findFirst({
        where: {
          id
        },
        include: {
          costCenter: true,
          personPH: {
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
      'Não foi possível retornar o Pacote de Horas.'
    ));
  }
}