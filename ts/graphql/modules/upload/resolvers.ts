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
    singleUpload: async (parent: unknown, args: { file: any, size: string, signedUrl: string, auth: string }) => {
      try {
        if (verifySignedURL(decompressFromBase64(args.signedUrl) || "")) {
          const {
            authorization
          } = await userManagerDB.getInfo(args.auth);

          const
            { createReadStream, filename } = await args.file,
            result = await finished(authorization, filename, createReadStream(), parseInt(args.size));

          if (result.status === 'Active') {
            return {
              authorId: authorization,
              name: filename,
              size: parseInt(args.size),
              ...result
            };
          } else {
            await FileGridFS.deleteFile(result.fileId);
            throw new TypeError('File is corrupted.');
          }
        } else {
          throw new TypeError(`Your token is invalid!`);
        }
      } catch (error) {
        throw new TypeError(error instanceof TypeError ? error.message : JSON.stringify(error));
      }
    },
    multipleUpload: async (parent: unknown, args: { files: any[], sizes: string[], signedUrl: string, auth: string }) => {
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
              result = await finished(authorization, filename, createReadStream(), size);

            if (result.status !== 'Active')
              await FileGridFS.deleteFile(result.fileId)

            results.push({
              authorId: authorization,
              name: filename,
              size,
              ...result
            });
          }

          return results;
        } else {
          throw new TypeError(`Your token is invalid!`);
        }
      } catch (error) {
        throw new TypeError(error instanceof TypeError ? error.message : JSON.stringify(error));
      }
    }
  }
}