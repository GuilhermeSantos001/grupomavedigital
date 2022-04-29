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
          covering: {
            include: {
              person: {
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
                  cards: {
                    include: {
                      costCenter: true,
                    }
                  },
                  personService: {
                    include: {
                      service: true
                    }
                  }
                }
              },
              reasonForAbsence: true,
              mirror: true,
            }
          },
          coverage: {
            include: {
              person: {
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
                  cards: {
                    include: {
                      costCenter: true,
                    }
                  },
                  personService: {
                    include: {
                      service: true
                    }
                  }
                }
              },
              mirror: true,
            }
          },
          coveringWorkplace: {
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
              }
            }
          },
          coverageWorkplace: {
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
              }
            }
          }
        }
      }),
      'Não foi possível retornar os lançamentos financeiros.'
    ));
  }
}