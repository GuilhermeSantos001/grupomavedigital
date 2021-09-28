/**
 * @description Schema das atividades
 * @author @GuilhermeSantos001
 * @update 17/07/2021
 * @version 1.0.1
 */

import { Document, Schema, model } from "mongoose";

import { VCard } from '@/core/vcard';

export interface Photo {
    path: string;
    name: string;
};

export interface Whatsapp {
    phone: string;
    text: string;
    message: string;
};

export interface Socialmedia {
    name: SocialmediaName;
    value: string;
    enabled: boolean;
};

export type SocialmediaName = 'Facebook' | 'Youtube' | 'Linkedin' | 'Instagram' | 'Twitter';

export interface Footer {
    email: string;
    location: string;
    website: string;
    attachment: string;
    socialmedia: Socialmedia[];
};

export interface cardsInterface {
    cid: string;
    version: string;
    photo: Photo;
    name: string;
    jobtitle: string;
    phones: string[];
    whatsapp: Whatsapp;
    vcard: VCard;
    footer: Footer;
    createdAt?: string;
};

export interface cardsModelInterface extends cardsInterface, Document {
    phone1: string;
    phone2: string;
};

export const photoSchema: Schema = new Schema({
    path: {
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    name: {
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    }
});

export const whatsappSchema: Schema = new Schema({
    phone: {
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    text: {
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    message: {
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    }
});

export const birthdaySchema: Schema = new Schema({
    year: {
        type: Number,
        min: [1920, 'O valor do caminho `{PATH}` (`{VALUE}`) é menor que o comprimento mínimo permitido ({MINLENGTH}).'],
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    month: {
        type: Number,
        min: [0, 'O valor do caminho `{PATH}` (`{VALUE}`) é menor que o comprimento mínimo permitido ({MINLENGTH}).'],
        max: [11, 'O valor do caminho `{PATH}` (`{VALUE}`) excedeu o comprimento máximo permitido ({MAXLENGTH}).'],
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    day: {
        type: Number,
        min: [1, 'O valor do caminho `{PATH}` (`{VALUE}`) é menor que o comprimento mínimo permitido ({MINLENGTH}).'],
        max: [31, 'O valor do caminho `{PATH}` (`{VALUE}`) excedeu o comprimento máximo permitido ({MAXLENGTH}).'],
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    }
});

export const fileSchema: Schema = new Schema({
    name: {
        type: String,
        trim: true
    },
    path: {
        type: String,
        trim: true
    }
});

export const vcardSchema: Schema = new Schema({
    firstname: {
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    lastname: {
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    organization: {
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    photo: {
        type: photoSchema,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    logo: {
        type: photoSchema,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    workPhone: {
        type: [String],
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    birthday: {
        type: birthdaySchema,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    title: {
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    url: {
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    workUrl: {
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    email: {
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    label: {
        type: String,
        trim: true,
        default: 'Work Address',
        enum: [
            'Work Address',
            'Home Address'
        ],
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    street: {
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    city: {
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    stateProvince: {
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    postalCode: {
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    countryRegion: {
        type: String,
        trim: true,
        default: 'Brazil',
        enum: [
            'Brazil'
        ],
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    socialUrls: {
        type: Array,
        default: [],
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    file: {
        type: fileSchema,
        required: false
    }
});

export const socialmediaSchema: Schema = new Schema({
    name: {
        type: String,
        trim: true,
        enum: [
            'Facebook',
            'Youtube',
            'Linkedin',
            'Instagram',
            'Twitter'
        ],
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    value: {
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    enabled: {
        type: Boolean,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    }
});

export const footerSchema: Schema = new Schema({
    email: {
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    location: {
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    website: {
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    attachment: {
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    socialmedia: {
        type: [socialmediaSchema],
        required: false
    }
});

export const cardsSchema: Schema = new Schema({
    cid: { // Identificador customizado
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório']
    },
    version: { // Versão do layout visual do cartão
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório']
    },
    photo: { // Photo utilizada no cartão
        type: photoSchema,
        required: [true, '{PATH} este campo é obrigatório']
    },
    name: { // Nome a ser exibido
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório']
    },
    jobtitle: { // Cargo de trabalho, Titulo ou Pronome a ser exibido a baixo do nome
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório']
    },
    phones: { // Telefone Fixo e Celular
        type: [String],
        required: [true, '{PATH} este campo é obrigatório']
    },
    whatsapp: { // Whatsapp
        type: whatsappSchema,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    vcard: { // Arquivo de importação do contato
        type: vcardSchema,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    footer: { // Rodapé do cartão
        type: footerSchema,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']

    },
    createdAt: { // Data de registro
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório']
    }
});

cardsSchema.virtual("phone1").get(function (this: cardsModelInterface) {
    return this.phones[0];
});

cardsSchema.virtual("phone2").get(function (this: cardsModelInterface) {
    return this.phones[1];
});

export default model<cardsModelInterface>("cards", cardsSchema);