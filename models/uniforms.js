//================================================================================
// Schema(Uniforms)
// Layout dos uniformes
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
    id: { // Identificador exclusivo
        type: String,
        trim: true,
        unique: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    description: { // Descrição do uniforme
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    quantity: { // Quantidade
        type: Number,
        min: 0,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    unitary: { // Valor unitario
        type: Number,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    total: { // Valor Total
        type: Number,
        min: 0,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    monthlycost: { // Custo Mensal
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
 * @default module.exports = mongoose.model('uniforms', schema);
 */
module.exports = mongoose.model('uniforms', schema);