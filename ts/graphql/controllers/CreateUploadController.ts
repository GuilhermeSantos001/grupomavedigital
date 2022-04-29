import { Upload } from '@prisma/client';
import { Request, Response } from 'express';

import { prismaClient } from '@/database/PrismaClient';
import { CreateThrowErrorController } from '@/graphql/controllers/CreateThrowErrorController';
import { ResponseThrowErrorController } from '@/graphql/controllers/ResponseThrowErrorController';

export class CreateUploadController {
    async handle(request: Request, response: Response) {
        const {
            fileId,
            authorId,
            filename,
            filetype,
            description,
            size,
            compressedSize,
            version,
            temporary,
            expiredAt
        }: Pick<Upload,
            | 'fileId'
            | 'authorId'
            | 'filename'
            | 'filetype'
            | 'description'
            | 'size'
            | 'compressedSize'
            | 'version'
            | 'temporary'
            | 'expiredAt'
        > = request.body;

        const createThrowErrorController = new CreateThrowErrorController();
        const responseThrowErrorController = new ResponseThrowErrorController();

        if (await prismaClient.upload.findFirst({
            where: {
                authorId,
                filename,
                filetype,
                version
            }
        }))
            return response.json(await responseThrowErrorController.handle(
                new Error(`Upload(${filename}${filetype}) com a versão(${version}) do autor(${authorId}) já existe!`),
                'Tente com outra versão.'
            ));

        return response.json(await createThrowErrorController.handle<Upload>(
            prismaClient.upload.create({
                data: {
                    fileId,
                    authorId,
                    filename,
                    filetype,
                    description,
                    size,
                    compressedSize,
                    version,
                    temporary,
                    expiredAt
                }
            }),
            'Não foi possível criar o upload.'
        ));
    }
}