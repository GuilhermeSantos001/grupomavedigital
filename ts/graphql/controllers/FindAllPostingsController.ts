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
          costCenter: {
            select: {
              value: true
            }
          },
          covering: {
            include: {
              mirror: {
                select: {
                  authorId: true,
                  fileId: true,
                  filename: true,
                  filetype: true,
                  description: true,
                  version: true,
                  size: true,
                  compressedSize: true,
                  temporary: true,
                  expiredAt: true,
                }
              },
              person: {
                select: {
                  matricule: true,
                  name: true,
                  mail: true,
                  cards: true,
                }
              },
              reasonForAbsence: {
                select: {
                  value: true
                }
              }
            }
          },
          coverage: {
            include: {
              mirror: {
                select: {
                  authorId: true,
                  fileId: true,
                  filename: true,
                  filetype: true,
                  description: true,
                  version: true,
                  size: true,
                  compressedSize: true,
                  temporary: true,
                  expiredAt: true,
                }
              },
              person: {
                select: {
                  matricule: true,
                  name: true,
                  mail: true,
                  cards: true,
                }
              },
            }
          },
          coveringWorkplace: {
            include: {
              address: {
                select: {
                  street: {
                    select: {
                      value: true
                    }
                  },
                  number: true,
                  complement: true,
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
                  },
                  zipCode: true
                }
              },
              scale: {
                select: {
                  value: true
                }
              },
              workplaceService: {
                select: {
                  id: true,
                  service: {
                    select: {
                      value: true
                    }
                  }
                }
              }
            }
          },
          coverageWorkplace: {
            include: {
              address: {
                select: {
                  street: {
                    select: {
                      value: true
                    }
                  },
                  number: true,
                  complement: true,
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
                  },
                  zipCode: true
                }
              },
              scale: {
                select: {
                  value: true
                }
              },
              workplaceService: {
                select: {
                  id: true,
                  service: {
                    select: {
                      value: true
                    }
                  }
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