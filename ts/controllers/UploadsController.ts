import { FileGridFS } from '@/drivers/FileGridFS';
import { ObjectId } from 'mongodb';

import { IUploadContract, IFileUpload } from '@/contracts/UploadContract';
import { WriteStream } from 'fs';
import { Response } from 'express';

import { UploadManagerDB } from '@/database/UploadsManagerDB';

export class UploadsController implements IUploadContract {
  private _uploadManagerDB: UploadManagerDB;
  private _fileGridFS: FileGridFS;
  private _lastVerifyTemporaryFiles!: Date

  constructor() {
    this._uploadManagerDB = new UploadManagerDB();
    this._fileGridFS = new FileGridFS();
  }

  private async _exists(fileId: string): Promise<boolean> {
    return await this._uploadManagerDB.exists(fileId);
  }

  private async _gridFSExists(fileId: string): Promise<boolean> {
    const file = await this._fileGridFS.findById(new ObjectId(fileId));

    return file ? true : false;
  }

  private async _gridFSRemove(fileId: string): Promise<boolean> {
    try {
      if (await this._gridFSExists(fileId))
        await this._fileGridFS.deleteFile(new ObjectId(fileId));

      return true;
    } catch {
      return false;
    }
  }

  private async _remove(fileId: string): Promise<boolean> {
    try {
      if (await this._exists(fileId))
        return await this._uploadManagerDB.remove(fileId);

      return true;
    } catch {
      return false;
    }
  }

  public async getAll(): Promise<IFileUpload[]> {
    return await this._uploadManagerDB.getAll();
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
      !this._lastVerifyTemporaryFiles ||
      new Date() > this._lastVerifyTemporaryFiles
    ) {
      this._lastVerifyTemporaryFiles = new Date();

      this
        ._lastVerifyTemporaryFiles
        .setMinutes(this._lastVerifyTemporaryFiles.getMinutes() + 5);

      await this.cleanTemporaryFiles();
    }

    const newFile = {
      ...file,
      expiredAt: file.temporary ? new Date(this.getTimeToExpire()).toISOString() : undefined,
      createdAt: new Date().toISOString()
    }

    return await this._uploadManagerDB.register(newFile);
  }

  public async makeTemporary(fileId: string, version?: number): Promise<boolean> {
    const expiredAt = new Date(this.getTimeToExpire()).toISOString();

    return await this._uploadManagerDB.makeTemporary(fileId, expiredAt, version);
  }

  public async makePermanent(fileId: string, version?: number): Promise<boolean> {
    return await this._uploadManagerDB.makePermanent(fileId, version);
  }

  public async remove(fileId: string): Promise<void> {
    await this._gridFSRemove(fileId);
    await this._remove(fileId);
  }

  public async raw(stream: WriteStream | Response, fileId: string): Promise<void> {
    const file = await this._fileGridFS.findById(new ObjectId(fileId));

    if (!file)
      throw new Error('Arquivo não encontrado');

    await this._fileGridFS.openDownloadStream(stream, new ObjectId(fileId), true);
  }
}