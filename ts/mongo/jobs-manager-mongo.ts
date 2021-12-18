/**
 * @description Schema dos Jobs
 * @author @GuilhermeSantos001
 * @update 01/10/2021
 */

import { Document, Schema, model } from "mongoose";

export type Types = 'mailsend';

export type Status = 'Available' | 'Processing' | 'Finish' | 'Error';

export type Priority = 'High' | 'Medium' | 'Low';

export interface DateAt {
    type: 'hours' | 'minutes' | 'seconds' | 'Days';
    add: number;
}

// E-mail de confirmação da conta
interface MailsendEconfirm {
    email: string;
    username: string;
    auth: string;
    token: string;
    temporarypass: string | null; // Identificador usado para diferenciar das de mais interfaces
    clientAddress: string;
}

// E-mail de novo acesso há conta
interface MailsendSessionNewAccess {
    email: string;
    username: string;
    navigator: { // Identificador
        browser: string;
        os: string;
        locationIP: string;
        internetAdress: string;
    },
    clientAddress: string;
}

// E-mail de recuperação da conta caso perca a senha
interface MailsendForgotPassword {
    email: string;
    username: string;
    signature: string;
    token: string;
    forgotPassword: boolean; // Identificador
    clientAddress: string;
}

// E-mail de recuperação da conta caso perca o autenticador
interface MailsendAccountRetrieveTwofactor {
    email: string;
    username: string;
    token: string;
    twofactor: boolean; // Identificador
    clientAddress: string;
}

// E-mail de pedidos do hercules storage
interface MailsendHerculesOrders {
    email: string;
    username: string;
    title: string;
    description: string;
    link: string;
    order: boolean; // Identificador
    clientAddress: string;
}

export type Jobs =
    | MailsendEconfirm
    | MailsendSessionNewAccess
    | MailsendForgotPassword
    | MailsendAccountRetrieveTwofactor
    | MailsendHerculesOrders
    ;

export interface jobInterface {
    cid?: string;
    name: string;
    priority: Priority;
    type: Types;
    args: Jobs;
    status: Status;
    error?: string;
    runAt?: DateAt;
    date?: string;
    createdAt?: string;
}

export interface jobModelInterface extends jobInterface, Document {
    isAvailable: boolean;
    isFinish: boolean;
    isError: boolean;
}

export const runAtSchema: Schema = new Schema({
    type: {
        type: String,
        trim: true,
        enum: {
            values: [
                'hours',
                'minutes',
                'seconds',
                'Days'
            ],
            message: '{VALUE} este valor não é suportado'
        },
        required: [true, '{PATH} este campo é obrigatório']
    },
    add: {
        type: Number,
        default: 1,
        min: 1,
        max: 99,
        required: [true, '{PATH} este campo é obrigatório']
    }
});

export const jobSchema: Schema = new Schema({
    cid: {
        type: String,
        trim: true,
        unique: true,
        required: [true, '{PATH} este campo é obrigatório']
    },
    name: {
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório']
    },
    priority: {
        type: String,
        trim: true,
        enum: {
            values: [
                'High',
                'Medium',
                'Low'
            ],
            message: '{VALUE} este valor não é suportado'
        },
        required: [true, '{PATH} este campo é obrigatório']
    },
    type: {
        type: String,
        trim: true,
        enum: {
            values: [
                'mailsend'
            ],
            message: '{VALUE} este valor não é suportado'
        },
        required: [true, '{PATH} este campo é obrigatório']
    },
    args: {
        type: Schema.Types.Mixed,
        required: [true, '{PATH} este campo é obrigatório']
    },
    status: {
        type: String,
        trim: true,
        enum: {
            values: [
                'Available',
                'Processing',
                'Finish',
                'Error'
            ],
            message: '{VALUE} este valor não é suportado'
        },
        required: [true, '{PATH} este campo é obrigatório']
    },
    error: {
        type: String,
        trim: true,
        required: [false, '{PATH} este campo é obrigatório']
    },
    runAt: {
        type: runAtSchema,
        required: [false, '{PATH} este campo não é obrigatório']
    },
    date: {
        type: String,
        trim: true,
        required: [false, '{PATH} este campo é obrigatório']
    },
    createdAt: { // Data de registro
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório']
    }
});

jobSchema.virtual("isAvailable").get(function (this: jobModelInterface) {
    return this.status === 'Available';
});

jobSchema.virtual("isFinish").get(function (this: jobModelInterface) {
    return this.status === 'Finish';
});

jobSchema.virtual("isError").get(function (this: jobModelInterface) {
    return this.status === 'Error';
});

export default model<jobModelInterface>("jobs", jobSchema);