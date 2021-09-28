/**
 * @description Schema das atividades
 * @author @GuilhermeSantos001
 * @update 17/07/2021
 * @version 1.0.1
 */

import { Document, Schema, model } from "mongoose";

import { PrivilegesSystem } from '@/mongo/user-manager-mongo';

export interface activityInterface {
    ipremote: string;
    auth: string;
    privileges: PrivilegesSystem[];
    roadmap: string;
    createdAt?: string;
};

export interface activityModelInterface extends activityInterface, Document {
    authAndPrivilege: string;
};

export const activitySchema: Schema = new Schema({
    ipremote: { // Endereço de IP
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório']
    },
    auth: { // Código de acesso do usuário
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório']
    },
    privileges: { // Privilégios do usuário (administrador, supervisor, moderador, comum e etc)
        type: [String],
        default: ['common'],
        enum: {
            values: [
                'common',
                'administrador',
                'moderador',
                'supervisor'
            ],
            message: '{VALUE} este valor não é suportado'
        },
        required: [true, '{PATH} este campo é obrigatório']
    },
    roadmap: { // Ação realizada
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório']
    },
    createdAt: { // Data de registro
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório']
    }
});

activitySchema.virtual("filenameExt").get(function (this: activityModelInterface) {
    return this.auth + '(' + this.privileges.join(',') + ')';
});

export default model<activityModelInterface>("activities", activitySchema);