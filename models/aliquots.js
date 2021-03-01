//================================================================================
// Schema(Aliquots)
// Layout das aliquotas
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
    city: { // Nome da cidade
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    code: {
        type: Number,
        min: 0,
        unique: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    percentage: { // Valor da porcentagem
        type: Number,
        min: 0,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    state: { // Nome do estado
        type: String,
        trim: true,
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
 * @default module.exports = mongoose.model('aliquots', schema);
 */
module.exports = mongoose.model('aliquots', schema);