import { ObjectId } from 'mongodb';
import { VCardGenerate, VCard } from '@/lib/VCardGenerate';
import { CardsManagerDB } from '@/database/CardsManagerDB';
import { SocialmediaName } from '@/schemas/CardsSchema';
import random from '@/utils/random';

type File = {
    name: string
    type: string
    id: string
};

type Socialmedia = {
    name: SocialmediaName
    value: string
};

type Whatsapp = {
    phone: string
    text: string
    message: string
};

type CardFooter = {
    email: string
    location: string
    website: string
    attachment: File
    socialmedia: Socialmedia[]
};

type Card = {
    id: string,
    version: string,
    photo: File,
    name: string,
    jobtitle: string,
    phones: string[],
    whatsapp: Whatsapp,
    vcard: VCard,
    footer: CardFooter
};

module.exports = {
    Query: {
        cardGet: async (parent: unknown, args: { lastIndex: string, limit: number }) => {
            try {
                let filter = {};

                if (args.lastIndex && args.lastIndex.length > 0)
                    filter = {
                        _id: { $gt: new ObjectId(args.lastIndex) }
                    }

                const
                    cardsManagerDB = new CardsManagerDB(),
                    cards = await cardsManagerDB.get(0, 1, args.limit, filter);

                return cards;
            } catch (error) {
                throw new Error(String(error));
            }
        }
    },
    Mutation: {
        vcardCreate: async (parent: unknown, args: { data: VCard }) => {
            try {
                return await VCardGenerate(args.data);
            } catch (error) {
                throw new Error(String(error));
            }
        },
        cardCreate: async (parent: unknown, args: { data: Card }) => {
            try {
                const
                    cardsManagerDB = new CardsManagerDB(),
                    id = args.data['id'] && args.data['id'].length > 0 ? args.data['id'] : random.HASH(8, 'hex'),
                    {
                        version,
                        photo,
                        name,
                        jobtitle,
                        phones,
                        whatsapp,
                        vcard,
                        footer
                    } = args.data;

                await cardsManagerDB.register({
                    cid: id,
                    version,
                    photo,
                    name,
                    jobtitle,
                    phones,
                    whatsapp,
                    vcard,
                    footer
                });

                return id;
            } catch (error) {
                throw new Error(String(error));
            }
        },
        cardUpdate: async (parent: unknown, args: { data: Card }) => {
            try {
                const
                    cardsManagerDB = new CardsManagerDB(),
                    {
                        id,
                        version,
                        photo,
                        name,
                        jobtitle,
                        phones,
                        whatsapp,
                        vcard,
                        footer
                    } = args.data;

                await cardsManagerDB.update(id, {
                    cid: id,
                    version,
                    photo,
                    name,
                    jobtitle,
                    phones,
                    whatsapp,
                    vcard,
                    footer
                });

                return id;
            } catch (error) {
                throw new Error(String(error));
            }
        },
        cardRemove: async (parent: unknown, args: { id: string }) => {
            try {
                const cardsManagerDB = new CardsManagerDB();

                await cardsManagerDB.remove(args.id);

                return true
            } catch (error) {
                throw new Error(String(error));
            }
        },
    }
}