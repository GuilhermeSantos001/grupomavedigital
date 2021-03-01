//================================================================================
// Schema(Fuel)
// Layout do combustível
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
    id: { // Identificador exclusivo do combustível
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
    tank: { // Tanque de combustível
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
 * @default module.exports = mongoose.model('fuel', schema);
 */
module.exports = mongoose.model('fuel', schema);