import { Address } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/db/prismaClient';
import { CreateThrowErrorController } from '@/graphql/controllers/CreateThrowErrorController';

export class CreateAddressController {
    async handle(request: Request, response: Response) {
        const {
            streetId,
            number,
            complement,
            neighborhoodId,
            cityId,
            districtId,
            zipCode
        }: Pick<Address, 'streetId' | 'number' | 'complement' | 'neighborhoodId' | 'cityId' | 'districtId' | 'zipCode'> = request.body;

        const createThrowErrorController = new CreateThrowErrorController();

        return response.json(await createThrowErrorController.handle<Address>(
            prismaClient.address.create({
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
            'Não foi possível criar o endereço.'
        ));
    }
}