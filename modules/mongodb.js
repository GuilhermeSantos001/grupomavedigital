//================================================================================
// MongoDB
// Banco de dados
//================================================================================
/**
 * @private Restrito ao escopo global
 * @type {{}}
 * @description Importa o método mongoose
 */
var mongoose = require('mongoose');

/**
 * @private Restrito ao escopo global
 * @type {{}}
 * @description Importa as configurações do mongoDB
 */
var configMongoDB = {
    'user': {
        'name': process.env.DB_USERNAME,
        'password': process.env.DB_PASSWORD
    },
    'address': process.env.DB_HOST,
    'port': process.env.DB_PORT,
    'db': process.env.DB_NAME
};

/**
 * @private Restrito ao escopo global
 * @type {{}}
 * @description Importa o modulo para criar o Schema de comandos
 */
var schema_states = require('../models/states'),
    schema_users = require('../models/users'),
    schema_cards = require('../models/cards'),
    schema_clients = require('../models/clients'),
    schema_aliquots = require('../models/aliquots'),
    schema_esocial = require('../models/esocial'),
    schema_benefits = require('../models/benefits'),
    schema_equipments = require('../models/equipments'),
    schema_rents = require('../models/rents'),
    schema_fuel = require('../models/fuel'),
    schema_uniforms = require('../models/uniforms'),
    schema_workdata = require('../models/workdata');

/**
 * @private Restrito ao escopo global
 * @type {{}}
 * @description Endereço de DNS do mongoDB
 * @default `mongodb://${configMongoDB.user.name}:${configMongoDB.user.password}@${configMongoDB.address}:${configMongoDB.port}/${configMongoDB.db}?authSource=admin`
 */
var uri = `mongodb://${configMongoDB.user.name}:${configMongoDB.user.password}@${configMongoDB.address}:${configMongoDB.port}/${configMongoDB.db}?authSource=admin`;

//================================================================================
// EVENTOS DE CONEXÃO COM O MONGODB
//================================================================================
/**
 * @description Se a conexão for estabelecida
 */
mongoose.connection.on('connected', function () {
    console.log(`A conexão com o mongoDB foi estabelecida em ${uri}`);
});

/**
 * @description Se o correr erros com a conexão
 */
mongoose.connection.on('error', function (err) {
    console.error(`A conexão com o mongoDB teve um erro ${err}`);
});

/**
 * @description Quando a conexão é desconectada
 */
mongoose.connection.on('disconnected', function () {
    console.log(`A conexão com o mongoDB foi fechada`);
});

/**
 * @description Quando a conexão está aberta
 */
mongoose.connection.on('open', function () {
    console.log(`A conexão com o mongoDB foi aberta`);
});

/**
 * @description Se o aplicativo fechar, feche a conexão
 */
process.on('SIGINT', function () {
    mongoose.connection.close(function (error) {
        if (error) {
            return console.error(error);
        }

        if (mongoose.connection.readyState == 1) {
            console.log(`A conexão com o mongoDB foi fechada, devido ao encerramento do servidor`);
        }

        process.exit(0);
    });
});

//================================================================================
// MÓDULOS DO BANCO DE DADOS
//================================================================================
const db_states = require('./database/db-states')(mongoose, uri, schema_states),
    db_users = require('./database/db-users')(mongoose, uri, schema_users),
    db_cards = require('./database/db-cards')(mongoose, uri, schema_cards),
    db_clients = require('./database/db-clients')(mongoose, uri, schema_clients),
    db_aliquots = require('./database/db-aliquots')(mongoose, uri, schema_aliquots),
    db_esocial = require('./database/db-esocial')(mongoose, uri, schema_esocial),
    db_benefits = require('./database/db-benefits')(mongoose, uri, schema_benefits),
    db_equipments = require('./database/db-equipments')(mongoose, uri, schema_equipments),
    db_rents = require('./database/db-rents')(mongoose, uri, schema_rents),
    db_fuel = require('./database/db-fuel')(mongoose, uri, schema_fuel),
    db_uniforms = require('./database/db-uniforms')(mongoose, uri, schema_uniforms),
    db_workdata = require('./database/db-workdata')(mongoose, uri, schema_workdata);

//================================================================================
// MODULO PARA EXPORTAR O SCRIPT
//================================================================================

module.exports = {
    states: {
        register: db_states.register,
        get: db_states.get
    },
    users: {
        register: db_users.register,
        updateDoc: db_users.updateDoc,
        cemail: db_users.cemail,
        cpassword: db_users.cpassword,
        changepassword: db_users.changepassword,
        retrieve: db_users.retrieve,
        connected: db_users.connected,
        disconnected: db_users.disconnected,
        verifytoken: db_users.verifytoken,
        signtwofactor: db_users.signtwofactor,
        verifytwofactor: db_users.verifytwofactor,
        enabledtwofactor: db_users.enabledtwofactor,
        disabledtwofactor: db_users.disabledtwofactor,
        notificationCreate: db_users.notificationCreate,
        notificationRemove: db_users.notificationRemove,
        get: db_users.get
    },
    cards: {
        register: db_cards.register,
        update: db_cards.update,
        remove: db_cards.remove,
        get: db_cards.get
    },
    clients: {
        register: db_clients.register,
        update: db_clients.update,
        inactive: db_clients.inactive,
        reactivate: db_clients.reactivate,
        sendResolution: db_clients.sendResolution,
        removeResolution: db_clients.removeResolution,
        sendClosingdate: db_clients.sendClosingdate,
        get: db_clients.get
    },
    aliquots: {
        register: db_aliquots.register,
        update: db_aliquots.update,
        remove: db_aliquots.remove,
        get: db_aliquots.get
    },
    esocial: {
        register: db_esocial.register,
        update: db_esocial.update,
        remove: db_esocial.remove,
        get: db_esocial.get
    },
    benefits: {
        register: db_benefits.register,
        update: db_benefits.update,
        remove: db_benefits.remove,
        get: db_benefits.get
    },
    uniforms: {
        register: db_uniforms.register,
        update: db_uniforms.update,
        remove: db_uniforms.remove,
        get: db_uniforms.get
    },
    workdata: {
        register: db_workdata.register,
        update: db_workdata.update,
        remove: db_workdata.remove,
        get: db_workdata.get,
        getUniforms: db_workdata.getUniforms
    },
    equipments: {
        register: db_equipments.register,
        update: db_equipments.update,
        remove: db_equipments.remove,
        get: db_equipments.get
    },
    rents: {
        register: db_rents.register,
        update: db_rents.update,
        remove: db_rents.remove,
        get: db_rents.get
    },
    fuel: {
        register: db_fuel.register,
        update: db_fuel.update,
        remove: db_fuel.remove,
        get: db_fuel.get
    }
};