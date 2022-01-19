/**
 * @description Gerenciador de informações com o banco de dados
 * @author GuilhermeSantos001
 * @update 17/01/2022
 */

import uploadDB from '@/mongo/uploads-manager-mongo';
import Moment from '@/utils/moment';

import { IFileUpload } from '@/contracts/upload.contracts';

class uploadManagerDB {
  /**
   * @description Registra o upload de um arquivo
   */
  public async register(upload: IFileUpload): Promise<boolean> {
    const model = await uploadDB.create({
      ...upload,
      createdAt: Moment.format()
    });

    await model.validate();
    await model.save();

    return true;
  }

  /**
   * @description Torna um upload permanente
   */
  public async makePermanent(fileId: string, version?: number): Promise<boolean> {
    const upload = await uploadDB.findOne({ fileId, version: version ? version : 1 });

    if (!upload)
      return false;

    upload.temporary = false;
    upload.expiredAt = undefined;

    await upload.save();

    return true;
  }

  /**
   * @description Torna um upload temporario
   */
  public async makeTemporary(fileId: string, expiredAt: string, version?: number): Promise<boolean> {
    const upload = await uploadDB.findOne({ fileId, version: version ? version : 1 });

    if (!upload)
      return false;

    upload.temporary = true;
    upload.expiredAt = expiredAt;

    await upload.save();

    return true;
  }

  /**
   * @description Remove um upload
   */
  public async remove(fileId: string): Promise<boolean> {
    const model = await uploadDB.findOne({ fileId });

    if (!model)
      return false;

    await model.remove();

    return true;
  }

  /**
   * @description Retorna todos os uploads
   */
  public async getAll(): Promise<IFileUpload[]> {
    const uploads = await uploadDB.find();

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

export default new uploadManagerDB();