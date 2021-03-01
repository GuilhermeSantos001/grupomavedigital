//================================================================================
// Schema(Rents)
// Layout das alocações
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

let schema = new Schema({
    id: { // Identificador exclusivo da alocação
        type: String,
        trim: true,
        unique: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    description: { // Descrição
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    quantity: { // Quantidade
        type: Number,
        min: 0,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    unitary: { // Valor Unitario
        type: Number,
        min: 0,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    total: { // Valor Total
        type: Number,
        min: 0,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
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
 * @default module.exports = mongoose.model('rents', schema);
 */
module.exports = mongoose.model('rents', schema);