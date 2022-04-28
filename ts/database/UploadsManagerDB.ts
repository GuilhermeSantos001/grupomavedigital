/**
 * @description Gerenciador de informações com o banco de dados
 * @author GuilhermeSantos001
 * @update 31/01/2022
 */

import { UploadsSchema } from '@/schemas/UploadsSchema';
import Moment from '@/utils/moment';

import { IFileUpload } from '@/contracts/UploadContract';

export class UploadManagerDB {
  /**
   * @description Registra o upload de um arquivo
   */
  public async register(upload: IFileUpload): Promise<boolean> {
    const model = await UploadsSchema.create({
      ...upload,
      createdAt: Moment.format()
    });

    await model.validate();
    await model.save();

    return true;
  }

  /**
  * @description Torna um upload temporario
  */
  public async makeTemporary(fileId: string, expiredAt: string, version?: number): Promise<boolean> {
    const upload = await UploadsSchema.findOne({ fileId, version: version ? version : 1 });

    if (!upload)
      return false;

    upload.temporary = true;
    upload.expiredAt = expiredAt;

    await upload.save();

    return true;
  }

  /**
   * @description Torna um upload permanente
   */
  public async makePermanent(fileId: string, version?: number): Promise<boolean> {
    const upload = await UploadsSchema.findOne({ fileId, version: version ? version : 1 });

    if (!upload)
      return false;

    upload.temporary = false;
    upload.expiredAt = undefined;

    await upload.save();

    return true;
  }

  /**
   * @description Remove um upload
   */
  public async remove(fileId: string): Promise<boolean> {
    const model = await UploadsSchema.findOne({ fileId });

    if (!model)
      return false;

    await model.remove();

    return true;
  }

  /**
   * @description Retorna todos os uploads
   */
  public async exists(fileId: string): Promise<boolean> {
    const file = await UploadsSchema.exists({ fileId });

    return file ? true : false;
  }

  /**
   * @description Retorna todos os uploads
   */
  public async getAll(): Promise<IFileUpload[]> {
    const uploads = await UploadsSchema.find();

    return uploads.map(upload => ({
      authorId: upload.authorId,
      fileId: upload.fileId,
      filename: upload.filename,
      filetype: upload.filetype,
      description: upload.description,
      size: upload.size,
      compressedSize: upload.compressedSize,
      version: upload.version,
      temporary: upload.temporary,
      expiredAt: upload.expiredAt,
      createdAt: upload.createdAt
    }));
  }
}