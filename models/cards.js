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
        type: new Schema({
            path: {
                type: String,
                trim: true,
                required: [true, '{PATH} este campo é obrigatório para sua segurança']
            },
            file: {
                type: String,
                trim: true,
                required: [true, '{PATH} este campo é obrigatório para sua segurança']
            },
        }),
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
        type: new Schema({
            phone: {
                type: String,
                trim: true,
                required: [true, '{PATH} este campo é obrigatório para sua segurança']
            },
            text: {
                type: Boolean,
                required: [true, '{PATH} este campo é obrigatório para sua segurança']
            }
        }),
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    vcard: {
        type: new Schema({
            firstname: {
                type: String,
                trim: true,
                required: [true, '{PATH} este campo é obrigatório para sua segurança']
            },
            lastname: {
                type: String,
                trim: true,
                required: [true, '{PATH} este campo é obrigatório para sua segurança']
            },
            organization: {
                type: String,
                trim: true,
                required: [true, '{PATH} este campo é obrigatório para sua segurança']
            },
            photo: {
                type: new Schema({
                    path: {
                        type: String,
                        trim: true,
                        required: [true, '{PATH} este campo é obrigatório para sua segurança']
                    },
                    file: {
                        type: String,
                        trim: true,
                        required: [true, '{PATH} este campo é obrigatório para sua segurança']
                    },
                }),
                required: [true, '{PATH} este campo é obrigatório para sua segurança']
            },
            logo: {
                type: new Schema({
                    path: {
                        type: String,
                        trim: true,
                        required: [true, '{PATH} este campo é obrigatório para sua segurança']
                    },
                    file: {
                        type: String,
                        trim: true,
                        required: [true, '{PATH} este campo é obrigatório para sua segurança']
                    },
                }),
                required: [true, '{PATH} este campo é obrigatório para sua segurança']
            },
            workPhone: {
                type: [String],
                required: [true, '{PATH} este campo é obrigatório para sua segurança']
            },
            birthday: {
                type: new Schema({
                    year: {
                        type: Number,
                        min: [1920, 'O valor do caminho `{PATH}` (`{VALUE}`) é menor que o comprimento mínimo permitido ({MINLENGTH}).'],
                        required: [true, '{PATH} este campo é obrigatório para sua segurança']
                    },
                    month: {
                        type: Number,
                        min: [0, 'O valor do caminho `{PATH}` (`{VALUE}`) é menor que o comprimento mínimo permitido ({MINLENGTH}).'],
                        max: [11, 'O valor do caminho `{PATH}` (`{VALUE}`) excedeu o comprimento máximo permitido ({MAXLENGTH}).'],
                        required: [true, '{PATH} este campo é obrigatório para sua segurança']
                    },
                    day: {
                        type: Number,
                        min: [1, 'O valor do caminho `{PATH}` (`{VALUE}`) é menor que o comprimento mínimo permitido ({MINLENGTH}).'],
                        max: [31, 'O valor do caminho `{PATH}` (`{VALUE}`) excedeu o comprimento máximo permitido ({MAXLENGTH}).'],
                        required: [true, '{PATH} este campo é obrigatório para sua segurança']
                    }
                }),
                required: [true, '{PATH} este campo é obrigatório para sua segurança']
            },
            title: {
                type: String,
                trim: true,
                required: [true, '{PATH} este campo é obrigatório para sua segurança']
            },
            url: {
                type: String,
                trim: true,
                required: [true, '{PATH} este campo é obrigatório para sua segurança']
            },
            workUrl: {
                type: String,
                trim: true,
                required: [true, '{PATH} este campo é obrigatório para sua segurança']
            },
            workEmail: {
                type: String,
                trim: true,
                required: [true, '{PATH} este campo é obrigatório para sua segurança']
            },
            workAddress: {
                type: new Schema({
                    label: {
                        type: String,
                        trim: true,
                        default: 'Work Address',
                        enum: [
                            'Work Address',
                            'Home Address'
                        ],
                        required: [true, '{PATH} este campo é obrigatório para sua segurança']
                    },
                    street: {
                        type: String,
                        trim: true,
                        required: [true, '{PATH} este campo é obrigatório para sua segurança']
                    },
                    city: {
                        type: String,
                        trim: true,
                        required: [true, '{PATH} este campo é obrigatório para sua segurança']
                    },
                    stateProvince: {
                        type: String,
                        trim: true,
                        required: [true, '{PATH} este campo é obrigatório para sua segurança']
                    },
                    postalCode: {
                        type: String,
                        trim: true,
                        required: [true, '{PATH} este campo é obrigatório para sua segurança']
                    },
                    countryRegion: {
                        type: String,
                        trim: true,
                        default: 'Brazil',
                        enum: [
                            'Brazil'
                        ],
                        required: [true, '{PATH} este campo é obrigatório para sua segurança']
                    }
                }),
                required: [true, '{PATH} este campo é obrigatório para sua segurança']
            },
            socialUrls: {
                type: Object,
                required: [true, '{PATH} este campo é obrigatório para sua segurança']
            },
            file: new Schema({
                name: {
                    type: String,
                    trim: true
                },
                path: {
                    type: String,
                    trim: true
                }
            })
        }),
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    footer: {
        type: new Schema({
            email: {
                type: String,
                trim: true,
                required: [true, '{PATH} este campo é obrigatório para sua segurança']
            },
            location: {
                type: String,
                trim: true,
                required: [true, '{PATH} este campo é obrigatório para sua segurança']
            },
            website: {
                type: String,
                trim: true,
                required: [true, '{PATH} este campo é obrigatório para sua segurança']
            },
            attachment: {
                type: String,
                trim: true,
                required: [true, '{PATH} este campo é obrigatório para sua segurança']
            },
            socialmedia: [new Schema({
                name: {
                    type: String,
                    trim: true,
                    enum: [
                        'Facebook',
                        'Youtube',
                        'Linkedin',
                        'Instagram',
                        'Twitter'
                    ],
                    required: [true, '{PATH} este campo é obrigatório para sua segurança']
                },
                value: {
                    type: String,
                    trim: true,
                    required: [true, '{PATH} este campo é obrigatório para sua segurança']
                },
                enabled: {
                    type: Boolean,
                    required: [true, '{PATH} este campo é obrigatório para sua segurança']
                }
            })]
        }),
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
 * @default module.exports = mongoose.model('cards', schema);
 */
module.exports = mongoose.model('cards', schema);