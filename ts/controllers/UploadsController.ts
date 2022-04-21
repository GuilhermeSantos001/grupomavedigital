/**
 * @description Controle dos uploads de arquivos
 * @author GuilhermeSantos001
 * @update 31/01/2022
 */

import { FileGridFS } from '@/drivers/FileGridFS';
import { ObjectId } from 'mongodb';

import { IUploadContract, IFileUpload } from '@/contracts/UploadContract';
import { WriteStream } from 'fs';
import { Response } from 'express';

import { UploadManagerDB } from '@/database/UploadsManagerDB';

export class UploadsController implements IUploadContract {
  private uploadManagerDB: UploadManagerDB;
  private fileGridFS: FileGridFS;
  lastVerifyTemporaryFiles!: Date

  constructor() {
    this.uploadManagerDB = new UploadManagerDB();
    this.fileGridFS = new FileGridFS();
  }

  public async getAll(): Promise<IFileUpload[]> {
    return await this.uploadManagerDB.getAll();
  }

  public getTimeToExpire(): number {
    return Date.now() + (1000 * 60 * 60 * 24); // ! 1 Dia
  }

  public async cleanTemporaryFiles(): Promise<void> {
    const files = await this.getAll();

    for (const file of files.filter(file => file.temporary)) {
      if (!file.expiredAt || file.expiredAt && new Date() > new Date(file.expiredAt))
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
      expiredAt: file.temporary ? new Date(this.getTimeToExpire()).toISOString() : undefined,
      createdAt: new Date().toISOString()
    }

    return await this.uploadManagerDB.register(newFile);
  }

  public async makeTemporary(fileId: string, version?: number): Promise<boolean> {
    const files = await this.getAll();

    const indexOf = files.findIndex(file => file.fileId === fileId);

    if (indexOf === -1)
      return false;

    const expiredAt = new Date(this.getTimeToExpire()).toISOString();

    files[indexOf] = {
      ...files[indexOf],
      temporary: true,
      expiredAt
    }

    return await this.uploadManagerDB.makeTemporary(fileId, expiredAt, version);
  }

  public async makePermanent(fileId: string, version?: number): Promise<boolean> {
    const files = await this.getAll();

    const indexOf = files.findIndex(file => file.fileId === fileId);

    if (indexOf === -1)
      return false;

    files[indexOf] = {
      ...files[indexOf],
      temporary: false,
      expiredAt: undefined,
    }

    return await this.uploadManagerDB.makePermanent(fileId, version);
  }

  public async remove(fileId: string): Promise<boolean> {
    let files = await this.getAll();

    files = files.filter(file => file.fileId !== fileId);

    await this.fileGridFS.deleteFile(new ObjectId(fileId));

    return await this.uploadManagerDB.remove(fileId);
  }

  public async raw(stream: WriteStream | Response, fileId: string): Promise<void> {
    const file = await this.fileGridFS.findById(new ObjectId(fileId));

    if (!file)
      throw new Error('Arquivo não encontrado');

    await this.fileGridFS.openDownloadStream(stream, new ObjectId(fileId), true);
  }
}