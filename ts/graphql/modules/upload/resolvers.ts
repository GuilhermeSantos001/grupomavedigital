/**
 * @description Rotas de upload
 * @author GuilhermeSantos001
 * @update 31/01/2022
 */

import { decompressFromBase64 } from "lz-string";

import { ObjectId } from 'mongodb';
import { FileGridFS, FileType } from '@/drivers/FileGridFS';
import { matches } from '@/schemas/FilesSchema';

import verifySignedURL from '@/utils/verifySignedURL';
import { UsersManagerDB } from '@/database/UsersManagerDB';
import { UploadsController } from '@/controllers/UploadsController';

import Sugar from 'sugar';
import Random from '@/utils/random';

const
  finished = (authorId: string, filename: string, stream: any, size: number) => new Promise<{
    fileId: ObjectId
    version: number
    compressedSize: number
    status: FileType
  }>((resolve, reject) => {
    const
      fileGridFS = new FileGridFS(),
      parseFilename = String(filename).substring(0, String(filename).lastIndexOf('.')).replace(matches.specialCharacters, ' ').replace(/\s{2,}/g, ' '),
      filetype = String(filename).substring(String(filename).lastIndexOf('.'));

    return fileGridFS.get(
      authorId,
      parseFilename,
      filetype
    )
      .then(version => {
        return fileGridFS.openUploadStream(stream, {
          authorId,
          filename: parseFilename,
          filetype: filetype,
          size: Sugar.Number.bytes(size, 2, true),
          version: ++version,
          status: 'Active'
        })
          .then(({ fileId, version, compressedSize, status }) => resolve({
            fileId,
            version,
            compressedSize,
            status
          }))
          .catch(error => reject(error));
      })
      .catch(error => reject(error));
  });

module.exports = {
  Mutation: {
    singleUpload: async (parent: unknown, args: { file: any, size: string, signedUrl: string, auth: string, randomName: boolean }) => {
      try {
        if (verifySignedURL(decompressFromBase64(args.signedUrl) || "")) {
          const
            usersManagerDB = new UsersManagerDB(),
            fileGridFS = new FileGridFS(),
            {
              authorization
            } = await usersManagerDB.getInfo(args.auth);

          const
            { createReadStream, filename } = await args.file,
            randomName = args.randomName ? `${Random.UUID(32, 'hex')}${filename.substring(filename.lastIndexOf('.'))}` : filename,
            result = await finished(authorization, randomName, createReadStream(), parseInt(args.size));

          if (result.status === 'Active') {
            return {
              authorId: authorization,
              name: randomName,
              size: parseInt(args.size),
              ...result
            };
          } else {
            await fileGridFS.deleteFile(result.fileId);
            throw new Error('File is corrupted.');
          }
        } else {
          throw new Error(`Your token is invalid!`);
        }
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : JSON.stringify(error));
      }
    },
    multipleUpload: async (parent: unknown, args: { files: any[], sizes: string[], signedUrl: string, auth: string, randomName: boolean }) => {
      try {
        if (verifySignedURL(decompressFromBase64(args.signedUrl) || "")) {
          const
            usersManagerDB = new UsersManagerDB(),
            fileGridFS = new FileGridFS(),
            {
              authorization
            } = await usersManagerDB.getInfo(args.auth);

          const results: any[] = [];

          let i = 0;

          for (const file of args.files) {
            const
              { createReadStream, filename } = await file,
              size = parseInt(args.sizes[i++]),
              randomName = args.randomName ? `${Random.UUID(32, 'hex')}${filename.substring(filename.lastIndexOf('.'))}` : filename,
              result = await finished(authorization, randomName, createReadStream(), size);

            if (result.status !== 'Active')
              await fileGridFS.deleteFile(result.fileId)

            results.push({
              authorId: authorization,
              name: randomName,
              size,
              ...result
            });
          }

          return results;
        } else {
          throw new Error(`Your token is invalid!`);
        }
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : JSON.stringify(error));
      }
    },
    makeTemporaryUpload: async (parent: unknown, args: { fileId: string, version?: number | undefined, signedUrl: string }) => {
      try {
        if (verifySignedURL(decompressFromBase64(args.signedUrl) || "")) {
          const uploadsController = new UploadsController();

          return await uploadsController.makeTemporary(args.fileId, args.version);
        } else {
          throw new Error(`Your token is invalid!`);
        }
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : JSON.stringify(error));
      }
    },
    makePermanentUpload: async (parent: unknown, args: { fileId: string, version?: number | undefined, signedUrl: string }) => {
      try {
        if (verifySignedURL(decompressFromBase64(args.signedUrl) || "")) {
          const uploadsController = new UploadsController();

          return await uploadsController.makePermanent(args.fileId, args.version);
        } else {
          throw new Error(`Your token is invalid!`);
        }
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : JSON.stringify(error));
      }
    },
  }
}