const vcard = require('../../modules/vcard');
const mongoDB = require('../../modules/mongodb');
const randomId = require('../../modules/randomId');

module.exports = {
    Mutation: {
        vcardCreate: async (parent, { data }, { req }) => {
            try {
                return await vcard(data);
            } catch (error) {
                throw new Error(error);
            }
        },
        cardCreate: async (parent, { data }, { req }) => {
            try {
                const id = randomId('');
                const { version, photo, name, jobtitle, phones, whatsapp, vcard, footer } = data;

                await mongoDB.cards.register(id, version, photo, name, jobtitle, phones, whatsapp, vcard, footer);

                return id;
            } catch (error) {
                throw new Error(error);
            }
        },
        cardUpdate: async (parent, { data }, { req }) => {
            try {
                const { id, version, photo, name, jobtitle, phones, whatsapp, vcard, footer } = data;

                await mongoDB.cards.update(id, version, photo, name, jobtitle, phones, whatsapp, vcard, footer);

                return id;
            } catch (error) {
                throw new Error(error);
            }
        },
        cardRemove: async (parent, { id }, { req }) => {
            try {
                await mongoDB.cards.remove(id);

                return true
            } catch (error) {
                throw new Error(error);
            }
        },
    }
}