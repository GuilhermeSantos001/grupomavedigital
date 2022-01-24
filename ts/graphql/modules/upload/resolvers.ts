/**
 * @description Rotas de upload
 * @author GuilhermeSantos001
 * @update 15/11/2021
 */

import { decompressFromBase64 } from "lz-string";

import { ObjectId } from 'mongodb';
import FileGridFS, { FileType } from '@/drivers/file-gridfs';
import { matches } from '@/mongo/files-manager-mongo';

import verifySignedURL from '@/utils/verifySignedURL';
import userManagerDB from '@/db/user-db';

import Sugar from 'sugar';
import Random from '@/utils/random';

const
  finished = (authorId: string, filename: string, stream: any, size: number) => new Promise<{
    fileId: ObjectId
    version: number
    compressedSize: number
    status: FileType
  }>((resolve, reject) => {
    const parseFilename = String(filename).substring(0, String(filename).lastIndexOf('.')).replace(matches.specialCharacters, ' ').replace(/\s{2,}/g, ' '),
      filetype = String(filename).substring(String(filename).lastIndexOf('.'));

    return FileGridFS.get(
      authorId,
      parseFilename,
      filetype
    )
      .then(version => {
        return FileGridFS.openUploadStream(stream, {
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
          const {
            authorization
          } = await userManagerDB.getInfo(args.auth);

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
            await FileGridFS.deleteFile(result.fileId);
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
          const {
            authorization
          } = await userManagerDB.getInfo(args.auth);

          const results: any[] = [];

          let i = 0;

          for (const file of args.files) {
            const
              { createReadStream, filename } = await file,
              size = parseInt(args.sizes[i++]),
              randomName = args.randomName ? `${Random.UUID(32, 'hex')}${filename.substring(filename.lastIndexOf('.'))}` : filename,
              result = await finished(authorization, randomName, createReadStream(), size);

            if (result.status !== 'Active')
              await FileGridFS.deleteFile(result.fileId)

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
    }
  }
}