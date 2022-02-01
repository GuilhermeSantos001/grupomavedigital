/**
 * @description Schema dos usuários
 * @author GuilhermeSantos001
 * @update 31/01/2022
 */

import { Document, Schema, model } from "mongoose";

import generatePassword from '@/utils/generatePassword';

import { JsonWebToken } from '@/lib/JsonWebToken';

import Privilege from '@/utils/privilege';

/**
 * Types
 */

// ! Tipos de unidade permitidas para o tempo de expiração da sessão
export type Unit = 's' | 'm' | 'h' | 'd'; // Segundo, Minuto, Hora e Dia

// ! Tipos de dispositivos que podem ser conectados ao sistema
export type Devices = 'desktop' | 'phone' | 'tablet' | 'tv';

// ! Privilegios do sistema
export type PrivilegesSystem =
    // Sistema
    | 'common'
    | 'administrador'
    | 'moderador'
    | 'supervisor'
    | 'diretoria'
    // Financeiro
    | 'fin_faturamento'
    | 'fin_assistente'
    | 'fin_gerente'
    // RH/DP
    | 'rh_beneficios'
    | 'rh_encarregado'
    | 'rh_juridico'
    | 'rh_recrutamento'
    | 'rh_sesmet'
    // Suprimentos
    | 'sup_compras'
    | 'sup_estoque'
    | 'sup_assistente'
    | 'sup_gerente'
    // Comercial
    | 'com_vendas'
    | 'com_adm'
    | 'com_gerente'
    | 'com_qualidade'
    // Operacional
    | 'ope_mesa'
    | 'ope_coordenador'
    | 'ope_supervisor'
    | 'ope_gerente'
    // Marketing
    | 'mkt_geral'
    // Juridico
    | 'jur_advogado'
    // Contabilidade
    | 'cont_contabil'
    ;

export interface Email {
    value: string;
    status: boolean;
}

export interface Location {
    street: string;
    number: number;
    complement: string;
    district: string;
    state: string;
    city: string;
    zipcode: string;
}

export interface Twofactor {
    secret: string;
    enabled: boolean;
}

export interface Authentication {
    twofactor: Twofactor;
    forgotPassword: string;
}

export interface Token {
    signature: string;
    value: string;
    expiry: string;
    status: boolean;
}

export interface RefreshToken {
    signature: string;
    value: string;
    expiry: Date;
}

export interface History {
    token: string;
    device: Devices;
    tmp: string;
    internetAdress: string;
}

export interface Cache {
    tmp: number;
    unit: Unit;
    tokens: Token[];
    refreshToken: RefreshToken[];
    history: History[];
}

export interface Device {
    allowed: Devices[];
    connected: Devices[];
}

export interface Session {
    connected: number;
    limit: number;
    alerts: string[];
    cache: Cache;
    device: Device;
}

/**
 * @description Interface do usuário
 */
export interface UserInterface {
    authorization: string;
    privileges: PrivilegesSystem[];
    photoProfile: string;
    username: string;
    password: string;
    name: string;
    surname: string;
    email: Email;
    cnpj: string;
    location: Location;
    authentication?: Authentication;
    session?: Session;
    status?: boolean;
}

export interface UserModelInterface extends UserInterface, Document {
    clearEmail: string;
    isEnabled: boolean;
    signature: string;
    token: string;
    privilege: string
    refreshToken: string;
}

export const authenticationDefault: Authentication = {
    twofactor: {
        secret: '',
        enabled: false
    },
    forgotPassword: ""
};

export const sessionDefault: Session = {
    connected: 0,
    limit: 4,
    alerts: [
        "::ffff:127.0.0.1",
        '127.0.0.1',
        'localhost'
    ],
    cache: {
        tmp: 15,
        unit: "m",
        tokens: [],
        refreshToken: [],
        history: []
    },
    device: {
        allowed: [
            "desktop",
            "phone",
            "tablet",
            "tv"
        ],
        connected: []
    }
};

export const emailSchema: Schema = new Schema({
    value: { // Endereço de e-mail único do usuário
        type: String,
        lowercase: true,
        trim: true,
        unique: true,
        match: /^([\w-.]+@([\w-]+.)+[\w-]{2,4})?$/
    },
    status: { // Se o e-mail está confirmado
        type: Boolean,
        default: false
    }
});

export const locationSchema: Schema = new Schema({
    street: { // Rua
        type: String,
        trim: true
    },
    number: { // Numero
        type: Number,
        min: [1, 'O valor do caminho `{PATH}` (`{VALUE}`) é menor que o comprimento mínimo permitido ({MINLENGTH}).']
    },
    complement: { // Complemento
        type: String,
        trim: true
    },
    district: { // Bairro
        type: String,
        trim: true
    },
    state: { // Estado
        type: String,
        trim: true
    },
    city: { // Cidade
        type: String,
        trim: true
    },
    zipcode: { // CEP
        type: String,
        trim: true
    }
});

export const sessionSchema: Schema = new Schema({
    connected: {
        type: Number,
        min: 0,
        max: 4,
        default: 0
    },
    limit: {
        type: Number,
        min: 1,
        max: 4,
        default: 4
    },
    alerts: {
        type: [String],
        default: ["::ffff:127.0.0.1", "127.0.0.1", "localhost"]
    },
    cache: {
        type: Object,
        default: {
            tmp: 15,
            unit: "m",
            tokens: [],
            refreshToken: [],
            history: []
        }
    },
    device: {
        type: Object,
        default: {
            allowed: [
                "desktop",
                "phone",
                "tablet",
                "tv"
            ],
            connected: []
        }
    }
});

export const twofactorSchema: Schema = new Schema({
    secret: {
        type: String,
        trim: true,
        default: ''
    },
    enabled: {
        type: Boolean,
        default: false
    }
});

export const authenticationSchema: Schema = new Schema({
    twofactor: {
        type: twofactorSchema,
        default: {
            secret: '',
            enabled: false
        }
    },
    forgotPassword: {
        type: String,
        trim: true,
        default: ""
    }
});

export const userSchema: Schema = new Schema({
    authorization: { // Autorização única do usuário
        type: String,
        trim: true,
        unique: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    privileges: { // Tipo de acesso (administrador, supervisor, moderador, comum e etc)
        type: [String],
        default: ['common'],
        enum: {
            values: [
                // Sistema
                'common',
                'administrador',
                'moderador',
                'supervisor',
                'diretoria',
                // Financeiro
                'fin_faturamento',
                'fin_assistente',
                'fin_gerente',
                // RH/DP
                'rh_beneficios',
                'rh_encarregado',
                'rh_juridico',
                'rh_recrutamento',
                'rh_sesmet',
                // Suprimentos
                'sup_compras',
                'sup_estoque',
                'sup_assistente',
                'sup_gerente',
                // Comercial
                'com_vendas',
                'com_adm',
                'com_gerente',
                'com_qualidade',
                // Operacional
                'ope_mesa',
                'ope_coordenador',
                'ope_supervisor',
                'ope_gerente',
                // Marketing
                'mkt_geral',
                // Juridico
                'jur_advogado',
                // Contabilidade
                'cont_contabil'
            ],
            message: '{VALUE} este valor não é suportado'
        },
        required: [true, '{PATH} este campo é obrigatório']
    },
    photoProfile: { // Foto de Perfil
        type: String,
        trim: true,
        default: 'avatar.png'
    },
    username: { // Nome de usuário
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança'],
        maxlength: [33, 'O valor do caminho `{PATH}` (`{VALUE}`) excedeu o comprimento máximo permitido ({MAXLENGTH}).'],
        minlength: [4, 'O valor do caminho `{PATH}` (`{VALUE}`) é menor que o comprimento mínimo permitido ({MINLENGTH}).']
    },
    password: { // Senha de usuário
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança'],
        minlength: [6, 'O valor do caminho `{PATH}` (`{VALUE}`) é menor que o comprimento mínimo permitido ({MINLENGTH}).'],
        maxlength: [256, 'O valor do caminho `{PATH}` (`{VALUE}`) excedeu o comprimento máximo permitido ({MAXLENGTH}).']
    },
    name: { // Nome
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança'],
        maxlength: [33, 'O valor do caminho `{PATH}` (`{VALUE}`) excedeu o comprimento máximo permitido ({MAXLENGTH}).'],
        minlength: [4, 'O valor do caminho `{PATH}` (`{VALUE}`) é menor que o comprimento mínimo permitido ({MINLENGTH}).']
    },
    surname: { // Sobrenome
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança'],
        maxlength: [33, 'O valor do caminho `{PATH}` (`{VALUE}`) excedeu o comprimento máximo permitido ({MAXLENGTH}).'],
        minlength: [4, 'O valor do caminho `{PATH}` (`{VALUE}`) é menor que o comprimento mínimo permitido ({MINLENGTH}).']
    },
    email: { // Email
        type: emailSchema,
        default: {},
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    cnpj: { // CNPJ
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    location: { // Endereço
        type: locationSchema,
        default: {},
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    session: {
        type: sessionSchema,
        default: sessionDefault
    },
    authentication: {
        type: authenticationSchema,
        default: authenticationDefault
    },
    status: {
        type: Boolean,
        default: true
    },
    createdAt: { // Data de registro
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório']
    }
});

userSchema.virtual("clearEmail").get(function (this: UserModelInterface) {
    return this.email.value;
});

userSchema.virtual("isEnabled").get(function (this: UserModelInterface) {
    return this.status === true;
});

userSchema.virtual("signature").get(function (this: UserModelInterface) {
    return generatePassword.unique();
});

userSchema.virtual("token").get(async function (this: UserModelInterface) {
    if (!this.session)
        this.session = sessionDefault;

    return await JsonWebToken.sign({
        payload: {
            auth: this.authorization
        },
        options: {
            expiresIn: `${this.session.cache.tmp}${this.session.cache.unit}`
        }
    });
});

userSchema.virtual("refreshToken").get(function (this: UserModelInterface) {
    return generatePassword.unique();
});

userSchema.virtual("privilege").get(function (this: UserModelInterface) {
    if (this.privileges instanceof Array === false)
        this.privileges = [];

    return Privilege.alias(this.privileges[this.privileges.length - 1]);
});

export const UsersSchema = model<UserModelInterface>("users", userSchema);