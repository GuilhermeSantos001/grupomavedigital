/**
 * @description Gerenciador de informações com o banco de dados
 * @author GuilhermeSantos001
 * @update 11/01/2022
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
      name: upload.name,
      size: upload.size,
      compressedSize: upload.compressedSize,
      version: upload.version,
      temporary: upload.temporary,
      expire: upload.expire,
      createdAt: upload.createdAt
    }));
  }
}

export default new uploadManagerDB();