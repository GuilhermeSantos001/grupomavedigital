const vcard = require('../../modules/vcard');
const mongoDB = require('../../modules/mongodb');
const randomId = require('../../modules/randomId');
const LZString = require('lz-string');

module.exports = {
    Query: {
        cardGet: async (parent, { lastIndex, limit }, { request }) => {
            try {
                let field = typeof lastIndex === 'string' ? '_id' : '',
                    value = typeof lastIndex === 'string' ? { $gt: lastIndex } : '';

                const { cards } = await mongoDB.cards.get(field, value, limit);

                return LZString.compressToEncodedURIComponent(JSON.stringify(cards));
            } catch (error) {
                throw new Error(error);
            }
        }
    },
    Mutation: {
        vcardCreate: async (parent, { data }, { request }) => {
            try {
                return await vcard(data);
            } catch (error) {
                throw new Error(error);
            }
        },
        cardCreate: async (parent, { data }, { request }) => {
            try {
                const id = randomId(''),
                    { version, photo, name, jobtitle, phones, whatsapp, vcard, footer } = data;

                await mongoDB.cards.register(id, version, photo, name, jobtitle, phones, whatsapp, vcard, footer);

                return id;
            } catch (error) {
                throw new Error(error);
            }
        },
        cardUpdate: async (parent, { data }, { request }) => {
            try {
                const { id, version, photo, name, jobtitle, phones, whatsapp, vcard, footer } = data;

                await mongoDB.cards.update(id, version, photo, name, jobtitle, phones, whatsapp, vcard, footer);

                return id;
            } catch (error) {
                throw new Error(error);
            }
        },
        cardRemove: async (parent, { id }, { request }) => {
            try {
                await mongoDB.cards.remove(id);

                return true
            } catch (error) {
                throw new Error(error);
            }
        },
    }
}