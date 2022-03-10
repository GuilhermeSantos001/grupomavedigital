/**
 * @description Schema dos Arquivos
 * @author GuilhermeSantos001
 * @update 31/01/2022
 */

import { Model, Schema, model } from "mongoose";
import { ObjectId } from 'bson';

import { PrivilegesSystem } from "@/schemas/UsersSchema";
import { UsersManagerDB } from "@/database/UsersManagerDB";

export type FileStatus = 'Available' | 'Protected' | 'Blocked' | 'Writing' | 'Reading' | 'Removing' | 'Updating' | 'Trash' | 'Recycle';

export type FilePermission = 'Write' | 'Read' | 'Delete' | 'Protect' | 'Share' | 'Security' | 'Block';

export type FileBlock = 'Date'
    | 'Hour'
    | 'Minute'
    | 'Month'
    | 'Day Month'
    | 'Day Week'
    ;

export type OrderType = 'Garbage';

export type OrderAnswerDecision = 'Approved' | 'Rejected';

export interface Matches {
    specialCharacters: RegExp;
    mail: RegExp;
}

export interface FileShare {
    title: string;
    link: string;
    secret: string;
}

export interface FileProtected {
    key: string;
    passphrase: string;
}

export interface FileBlocked {
    type: FileBlock;
    value: Date;
    repeat: boolean;
}

export interface HistoryFile {
    authorId: string;
    uploadDate: Date;
    size: number;
    compressedSize: number;
    fileId: ObjectId;
    version: number;
}

export interface GroupId {
    name: PrivilegesSystem;
    permissions: FilePermission[];
}

export interface UserId {
    email: string;
    permissions: FilePermission[];
}

export interface Assignee {
    name: string;
    email: string;
}

export interface Order {
    assignee: Assignee;
    title: string;
    description: string;
    fileId?: string;
    type?: OrderType;
    answers?: OrderAnswer[];
    timelapse?: Date;
    link?: string;
}

export interface OrderAnswer {
    assignee: Assignee;
    decision: OrderAnswerDecision;
}

export interface fileInterface {
    cid?: string;
    room?: string[];
    authorId: string;
    accessGroupId?: GroupId[];
    accessUsersId?: UserId[];
    name: string;
    description: string;
    version?: number;
    history?: HistoryFile[];
    size: number;
    compressedSize: number;
    type: string;
    tag: string;
    status: FileStatus;
    permission: FilePermission[];
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

export interface fileModelInterface extends fileInterface, Model<fileInterface> {
    available: boolean;
    protected: boolean;
    blocked: boolean;
    writing: boolean;
    reading: boolean;
    removing: boolean;
    updating: boolean;
    shared: boolean;
    garbage: boolean;
    isAssociatedFolder: boolean;
    isAssociatedGroup: boolean;
    isAssociatedUser: boolean;
    allowsWrite: boolean;
    allowsRead: boolean;
    allowsDelete: boolean;
    allowsProtect: boolean;
    allowsShare: boolean;
    allowsSecurity: boolean;
    allowsBlock: boolean;
    getActualFileId: ObjectId;
    getHistoryFilesId: ObjectId[];
    checkGroupAccess: (group: Pick<GroupId, "name">, permission: FilePermission) => boolean;
    checkUserAccess: (user: Pick<UserId, "email">, permission: FilePermission) => boolean;
    orderTimelapseExpired: () => boolean;
    orderTypeIs: (type: OrderType) => boolean;
    orderAllAssigneesApproved: () => boolean;
    orderAnswerIndex: (answer: OrderAnswer) => number;
    sizeAdd: (size: number, compressedSize: number) => void;
    sizeSubtract: (size: number, compressedSize: number) => void;
    inRoom: (room: string[]) => boolean;
    getAuthorUsername: () => Promise<string>;
    getAuthorEmail: () => Promise<string>;
}

export const matches: Matches = {
    // eslint-disable-next-line no-useless-escape
    specialCharacters: /[\!\@\#\$\%\¨\`\´\&\*\(\)\-\_\+\=\§\}\º\{\}\[\]\'\"\/\.\,\;\<\>\^\~\?\|\\]/g,
    mail: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/g
};

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
                'Write',
                'Read',
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
                'Write',
                'Read',
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

export const shareSchema: Schema = new Schema({
    title: {
        type: String,
        trim: true,
        maxlength: [256, 'O valor do caminho `{PATH}` (`{VALUE}`) excedeu o comprimento máximo permitido ({MAXLENGTH}).'],
        minlength: [5, 'O valor do caminho `{PATH}` (`{VALUE}`) é menor que o comprimento mínimo permitido ({MINLENGTH}).'],
        required: [true, '{PATH} este campo é obrigatório']
    },
    link: {
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório']
    },
    secret: {
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório']
    }
});

export const protectSchema: Schema = new Schema({
    key: {
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório']
    },
    passphrase: {
        type: String,
        trim: true,
        maxlength: [256, 'O valor do caminho `{PATH}` (`{VALUE}`) excedeu o comprimento máximo permitido ({MAXLENGTH}).'],
        minlength: [5, 'O valor do caminho `{PATH}` (`{VALUE}`) é menor que o comprimento mínimo permitido ({MINLENGTH}).'],
        required: [true, '{PATH} este campo é obrigatório']
    }
});

export const blockedSchema: Schema = new Schema({
    type: {
        type: String,
        trim: true,
        enum: {
            values: [
                'Date',
                'Hour',
                'Minute',
                'Month',
                'Day Month',
                'Day Week'
            ],
            message: '{VALUE} este valor não é suportado'
        },
        required: [true, '{PATH} este campo é obrigatório']
    },
    value: {
        type: Date,
        required: [true, '{PATH} este campo é obrigatório']
    },
    repeat: {
        type: Boolean,
        default: false,
        required: [true, '{PATH} este campo é obrigatório']
    }
});

export const historySchema: Schema = new Schema({
    authorId: {
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório']
    },
    uploadDate: {
        type: Date,
        required: [true, '{PATH} este campo é obrigatório']
    },
    size: {
        type: Number,
        min: 0,
        default: 0,
        required: [true, '{PATH} este campo é obrigatório']
    },
    compressedSize: {
        type: Number,
        min: 0,
        default: 0,
        required: [true, '{PATH} este campo é obrigatório']
    },
    fileId: {
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório']
    },
    version: {
        type: Number,
        min: 1,
        required: [true, '{PATH} este campo é obrigatório']
    }
});

export const assigneesSchema: Schema = new Schema({
    name: {
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório']
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
        match: matches.mail
    }
});

export const answersSchema: Schema = new Schema({
    assignee: {
        type: assigneesSchema,
        required: [true, '{PATH} este campo é obrigatório']
    },
    decision: {
        type: String,
        trim: true,
        enum: {
            values: [
                'Approved',
                'Rejected'
            ],
            message: '{VALUE} este valor não é suportado'
        },
        required: [true, '{PATH} este campo é obrigatório']
    }
});

export const orderSchema: Schema = new Schema({
    assignee: {
        type: assigneesSchema,
        required: [true, '{PATH} este campo é obrigatório']
    },
    title: {
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório']
    },
    description: {
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório']
    },
    fileId: {
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório']
    },
    type: {
        type: String,
        trim: true,
        enum: {
            values: [
                'Garbage',
            ],
            message: '{VALUE} este valor não é suportado'
        },
        required: [true, '{PATH} este campo é obrigatório']
    },
    answers: {
        type: [answersSchema],
        required: [false, '{PATH} este campo é obrigatório']
    },
    timelapse: {
        type: Date,
        required: [false, '{PATH} este campo não é obrigatório']
    },
    link: {
        type: String,
        trim: true,
        maxlength: [12, 'O valor do caminho `{PATH}` (`{VALUE}`) excedeu o comprimento máximo permitido ({MAXLENGTH}).'],
        minlength: [12, 'O valor do caminho `{PATH}` (`{VALUE}`) é menor que o comprimento mínimo permitido ({MINLENGTH}).'],
        required: [true, '{PATH} este campo é obrigatório']
    }
});

export const fileSchema = new Schema<fileModelInterface, Model<fileModelInterface>, fileInterface>({
    cid: {
        type: String,
        unique: true,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório']
    },
    room: {
        type: [String],
        default: ['*'],
        required: [false, '{PATH} este campo é obrigatório']
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
                    'Write',
                    'Read',
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
                    'Write',
                    'Read',
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
                    'Write',
                    'Read',
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
    version: {
        type: Number,
        min: 0,
        default: 0,
        required: [true, '{PATH} este campo é obrigatório']
    },
    history: {
        type: [historySchema],
        default: [],
        required: [true, '{PATH} este campo é obrigatório']
    },
    size: {
        type: Number,
        min: 0,
        default: 0,
        required: [true, '{PATH} este campo é obrigatório']
    },
    compressedSize: {
        type: Number,
        min: 0,
        default: 0,
        required: [true, '{PATH} este campo é obrigatório']
    },
    type: {
        type: String,
        trim: true,
        validate: {
            validator: function (value: string) {
                value = value.substring(value.lastIndexOf('.'));

                if (value.length <= 0)
                    return false;

                return true;
            },
            message: (props: { value: string }) => `${props.value} não é uma extensão de arquivo valida.`
        },
        maxlength: [256, 'O valor do caminho `{PATH}` (`{VALUE}`) excedeu o comprimento máximo permitido ({MAXLENGTH}).'],
        required: [true, '{PATH} este campo é obrigatório']
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
                'Writing',
                'Reading',
                'Removing',
                'Updating',
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
                'Write',
                'Read',
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

fileSchema.virtual("available").get(function (this: fileModelInterface): boolean {
    return this.status === 'Available' ? true : false;
});

fileSchema.virtual("protected").get(function (this: fileModelInterface): boolean {
    return this.protect !== undefined || this.status === 'Protected' ? true : false;
});

fileSchema.virtual("blocked").get(function (this: fileModelInterface): boolean {
    return this.block !== undefined || this.status === 'Blocked' ? true : false;
});

fileSchema.virtual("writing").get(function (this: fileModelInterface): boolean {
    return this.status === 'Writing' ? true : false;
});

fileSchema.virtual("reading").get(function (this: fileModelInterface): boolean {
    return this.status === 'Reading' ? true : false;
});

fileSchema.virtual("removing").get(function (this: fileModelInterface): boolean {
    return this.status === 'Removing' ? true : false;
});

fileSchema.virtual("updating").get(function (this: fileModelInterface): boolean {
    return this.status === 'Updating' ? true : false;
});

fileSchema.virtual("shared").get(function (this: fileModelInterface): boolean {
    return this.share !== undefined;
});

fileSchema.virtual("garbage").get(function (this: fileModelInterface): boolean {
    return this.trash !== undefined;
});

fileSchema.virtual("isAssociatedFolder").get(function (this: fileModelInterface): boolean {
    return this.folderId !== undefined;
});

fileSchema.virtual("isAssociatedGroup").get(function (this: fileModelInterface): boolean {
    if (!this.accessGroupId)
        return false;

    return this.accessGroupId.length > 0;
});

fileSchema.virtual("isAssociatedUser").get(function (this: fileModelInterface): boolean {
    if (!this.accessUsersId)
        return false;

    return this.accessUsersId.length > 0;
});

fileSchema.virtual("allowsWrite").get(function (this: fileModelInterface): boolean {
    return this.permission.filter(permission => permission === 'Write').length > 0;
});

fileSchema.virtual("allowsRead").get(function (this: fileModelInterface): boolean {
    return this.permission.filter(permission => permission === 'Read').length > 0;
});

fileSchema.virtual("allowsDelete").get(function (this: fileModelInterface): boolean {
    return this.permission.filter(permission => permission === 'Delete').length > 0;
});

fileSchema.virtual("allowsProtect").get(function (this: fileModelInterface): boolean {
    return this.permission.filter(permission => permission === 'Protect').length > 0;
});

fileSchema.virtual("allowsShare").get(function (this: fileModelInterface): boolean {
    return this.permission.filter(permission => permission === 'Share').length > 0;
});

fileSchema.virtual("allowsSecurity").get(function (this: fileModelInterface): boolean {
    return this.permission.filter(permission => permission === 'Security').length > 0;
});

fileSchema.virtual("allowsBlock").get(function (this: fileModelInterface): boolean {
    return this.permission.filter(permission => permission === 'Block').length > 0;
});

fileSchema.virtual("getActualFileId").get(function (this: fileModelInterface): string | ObjectId {
    if (!this.history)
        this.history = [];

    const fileId = this.history.filter(history => history.version === this.version);

    if (fileId.length > 0)
        return fileId[0].fileId;

    return `File with version(${this.version}) has not ID.`;
});

fileSchema.virtual("getHistoryFilesId").get(function (this: fileModelInterface): string | ObjectId[] {
    if (!this.history)
        this.history = [];

    const fileId = this.history.map(history => history.fileId);

    if (fileId.length > 0)
        return fileId;

    return `File without versions.`;
});

/**
 * @description Verifica se o tempo para responder o pedido expirou
 */
fileSchema.method('orderTimelapseExpired', function (this: fileModelInterface): boolean {
    if (this.order && this.order.timelapse) {
        const now = new Date();

        return now >= this.order.timelapse;
    }

    return false;
});

/**
 * @description Verifica se o tipo do pedido é igual a X
 */
fileSchema.method('orderTypeIs', function (this: fileModelInterface, type: OrderType): boolean {
    if (this.order) {
        return type === this.order.type;
    }

    return false;
});

/**
 * @description Verifica se todos os procuradores aprovaram o pedido
 */
fileSchema.method('orderAllAssigneesApproved', function (this: fileModelInterface): boolean {
    if (this.assignees && this.order && this.order.answers) {
        const approved = this.order.answers.filter((answer: OrderAnswer) => answer.decision === 'Approved');

        return approved.length >= this.assignees.length;
    }

    return false;
});

/**
 * @description Retorna o index da resposta do procurador
 */
fileSchema.method('orderAnswerIndex', function (this: fileModelInterface, answer: OrderAnswer): number {
    if (this.order && this.order.answers)
        return this.order.answers.findIndex((item) => item.assignee.email === answer.assignee.email);

    return -1;
});

/**
 * @description Retorna se o grupo tem permissão para acessar o arquivo
 */
fileSchema.method('checkGroupAccess', function (this: fileModelInterface, group: Pick<GroupId, "name">, permission: FilePermission): boolean {
    if (this.accessGroupId) {
        return this.accessGroupId.filter(access => access.name === group.name && access.permissions.find(item => item === permission)).length > 0;
    }

    return false;
});

/**
 * @description Retorna se o usuario tem permissão para acessar o arquivo
 */
fileSchema.method('checkUserAccess', function (this: fileModelInterface, user: Pick<UserId, "email">, permission: FilePermission): boolean {
    if (this.accessUsersId) {
        return this.accessUsersId.filter(access => access.email === user.email && access.permissions.find(item => item === permission)).length > 0;
    }

    return false;
});

/**
 * @description Aumenta o tamanho do arquivo
 */
fileSchema.method('sizeAdd', function (this: fileModelInterface, size: number, compressedSize: number): void {
    this.size += size;
    this.compressedSize += compressedSize;
});

/**
 * @description Diminui o tamanho do arquivo
 */
fileSchema.method('sizeSubtract', function (this: fileModelInterface, size: number, compressedSize: number): void {
    this.size -= size;
    this.compressedSize -= compressedSize;
});

/**
 * @description Verifica se o arquivo está disponível no quarto informado
 */
fileSchema.method('inRoom', function (this: fileModelInterface, room: string[]): boolean {
    if (!this.room)
        this.room = [];

    if (this.room.includes('*'))
        return true;

    return this.room.filter(item => room.includes(item)).length > 0;
});

/**
 * @description Retorna o nome de usuário do autor do arquivo
 */
fileSchema.method('getAuthorUsername', async function (this: fileModelInterface): Promise<string> {
    const usersManagerDB = new UsersManagerDB();

    const { username } = await usersManagerDB.getInfo(this.authorId);

    return username;
});

/**
 * @description Retorna o email do autor do arquivo
 */
fileSchema.method('getAuthorEmail', async function (this: fileModelInterface): Promise<string> {
    const usersManagerDB = new UsersManagerDB();

    const { email } = await usersManagerDB.getInfo(this.authorId);

    return email;
});

export const FilesSchema = model<fileModelInterface>("files", fileSchema);