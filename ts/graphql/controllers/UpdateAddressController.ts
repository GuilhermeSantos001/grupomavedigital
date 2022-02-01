import { Address } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { UpdateThrowErrorController } from '@/graphql/controllers/UpdateThrowErrorController';

export class UpdateAddressController {
  async handle(request: Request, response: Response) {
    const
      { id } = request.params,
      {
        streetId,
        number,
        complement,
        neighborhoodId,
        cityId,
        districtId,
        zipCode
      }: Pick<Address, 'streetId' | 'number' | 'complement' | 'neighborhoodId' | 'cityId' | 'districtId' | 'zipCode'> = request.body;

    const updateThrowErrorController = new UpdateThrowErrorController();

    return response.json(await updateThrowErrorController.handle<Address>(
      prismaClient.address.update({
        where: {
          id
        },
        data: {
          streetId,
          number,
          complement,
          neighborhoodId,
          cityId,
          districtId,
          zipCode
        }
      }),
      'Não foi possível atualizar o endereço.'
    ));
  }
}