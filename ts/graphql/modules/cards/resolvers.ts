import { VCardGenerate, VCardRemove, VCard, Metadata } from '@/lib/VCardGenerate';
import { CardsManagerDB } from '@/database/CardsManagerDB';
import { SocialmediaName } from '@/schemas/CardsSchema';
import { UploadsController } from '@/controllers/UploadsController';
import fs from 'fs-extra';
import { localPath } from '@/utils/localpath';
import random from '@/utils/random';

type File = {
    id: string
    mirrorId: string
    name: string
    type: string
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
    id: string
    author: string
    version: string
    photo: File
    name: string
    jobtitle: string
    phones: string[]
    whatsapp: Whatsapp
    vcard: VCard
    footer: CardFooter
};

module.exports = {
    Query: {
        getCardsByAuthor: async (parent: unknown, args: { author: string, limit: number }) => {
            try {
                const
                    cardsManagerDB = new CardsManagerDB(),
                    cards = await cardsManagerDB.get(0, 1, args.limit, { author: args.author });

                return cards;
            } catch (error) {
                throw new Error(String(error));
            }
        },
        findCard: async (parent: unknown, args: { cid: string }) => {
            try {
                const
                    cardsManagerDB = new CardsManagerDB(),
                    cards = await cardsManagerDB.findById(args.cid);

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
        vcardRemove: async (parent: unknown, args: { metadata: Metadata }) => {
            try {
                return await VCardRemove(args.metadata);
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
                        author,
                        version,
                        photo,
                        name,
                        jobtitle,
                        phones,
                        whatsapp,
                        vcard,
                        footer
                    } = args.data;

                try {
                    await cardsManagerDB.findById(id)

                    throw new Error(`Card with ID(${id}) already exists`);
                } catch {
                    await cardsManagerDB.register({
                        cid: id,
                        author,
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
                }
            } catch (error) {
                throw new Error(String(error));
            }
        },
        cardUpdate: async (parent: unknown, args: { id: string, data: Card }) => {
            try {
                const
                    id = args.id,
                    cardsManagerDB = new CardsManagerDB(),
                    {
                        author,
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
                    author,
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
                const
                    cardsManagerDB = new CardsManagerDB(),
                    uploadsController = new UploadsController();

                const
                    card = await cardsManagerDB.findById(args.id),
                    logotipoFilePath = `temp/${card.vcard.logo.name}${card.vcard.logo.type}`,
                    photoFilePath = `temp/${card.photo.name}${card.photo.type}`,
                    attachmentBusinessFilePath = `temp/${card.footer.attachment.name}${card.footer.attachment.type}`;

                await uploadsController.remove(card.photo.id);
                await uploadsController.remove(card.vcard.logo.id);
                await uploadsController.remove(card.footer.attachment.id);

                // ! Remove temp files
                if (fs.existsSync(localPath(logotipoFilePath)))
                    fs.unlinkSync(localPath(logotipoFilePath));

                if (fs.existsSync(localPath(photoFilePath)))
                    fs.unlinkSync(localPath(photoFilePath));

                if (fs.existsSync(localPath(attachmentBusinessFilePath)))
                    fs.unlinkSync(localPath(attachmentBusinessFilePath));

                await cardsManagerDB.remove(args.id);

                return true
            } catch (error) {
                throw new Error(String(error));
            }
        },
    }
}