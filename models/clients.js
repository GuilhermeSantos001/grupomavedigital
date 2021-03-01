//================================================================================
// Schema(Clients)
// Layout dos clientes
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

const subSchema_inactive = new mongoose.Schema({
    reason: { // Motivo
        type: String,
        trim: true
    },
    measure: { // Medida de ação
        type: String,
        trim: true
    },
    resolution: { // Historico de atualizações sobre a inativação do cliente
        type: Array,
        default: []
    },
    closingdate: { // Data de encerramento
        type: String,
        trim: true
    }
});

let schema = new Schema({
    id: { // Identificador exclusivo do cliente
        type: String,
        trim: true,
        unique: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    person: { // Pessoa Física/Jurídica
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    name: { // Razão Social
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    costcenter: { // Centro de custo (S. MAVE, V. MAVE, MAVE SYSTEMS & QUALITY)
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    cpfcnpj: { // CPF/CNPJ do cliente
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    location: { // Endereço do cliente
        type: subSchema_location,
        default: {},
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    phone: { // Telefone para contato com o cliente
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    phone2: { // Celular para contato com o cliente
        type: String,
        trim: true
    },
    contact: { // Nome do responsável pelo contato (Cliente)
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    email: { // Email para contato com o cliente
        type: String,
        lowercase: true,
        trim: true,
        match: [/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, "O valor não é valido ({VALUE})"],
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    status: { // Se o cliente está ativo ou inativo
        type: Boolean,
        default: true
    },
    inactive: { // Detalhes da inativação do cliente
        type: subSchema_inactive,
        default: {}
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
 * @default module.exports = mongoose.model('clients', schema);
 */
module.exports = mongoose.model('clients', schema);