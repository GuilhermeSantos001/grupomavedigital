/**
 * @description Schema dos Jobs
 * @author @GuilhermeSantos001
 * @update 24/07/2021
 * @version 1.0.0
 */

import { Document, Schema, model } from "mongoose";

export type Types = 'mailsend';

export type Status = 'Available' | 'Processing' | 'Finish' | 'Error';

export type Priority = 'High' | 'Medium' | 'Low';

export interface DateAt {
    type: 'hours' | 'minutes' | 'seconds' | 'Days';
    add: number;
}

interface MailsendEconfirm {
    email: string;
    username: string;
    auth: string;
    token: string;
    temporarypass: string | null; // Identificador
    clientAddress: string;
}

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

interface MailsendAccountRetrieveTwofactor {
    email: string;
    username: string;
    token: string;
    twofactor: boolean; // Identificador
    clientAddress: string;
}

interface MailsendHerculesOrders {
    email: string;
    username: string;
    title: string;
    description: string;
    link: string;
    order: boolean; // Identificador
    clientAddress: string;
}

export interface jobInterface {
    cid?: string;
    name: string;
    priority: Priority;
    type: Types;
    args: MailsendEconfirm | MailsendSessionNewAccess | MailsendAccountRetrieveTwofactor | MailsendHerculesOrders;
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