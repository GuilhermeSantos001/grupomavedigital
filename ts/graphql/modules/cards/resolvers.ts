/**
 * @description Rotas dos cartões
 * @author @GuilhermeSantos001
 * @update 17/07/2021
 * @version 2.0.0
 */

import vcard from '@/core/vcard';
import cardsDB from '@/db/cards-db';
import { SocialmediaName } from '@/mongo/cards-manager-mongo';
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
        cardGet: async (parent: any, args: { lastIndex: string, limit: number }, context: { req: any }) => {
            try {
                let field: any = {};

                field['_id'] = { $gt: args.lastIndex };

                const cards = await cardsDB.get(0, 1, args.limit, field);

                return compressToEncodedURIComponent(JSON.stringify(cards));
            } catch (error: any) {
                throw new Error(error);
            }
        }
    },
    Mutation: {
        vcardCreate: async (parent: any, args: { data: Vcard }, context: { req: any }) => {
            try {
                return await vcard(args.data);
            } catch (error: any) {
                throw new Error(error);
            }
        },
        cardCreate: async (parent: any, args: { data: Card }, context: { req: any }) => {
            try {
                const
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

                await cardsDB.register({
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
            } catch (error: any) {
                throw new Error(error);
            }
        },
        cardUpdate: async (parent: any, args: { data: Card }, context: { req: any }) => {
            try {
                const {
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

                await cardsDB.update(id, {
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
            } catch (error: any) {
                throw new Error(error);
            }
        },
        cardRemove: async (parent: any, args: { id: string }, context: { req: any }) => {
            try {
                await cardsDB.remove(args.id);

                return true
            } catch (error: any) {
                throw new Error(error);
            }
        },
    }
}