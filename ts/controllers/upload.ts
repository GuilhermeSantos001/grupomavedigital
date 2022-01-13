/**
 * @description Controle dos uploads de arquivos
 * @author GuilhermeSantos001
 * @update 11/01/2022
 */

import FileGridFS from '@/drivers/file-gridfs';
import { ObjectId } from 'mongodb';

import IUploadContract, { IFileUpload } from '@/contracts/upload.contracts';
import { WriteStream } from 'fs';
import { Response } from 'express';

import uploadDB from '@/db/uploads-db';

class Upload implements IUploadContract {
  files: IFileUpload[];
  lastVerifyTemporaryFiles!: Date

  constructor() {
    this.files = [];
    this.initialize();
  }

  private async initialize(): Promise<void> {
    const data = await uploadDB.getAll();

    if (data.length > 0)
      for (const file of data) {
        this.files.push(file);
      }
  }

  public async getAll(): Promise<IFileUpload[]> {
    return await uploadDB.getAll();
  }

  public getTimeToExpire(): number {
    return Date.now() + (1000 * 60 * 5); // ! 5 minutos
  }

  public async cleanTemporaryFiles(): Promise<any> {
    for (const file of this.files.filter(file => file.temporary)) {
      if (!file.expiredAt || file.expiredAt && new Date() > file.expiredAt)
        await this.remove(file.fileId);
    }
  }

  public async register(file: IFileUpload): Promise<boolean> {
    if (
      !this.lastVerifyTemporaryFiles ||
      new Date() > this.lastVerifyTemporaryFiles
    ) {
      this.lastVerifyTemporaryFiles = new Date();

      this
        .lastVerifyTemporaryFiles
        .setMinutes(this.lastVerifyTemporaryFiles.getMinutes() + 5);

      await this.cleanTemporaryFiles();
    }

    const newFile = {
      ...file,
      expiredAt: file.temporary ? new Date(this.getTimeToExpire()) : undefined,
    }

    this.files.push(newFile);

    return await uploadDB.register(newFile);
  }

  public async remove(fileId: string): Promise<boolean> {
    this.files = this.files.filter(file => file.fileId !== fileId);

    await FileGridFS.deleteFile(new ObjectId(fileId));

    return await uploadDB.remove(fileId);
  }

  public async raw(stream: WriteStream | Response, fileId: string): Promise<void> {
    const file = await FileGridFS.findById(new ObjectId(fileId));

    if (!file)
      throw new Error('Arquivo não encontrado');

    return await FileGridFS.openDownloadStream(stream, new ObjectId(fileId), true);
  }
}

export default new Upload();