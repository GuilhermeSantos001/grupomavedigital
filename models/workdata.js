//================================================================================
// Schema(Work Data)
// Layout dos dados trabalhistas
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
const subSchema_time = new mongoose.Schema({
    start: { // Horario de entrada
        type: String,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    end: { // Horario de saida
        type: String,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    }
});

const subSchema_overtime = new mongoose.Schema({
    fifty: { // Intervalo ou Hora Extra 50%
        type: Number,
        min: 0,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    hundred: { // Hora Extra 100%
        type: Number,
        min: 0,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    }
});

const subSchema_additional = new mongoose.Schema({
    value: { // Valor
        type: Number,
        min: 0,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    enabled: { // Se o adicional noturno está habilitado
        type: Boolean,
        default: false,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    }
});

let schema = new Schema({
    id: { // Identificador exclusivo
        type: String,
        trim: true,
        unique: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    jobtitle: { // Cargo/Função
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    scale: { // Escala de Trabalho
        type: String,
        trim: true,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    salary: { // Piso Salarial
        type: Number,
        min: 0,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    time: { // Horario de trabalho
        type: subSchema_time,
        default: {},
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    dayswork: { // Dias de trabalho
        type: Number,
        min: 1,
        max: 26,
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    overtime: {
        type: subSchema_overtime,
        default: {},
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    accumulation: { // Acumulo de função
        type: subSchema_additional,
        default: {},
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    additionalnight: { // Adicional Noturno
        type: subSchema_additional,
        default: {},
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    gratification: { // Gratificação
        type: subSchema_additional,
        default: {},
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    dangerousness: { // Periculosidade
        type: subSchema_additional,
        default: {},
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    insalubrity: { // Insalubridade
        type: subSchema_additional,
        default: {},
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    dsr: { // Dias de descanso remunerado
        type: subSchema_additional,
        default: {},
        required: [true, '{PATH} este campo é obrigatório para sua segurança']
    },
    uniforms: [{ // Uniformes
        type: Schema.Types.ObjectId,
        ref: 'uniforms'
    }],
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
 * @default module.exports = mongoose.model('workdata', schema);
 */
module.exports = mongoose.model('workdata', schema);