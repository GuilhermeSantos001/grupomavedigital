//================================================================================
// Schema(States)
// Layout dos estados
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
 * @description Timer
 */
const moment = require('../modules/moment');

/**
 * @private Restrito ao escopo global
 * @type object
 * @description Cria uma instancia da classe Schema
 * @default new Schema({})
 */

let schema = new Schema({
    name: { // Nome do Estado
        type: String,
        trim: true,
        unique: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    cities: { // Cidades do Estado
        type: Array,
        default: []
    },
    country: { // País do estado
        type: String,
        trim: true,
        default: 'brasil',
        required: [true, '{PATH} este campo é obrigatório']
    },
    created: {
        type: String,
        trim: true,
        default: moment.format(),
        required: [true, '{PATH} este campo é obrigatório']
    }
});

/**
 * @public Exportado pelo module.exports
 * @type {{}}
 * @default module.exports = mongoose.model('states', schema);
 */
module.exports = mongoose.model('states', schema);