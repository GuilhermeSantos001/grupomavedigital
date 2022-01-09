/**
 * @description Schema das Pastas
 * @author GuilhermeSantos001
 * @update 25/11/2021
 */

import { Model, Schema, model } from "mongoose";

import { PrivilegesSystem } from "@/mongo/user-manager-mongo";
import Users from "@/db/user-db";

import { FileShare, FileProtected, FileBlocked, matches, protectSchema, blockedSchema, shareSchema, Assignee, Order, OrderAnswer, OrderType, assigneesSchema, orderSchema } from '@/mongo/files-manager-mongo';

export type FolderStatus = 'Available' | 'Protected' | 'Blocked' | 'Appending' | 'Removing' | 'Trash' | 'Recycle';

export type FolderPermission = 'Append' | 'Delete' | 'Protect' | 'Share' | 'Security' | 'Block';

export interface GroupId {
    name: PrivilegesSystem;
    permissions: FolderPermission[];
}

export interface UserId {
    email: string;
    permissions: FolderPermission[];
}

export interface folderInterface {
    cid?: string;
    room: string[];
    authorId: string;
    accessGroupId?: GroupId[];
    accessUsersId?: UserId[];
    name: string;
    description: string;
    status: FolderStatus;
    type: string;
    tag: string;
    permission: FolderPermission[];
    filesId?: string[];
    foldersId?: string[];
    folderId?: string;
    share?: FileShare;
    protect?: FileProtected;
    block?: FileBlocked;
    trash?: Date;
    recycle?: boolean;
    assignees?: Assignee[];
    order?: Order;
    updated?: string;
    lastAccess?: string;
    createdAt?: string;
}

export interface folderModelInterface extends folderInterface, Model<folderInterface> {
    available: boolean;
    protected: boolean;
    blocked: boolean;
    appending: boolean;
    removing: boolean;
    shared: boolean;
    garbage: boolean;
    isAssociatedGroup: boolean;
    isAssociatedUser: boolean;
    isAssociatedFolder: boolean;
    allowsAppending: boolean;
    allowsDelete: boolean;
    allowsProtect: boolean;
    allowsShare: boolean;
    allowsSecurity: boolean;
    allowsBlock: boolean;
    checkGroupAccess: (group: Pick<GroupId, "name">, permission: FolderPermission) => boolean;
    checkUserAccess: (user: Pick<UserId, "email">, permission: FolderPermission) => boolean;
    inRoom: (room: string[]) => boolean;
    getAuthorUsername: () => Promise<string>;
    getAuthorEmail: () => Promise<string>;
    orderTimelapseExpired: () => boolean;
    orderTypeIs: (type: OrderType) => boolean;
    orderAllAssigneesApproved: () => boolean;
    orderAnswerIndex: (answer: OrderAnswer) => number;
}

export const groupIdSchema: Schema = new Schema({
    name: {
        type: String,
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
    permissions: {
        type: [String],
        enum: {
            values: [
                'Append',
                'Delete',
                'Protect',
                'Share',
                'Security',
                'Block'
            ],
            message: '{VALUE} este valor não é suportado'
        },
        required: [true, '{PATH} este campo é obrigatório']
    }
});

export const userIdSchema: Schema = new Schema({
    email: {
        type: String,
        lowercase: true,
        trim: true,
        match: matches.mail
    },
    permissions: {
        type: [String],
        enum: {
            values: [
                'Append',
                'Delete',
                'Protect',
                'Share',
                'Security',
                'Block'
            ],
            message: '{VALUE} este valor não é suportado'
        },
        required: [true, '{PATH} este campo é obrigatório']
    }
});

export const folderSchema = new Schema<folderModelInterface, Model<folderModelInterface>, folderInterface>({
    cid: {
        type: String,
        unique: true,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório']
    },
    room: {
        type: [String],
        default: ['*'],
        required: [true, '{PATH} este campo é obrigatório']
    },
    authorId: {
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório']
    },
    accessGroupId: { // Nomes dos Grupos que tem acesso
        type: [groupIdSchema],
        default: [
            {
                name: 'administrador',
                permissions: [
                    'Append',
                    'Delete',
                    'Protect',
                    'Share',
                    'Security',
                    'Block'
                ]
            },
            {
                name: 'supervisor',
                permissions: [
                    'Append',
                    'Delete',
                    'Protect',
                    'Share',
                    'Security',
                    'Block'
                ]
            },
            {
                name: 'moderador',
                permissions: [
                    'Append',
                    'Delete',
                    'Protect',
                    'Share',
                    'Security',
                    'Block'
                ]
            }
        ],
        required: [true, '{PATH} este campo é obrigatório']
    },
    accessUsersId: { // Emails dos usuários que tem acesso
        type: [userIdSchema],
        default: [],
        required: [true, '{PATH} este campo é obrigatório']
    },
    name: {
        type: String,
        trim: true,
        validate: {
            validator: function (value: string) {
                const filter = value.match(matches.specialCharacters)?.filter((result: string) => result.toLowerCase().trim() !== '') || [];
                return filter.length <= 0;
            },
            message: (props: { value: string }) => `${props.value} contém caracteres especiais e não é permitido.`
        },
        maxlength: [256, 'O valor do caminho `{PATH}` (`{VALUE}`) excedeu o comprimento máximo permitido ({MAXLENGTH}).'],
        minlength: [5, 'O valor do caminho `{PATH}` (`{VALUE}`) é menor que o comprimento mínimo permitido ({MINLENGTH}).'],
        required: [true, '{PATH} este campo é obrigatório']
    },
    description: {
        type: String,
        trim: true,
        validate: {
            validator: function (value: string) {
                const filter = value.match(matches.specialCharacters)?.filter((result: string) => result.toLowerCase().trim() !== '') || [];
                return filter.length <= 0;
            },
            message: (props: { value: string }) => `${props.value} contém caracteres especiais e não é permitido.`
        },
        maxlength: [256, 'O valor do caminho `{PATH}` (`{VALUE}`) excedeu o comprimento máximo permitido ({MAXLENGTH}).'],
        required: [false, '{PATH} este campo é obrigatório']
    },
    type: {
        type: String,
        trim: true,
        validate: {
            validator: function (value: string) {
                const filter = value.match(matches.specialCharacters)?.filter((result: string) => result.toLowerCase().trim() !== '') || [];
                return filter.length <= 0;
            },
            message: (props: { value: string }) => `${props.value} contém caracteres especiais e não é permitido.`
        },
        maxlength: [256, 'O valor do caminho `{PATH}` (`{VALUE}`) excedeu o comprimento máximo permitido ({MAXLENGTH}).'],
        required: [false, '{PATH} este campo é obrigatório']
    },
    tag: {
        type: String,
        trim: true,
        validate: {
            validator: function (value: string) {
                const filter = value.match(matches.specialCharacters)?.filter((result: string) => result.toLowerCase().trim() !== '') || [];
                return filter.length <= 0;
            },
            message: (props: { value: string }) => `${props.value} contém caracteres especiais e não é permitido.`
        },
        maxlength: [256, 'O valor do caminho `{PATH}` (`{VALUE}`) excedeu o comprimento máximo permitido ({MAXLENGTH}).'],
        required: [false, '{PATH} este campo é obrigatório']
    },
    status: {
        type: String,
        trim: true,
        enum: {
            values: [
                'Available',
                'Protected',
                'Blocked',
                'Appending',
                'Removing',
                'Trash',
                'Recycle'
            ],
            message: '{VALUE} este valor não é suportado'
        },
        required: [true, '{PATH} este campo é obrigatório']
    },
    permission: {
        type: [String],
        default: [],
        enum: {
            values: [
                'Append',
                'Delete',
                'Protect',
                'Share',
                'Security',
                'Block'
            ],
            message: '{VALUE} este valor não é suportado'
        },
        required: [true, '{PATH} este campo é obrigatório']
    },
    filesId: { // ID's dos arquivos
        type: [String],
        default: [],
        required: [false, '{PATH} este campo é obrigatório']
    },
    foldersId: { // ID's das pastas
        type: [String],
        default: [],
        required: [false, '{PATH} este campo é obrigatório']
    },
    folderId: { // Identificador da pasta associada
        type: String,
        required: [false, '{PATH} este campo não é obrigatório']
    },
    share: {
        type: shareSchema,
        required: [false, '{PATH} este campo não é obrigatório']
    },
    protect: {
        type: protectSchema,
        required: [false, '{PATH} este campo não é obrigatório']
    },
    block: {
        type: blockedSchema,
        required: [false, '{PATH} este campo não é obrigatório']
    },
    trash: {
        type: Date,
        required: [false, '{PATH} este campo não é obrigatório']
    },
    recycle: {
        type: Boolean,
        required: [false, '{PATH} este campo não é obrigatório']
    },
    assignees: {
        type: [assigneesSchema],
        default: [],
        required: [false, '{PATH} este campo é obrigatório']
    },
    order: {
        type: orderSchema,
        required: [false, '{PATH} este campo é obrigatório']
    },
    updated: { // Data da última atualização (Updating/Protected/Blocked)
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório']
    },
    lastAccess: { // Data do ultimo acesso (Writing/Reading/Removing)
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

folderSchema.virtual("available").get(function (this: folderModelInterface) {
    return this.status === 'Available' ? true : false;
});

folderSchema.virtual("protected").get(function (this: folderModelInterface) {
    return this.protect !== undefined || this.status === 'Protected' ? true : false;
});

folderSchema.virtual("blocked").get(function (this: folderModelInterface) {
    return this.block !== undefined || this.status === 'Blocked' ? true : false;
});

folderSchema.virtual("appending").get(function (this: folderModelInterface) {
    return this.status === 'Appending' ? true : false;
});

folderSchema.virtual("removing").get(function (this: folderModelInterface) {
    return this.status === 'Removing' ? true : false;
});

folderSchema.virtual("shared").get(function (this: folderModelInterface) {
    return this.share !== undefined;
});

folderSchema.virtual("garbage").get(function (this: folderModelInterface) {
    return this.trash !== undefined;
});

folderSchema.virtual("isAssociatedGroup").get(function (this: folderModelInterface) {
    if (!this.accessGroupId)
        return false;

    return this.accessGroupId.length > 0;
});

folderSchema.virtual("isAssociatedUser").get(function (this: folderModelInterface) {
    if (!this.accessUsersId)
        return false;

    return this.accessUsersId.length > 0;
});

folderSchema.virtual("isAssociatedFolder").get(function (this: folderModelInterface) {
    return this.folderId !== undefined;
});

folderSchema.virtual("allowsAppending").get(function (this: folderModelInterface) {
    return this.permission.filter(permission => permission === 'Append').length > 0;
});

folderSchema.virtual("allowsDelete").get(function (this: folderModelInterface) {
    return this.permission.filter(permission => permission === 'Delete').length > 0;
});

folderSchema.virtual("allowsProtect").get(function (this: folderModelInterface) {
    return this.permission.filter(permission => permission === 'Protect').length > 0;
});

folderSchema.virtual("allowsShare").get(function (this: folderModelInterface) {
    return this.permission.filter(permission => permission === 'Share').length > 0;
});

folderSchema.virtual("allowsSecurity").get(function (this: folderModelInterface) {
    return this.permission.filter(permission => permission === 'Security').length > 0;
});

folderSchema.virtual("allowsBlock").get(function (this: folderModelInterface) {
    return this.permission.filter(permission => permission === 'Block').length > 0;
});

/**
 * @description Retorna se o grupo tem permissão para acessar a pasta
 */
folderSchema.method('checkGroupAccess', function (this: folderModelInterface, group: Pick<GroupId, "name">, permission: FolderPermission): boolean {
    if (this.accessGroupId) {
        return this.accessGroupId.filter(access => access.name === group.name && access.permissions.find(item => item === permission)).length > 0;
    }

    return false;
});

/**
 * @description Retorna se o usuario tem permissão para acessar a pasta
 */
folderSchema.method('checkUserAccess', function (this: folderModelInterface, user: Pick<UserId, "email">, permission: FolderPermission): boolean {
    if (this.accessUsersId) {
        return this.accessUsersId.filter(access => access.email === user.email && access.permissions.find(item => item === permission)).length > 0;
    }

    return false;
});

/**
 * @description Verifica se a pasta está disponível no quarto informado
 */
folderSchema.method('inRoom', function (this: folderModelInterface, room: string[]): boolean {
    if (!this.room)
        this.room = [];

    if (this.room.includes('*'))
        return true;

    return this.room.filter(item => room.includes(item)).length > 0;
});

/**
 * @description Retorna o nome de usuário do autor do arquivo
 */
folderSchema.method('getAuthorUsername', async function (this: folderModelInterface): Promise<string> {
    const { username } = await Users.getInfo(this.authorId);

    return username;
});

/**
 * @description Retorna o email do autor do arquivo
 */
folderSchema.method('getAuthorEmail', async function (this: folderModelInterface): Promise<string> {
    const { email } = await Users.getInfo(this.authorId);

    return email;
});

/**
 * @description Verifica se o tempo para responder o pedido expirou
 */
folderSchema.method('orderTimelapseExpired', function (this: folderModelInterface) {
    if (this.order && this.order.timelapse) {
        const now = new Date();

        return now >= this.order.timelapse;
    }

    return false;
});

/**
 * @description Verifica se o tipo do pedido é igual a X
 */
folderSchema.method('orderTypeIs', function (this: folderModelInterface, type: OrderType) {
    if (this.order) {
        return type === this.order.type;
    }

    return false;
});

/**
 * @description Verifica se todos os procuradores aprovaram o pedido
 */
folderSchema.method('orderAllAssigneesApproved', function (this: folderModelInterface) {
    if (this.assignees && this.order && this.order.answers) {
        const approved = this.order.answers.filter((answer: OrderAnswer) => answer.decision === 'Approved');

        return approved.length >= this.assignees.length;
    }

    return false;
});

/**
 * @description Retorna o index da resposta do procurador
 */
folderSchema.method('orderAnswerIndex', function (this: folderModelInterface, answer: OrderAnswer) {
    if (this.order && this.order.answers)
        return this.order.answers.findIndex((item) => item.assignee.email === answer.assignee.email);

    return -1;
});

export default model<folderModelInterface>("folders", folderSchema);