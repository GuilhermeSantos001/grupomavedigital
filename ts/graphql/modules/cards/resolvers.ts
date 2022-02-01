/**
 * @description Rotas dos cartões
 * @author GuilhermeSantos001
 * @update 31/01/2022
 */

import {VCardGenerate} from '@/lib/VCardGenerate';
import {CardsManagerDB} from '@/database/CardsManagerDB';
import { SocialmediaName } from '@/schemas/CardsSchema';
import random from '@/utils/random';
import { compressToEncodedURIComponent } from 'lz-string';

type File = {
    path: string,
    name: string
};

type Birthday = {
    year: number,
    month: number,
    day: number,
};

type SocialURL = {
    media: string,
    url: string
};

type Socialmedia = {
    name: SocialmediaName,
    value: string,
    enabled: boolean
};

type Whatsapp = {
    phone: string,
    text: string,
    message: string
};

type CardFooter = {
    email: string,
    location: string,
    website: string,
    attachment: string,
    socialmedia: Socialmedia[]
};

type Label = 'Work Address' | 'Home Address';

type CountryRegion = 'Brazil' | 'United States';

type Vcard = {
    firstname: string,
    lastname: string,
    organization: string,
    photo: File,
    logo: File,
    workPhone: string[],
    birthday: Birthday,
    title: string,
    url: string,
    workUrl: string,
    email: string,
    label: Label,
    countryRegion: CountryRegion,
    street: string,
    city: string,
    stateProvince: string,
    postalCode: string,
    socialUrls: SocialURL[],
    file: File
};

type Card = {
    id: string,
    version: string,
    photo: File,
    name: string,
    jobtitle: string,
    phones: string[],
    whatsapp: Whatsapp,
    vcard: Vcard,
    footer: CardFooter
};

module.exports = {
    Query: {
        cardGet: async (parent: unknown, args: { lastIndex: string, limit: number }) => {
            try {
                const
                cardsManagerDB = new CardsManagerDB(),
                cards = await cardsManagerDB.get(0, 1, args.limit, {
                    _id: { $gt: args.lastIndex }
                });

                return compressToEncodedURIComponent(JSON.stringify(cards));
            } catch (error) {
                throw new Error(String(error));
            }
        }
    },
    Mutation: {
        vcardCreate: async (parent: unknown, args: { data: Vcard }) => {
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
                    id = args.data['id'].length > 0 ? args.data['id'] : random.HASH(8, 'hex'),
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