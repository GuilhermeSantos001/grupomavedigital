//================================================================================
// Schema(Cards)
// Layout dos cartões
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
    id: {
        type: String,
        unique: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    photo: {
        type: String,
        trim: true,
        lowercase: true,
        default: '',
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    name: {
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    jobtitle: {
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    phones: {
        type: [String],
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    whatsapp: {
        type: String,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    footer: {
        type: new Schema({
            email: {
                type: String,
                required: [true, '{PATH} este campo é obrigatório para sua segurança']
            },
            location: {
                type: String,
                required: [true, '{PATH} este campo é obrigatório para sua segurança']
            },
            website: {
                type: String,
                required: [true, '{PATH} este campo é obrigatório para sua segurança']
            },
            attachment: {
                type: String,
                required: [true, '{PATH} este campo é obrigatório para sua segurança']
            }
        }),
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    socialmedia: [String],
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
 * @default module.exports = mongoose.model('cards', schema);
 */
module.exports = mongoose.model('cards', schema);