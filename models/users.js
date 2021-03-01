//================================================================================
// Schema(Users)
// Layout dos usuários
//================================================================================
/**
 * @private Restrito ao escopo global
 * @type {{}}
 * @description Importa o método mongoose
 * @default require('mongoose')
 */
let mongoose = require('mongoose');

/**
 * @private Restrito ao escopo global
 * @type {{}}
 * @description Importa a classe Schema do mongoose
 * @default mongoose.Schema
 */
let Schema = mongoose.Schema;

/**
 * @private Restrito ao escopo global
 * @type {{}}
 * @description Importa a classe Schema do mongoose
 * @default mongoose.Schema
 */
const dateEx = require('../modules/dateEx');

/**
 * @private Restrito ao escopo global
 * @type object
 * @description Cria uma instancia da classe Schema
 * @default new Schema({})
 */

const subSchema_email = new mongoose.Schema({
    value: { // Endereço de Email único do usuário
        type: String,
        lowercase: true,
        trim: true,
        unique: true,
        match: [/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, "O valor não é valido ({VALUE})"]
    },
    status: { // Se o email está confirmado
        type: Boolean,
        default: false
    }
});

const subSchema_location = new mongoose.Schema({
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

let schema = new Schema({
    authorization: { // Autorização única do usuário
        type: String,
        trim: true,
        unique: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    privilege: { // Tipo de acesso (administrator, comum e etc)
        type: String,
        trim: true,
        default: 'comum'
    },
    fotoPerfil: { // Foto de Perfil
        type: String,
        trim: true,
        default: 'avatar.png'
    },
    username: { // Nome de usuário
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança'],
        maxlength: [33, 'O valor do caminho `{PATH}` (`{VALUE}`) excedeu o comprimento máximo permitido ({MAXLENGTH}).'],
        minlength: [6, 'O valor do caminho `{PATH}` (`{VALUE}`) é menor que o comprimento mínimo permitido ({MINLENGTH}).']
    },
    password: { // Senha de usuário
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    name: { // Nome
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança'],
        maxlength: [33, 'O valor do caminho `{PATH}` (`{VALUE}`) excedeu o comprimento máximo permitido ({MAXLENGTH}).'],
        minlength: [6, 'O valor do caminho `{PATH}` (`{VALUE}`) é menor que o comprimento mínimo permitido ({MINLENGTH}).']
    },
    surname: { // Sobrenome
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança'],
        maxlength: [33, 'O valor do caminho `{PATH}` (`{VALUE}`) excedeu o comprimento máximo permitido ({MAXLENGTH}).'],
        minlength: [6, 'O valor do caminho `{PATH}` (`{VALUE}`) é menor que o comprimento mínimo permitido ({MINLENGTH}).']
    },
    email: { // Email
        type: subSchema_email,
        default: {},
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    cnpj: { // CNPJ
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    location: { // Endereço
        type: subSchema_location,
        default: {},
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    docs: { // Documentos do usuários
        type: Object,
        default: {
            termo_confidencialidade: {
                doc: '',
                readuser: '',
                reading: false,
                status: false
            },
            contrato_de_parceria: {
                doc: '',
                readuser: '',
                reading: false,
                status: false
            }
        }
    },
    notifications: {
        type: Array,
        default: []
    },
    session: {
        type: Object,
        default: {
            connected: 0,
            limit: 4,
            alerts: {},
            cache: {
                tmp: 60,
                unit: "m",
                tokens: {},
                history: {}
            },
            devices: {
                allowed: [
                    "desktop",
                    "phone",
                    "tablet",
                    "tv"
                ],
                connected: []
            }
        }
    },
    authentication: {
        type: Object,
        default: {
            twofactor: false
        }
    },
    created: {
        type: String,
        trim: true,
        default: dateEx.now(),
        required: [true, '{PATH} este campo é obrigatório']
    }
});

/**
 * @public Exportado pelo module.exports
 * @type {{}}
 * @default module.exports = mongoose.model('users', schema);
 */
module.exports = mongoose.model('users', schema);