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
    schema_cards = require('../models/cards');

/**
 * @private Restrito ao escopo global
 * @type {{}}
 * @description Endereço de DNS do mongoDB
 * @default `mongodb://${configMongoDB.user.name}:${configMongoDB.user.password}@${configMongoDB.address}:${configMongoDB.port}/${configMongoDB.db}?authSource=admin`
 */
var uri = `mongodb://${configMongoDB.user.name}:${encodeURIComponent(configMongoDB.user.password)}@${configMongoDB.address}:${configMongoDB.port}/${configMongoDB.db}?authSource=admin`;

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
    db_cards = require('./database/db-cards')(mongoose, uri, schema_cards);

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
    }
};