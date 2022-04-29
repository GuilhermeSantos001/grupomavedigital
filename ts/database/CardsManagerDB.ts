/**
 * @description Gerenciador de informações com o banco de dados
 * @author GuilhermeSantos001
 * @update 29/03/2022
 */

import { FilterQuery } from 'mongoose';

import { CardsSchema, cardsInterface, cardsModelInterface } from '@/schemas/CardsSchema';
import Moment from '@/utils/moment';

export interface cardsInfo extends cardsInterface {
    index: string;
}

export type Sort = 1 | -1;

export class CardsManagerDB {
    /**
     * @description Retorna os cartões digitais com limite de itens a serem retornados
     * @param skip Pula a leitura de uma quantidade X de itens iniciais
     * @param sort Define a ordem de leitura, crescente ou decrescente
     * @param limit Limite de itens a serem retornados
     * @param filter Filtro de pesquisa
     */
    public async get(skip: number, sort: Sort, limit: number, filter: FilterQuery<cardsModelInterface>): Promise<cardsInfo[]> {
        let cards: cardsInfo[];

        const _cards = await CardsSchema.find(filter, null).skip(skip).sort({ $natural: sort }).limit(limit);

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

        return cards;
    }

    /**
     * @description Retorna o cartão digital pelo ID
     * @param cid ID do cartão digital
     */
    public async findById(cid: string): Promise<cardsInfo> {
        const _card = await CardsSchema.findOne({ cid }).exec();

        if (_card) {
            return {
                cid: _card.cid,
                index: _card._id,
                name: _card.name,
                jobtitle: _card.jobtitle,
                photo: _card.photo,
                phones: _card.phones,
                footer: _card.footer,
                vcard: _card.vcard,
                whatsapp: _card.whatsapp,
                version: _card.version
            }
        } else {
            throw new Error(`Cartão Digital com o ID(${cid}) não está registrado.`);
        }
    }

    /**
     * @description Registra o cartão digital
     */
    public async register(card: cardsInterface): Promise<boolean> {
        const _card = await CardsSchema.findOne({ 'cid': card.cid }).exec();

        if (!_card) {
            const model = await CardsSchema.create({
                ...card,
                createdAt: Moment.format()
            });

            await model.validate();
            await model.save();
        } else {
            throw new Error(`Cartão Digital com o ID(${card.cid}) já está registrado.`);
        }

        return true;
    }

    /**
     * @description Atualiza o cartão digital
     */
    public async update(cid: string, card: cardsInterface): Promise<boolean> {
        const _card = await CardsSchema.findOne({ cid }).exec();

        if (_card) {
            _card.version = card.version;
            _card.photo = card.photo;
            _card.name = card.name;
            _card.jobtitle = card.jobtitle;
            _card.phones = card.phones;
            _card.whatsapp = card.whatsapp;
            _card.vcard = card.vcard;
            _card.footer = card.footer;

            await CardsSchema.updateOne({ cid }, {
                $set: {
                    version: _card.version,
                    photo: _card.photo,
                    name: _card.name,
                    jobtitle: _card.jobtitle,
                    phones: _card.phones,
                    whatsapp: _card.whatsapp,
                    vcard: _card.vcard,
                    footer: _card.footer
                }
            });
        } else {
            throw new Error(`Cartão Digital com o ID(${cid}) não está registrado.`);
        }

        return true;
    }

    /**
     * @description Remove o cartão digital
     */
    public async remove(cid: string): Promise<boolean> {
        const _card = await CardsSchema.findOne({ cid }).exec();

        if (_card) {
            await _card.remove();
        } else {
            throw new Error(`Cartão Digital com o ID(${cid}) não está registrado.`);
        }

        return true;
    }
}