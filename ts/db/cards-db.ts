/**
 * @description Gerenciador de informações com o banco de dados
 * @author @GuilhermeSantos001
 * @update 01/09/2021
 * @version 1.1.3
 */

import { FilterQuery } from 'mongoose';

import cardsDB, { cardsInterface, cardsModelInterface } from '@/mongo/cards-manager-mongo';
import Moment from '@/utils/moment';

export interface cardsInfo extends cardsInterface {
    index: string;
}

export type Sort = 1 | -1;

class cardsManagerDB {
    /**
     * @description Registra o cartão digital
     */
    public register(card: cardsInterface) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                const _card = await cardsDB.findOne({ 'cid': card.cid }).exec();

                if (!_card) {
                    const model = await cardsDB.create({
                        ...card,
                        createdAt: Moment.format()
                    });

                    await model.validate();
                    await model.save();
                } else {
                    return reject(`Cartão Digital com o ID(${card.cid}) já está registrado.`);
                }

                return resolve(true);
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * @description Atualiza o cartão digital
     */
    public update(cid: string, card: cardsInterface) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                const _card = await cardsDB.findOne({ cid }).exec();

                if (_card) {
                    _card.version = card.version;
                    _card.photo = card.photo;
                    _card.name = card.name;
                    _card.jobtitle = card.jobtitle;
                    _card.phones = card.phones;
                    _card.whatsapp = card.whatsapp;
                    _card.vcard = card.vcard;
                    _card.footer = card.footer;

                    await _card.save();
                } else {
                    return reject(`Cartão Digital com o ID(${cid}) não está registrado.`);
                }

                return resolve(true);
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * @description Remove o cartão digital
     */
    public remove(cid: string) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                const _card = await cardsDB.findOne({ cid }).exec();

                if (_card) {
                    await _card.remove();
                } else {
                    return reject(`Cartão Digital com o ID(${cid}) não está registrado.`);
                }

                return resolve(true);
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * @description Retorna os cartões digitais com limite de itens a serem retornados
     * @param skip Pula a leitura de uma quantidade X de itens iniciais
     * @param sort Define a ordem de leitura, crescente ou decrescente
     * @param limit Limite de itens a serem retornados
     * @param filter Filtro de pesquisa
     */
    public get(skip: number, sort: Sort, limit: number, filter: FilterQuery<cardsModelInterface>): Promise<cardsInfo[]> {
        return new Promise(async (resolve, reject) => {
            try {
                let cards: cardsInfo[];

                const _cards = await cardsDB.find(filter, null).skip(skip).sort({ $natural: sort }).limit(limit);

                if (_cards.length > 0) {
                    cards = _cards.map((card: cardsModelInterface) => {
                        return {
                            cid: card.cid,
                            index: card._id,
                            name: card.name,
                            jobtitle: card.jobtitle,
                            photo: card.photo,
                            phones: card.phones,
                            footer: card.footer,
                            vcard: card.vcard,
                            whatsapp: card.whatsapp,
                            version: card.version
                        }
                    })
                } else {
                    cards = [];
                }

                return resolve(cards);
            } catch (error) {
                return reject(error);
            }
        });
    }
}

export default new cardsManagerDB();