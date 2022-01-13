/**
 * @description Schema dos uploads
 * @author GuilhermeSantos001
 * @update 11/01/2022
 */

import { Document, Schema, model } from "mongoose";

import { IFileUpload as uploadInterface } from '@/contracts/upload.contracts';

export interface uploadModelInterface extends uploadInterface, Document { }

export const uploadSchema: Schema = new Schema({
  fileId: { // ! ID do arquivo
    type: String,
    trim: true,
    unique: true,
    required: [true, '{PATH} este campo é obrigatório']
  },
  authorId: { // ! ID do autor
    type: String,
    trim: true,
    required: [true, '{PATH} este campo é obrigatório']
  },
  name: { // ! Nome do arquivo
    type: String,
    trim: true,
    required: [true, '{PATH} este campo é obrigatório']
  },
  description: { // ! Descrição do arquivo
    type: String,
    trim: true,
    required: [true, '{PATH} este campo é obrigatório']
  },
  size: { // ! Tamanho do arquivo
    type: Number,
    min: 0,
    required: [true, '{PATH} este campo é obrigatório']
  },
  temporary: { // ! Indica se o arquivo é temporário
    type: Boolean,
    default: false,
    required: [true, '{PATH} este campo é obrigatório']
  },
  expiredAt: { // ! Data de expiração do arquivo
    type: Date,
    default: undefined
  },
  createdAt: { // ! Data de criação do arquivo
    type: String,
    trim: true,
    required: [true, '{PATH} este campo é obrigatório']
  }
});

export default model<uploadModelInterface>("uploads", uploadSchema);