/**
 * @description Contrato de implementação da classe de upload
 * @author GuilhermeSantos001
 * @update 31/01/2022
 */

import { WriteStream } from "fs";

export interface IFileUpload {
  fileId: string
  authorId: string
  filename: string
  filetype: string
  description: string
  size: number
  compressedSize: number
  version: number
  temporary: boolean
  expiredAt?: string
  createdAt?: string
}

export interface IUploadContract {
  /**
   * @description Retorna o tempo de expiração de um arquivo temporario
   */
  getTimeToExpire(): number;

  /**
   * @description Limpa os arquivos temporários
   */
  cleanTemporaryFiles(): Promise<void>

  /**
   * @description Registra um novo arquivo hospedado
   */
  register(file: IFileUpload): Promise<boolean>

  /**
   * @description Deleta um arquivo hospedado
   */
  remove(fileId: string): Promise<void>

  /**
   * @description Retorna um stream do arquivo hospedado
   */
  raw(stream: WriteStream, fileId: string): Promise<void>
}