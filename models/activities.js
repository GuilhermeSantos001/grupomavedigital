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
 * @type object
 * @description Cria uma instancia da classe Schema
 * @default new Schema({})
 */

let schema = new Schema({
    id: { // Identificador único da atividade
        type: String,
        trim: true,
        unique: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    ipremote: { // Endereço de IP do Cliente
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório']
    },
    auth: { // Identificar do usuário
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório']
    },
    privilege: { // Privilégios do usuário
        type: [String],
        required: [true, '{PATH} este campo é obrigatório']
    },
    roadmap: {
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório']
    },
    created: {
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório']
    }
});

/**
 * @public Exportado pelo module.exports
 * @type {{}}
 * @default module.exports = mongoose.model('activities', schema);
 */
module.exports = mongoose.model('activities', schema);