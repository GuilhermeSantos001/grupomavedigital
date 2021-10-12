/**
 * @description Rotas dos paineis
 * @author @GuilhermeSantos001
 * @update 08/10/2021
 */

import CSVParser from '@/utils/csvParser'
import Moment from '@/utils/moment';

/**
 * @description Schema da tabela: "Clientes"
 */
interface Clients {
    cod: string
    nome: string
    loja: string
}

/**
 * @description Schema da tabela: "Faturamento"
 */
interface Revenues {
    cliente: string
    loja: string
    valbrut: string
    emissao: string
}

interface RevenuesResponse {
    client: string
    store: string
    value: number
    released: string
}

module.exports = {
    Query: {
        dashboardRevenues: async (parent: unknown, args: { filial: string, client: string, store: string, period: string[], cache: boolean }) => {
            try {
                let
                    F2_filter: any = {
                        'emissao': `time: ${args.period[0]},${args.period[1]}`
                    },
                    A1_filter: any = {};

                if (args.filial) {
                    F2_filter['filial'] = args.filial;
                    A1_filter['filial'] = args.filial;
                }

                if (args.client) {
                    F2_filter['cliente'] = args.client;
                    A1_filter['cod'] = args.client;
                }

                if (args.store) {
                    F2_filter['loja'] = args.store;
                    A1_filter['loja'] = args.store;
                }

                const
                    revenues = await CSVParser.read<Revenues>('faturamento', "F2", F2_filter, args.cache),
                    clients = await CSVParser.read<Clients>('clientes', "A1", A1_filter, args.cache),
                    response: RevenuesResponse[] = [];

                const exec = () => new Promise(async (resolve, reject) => {
                    try {
                        for (const revenue of revenues) {
                            for (const client of clients) {
                                if (revenue.cliente === client.cod && revenue.loja === client.loja) {
                                    response.push({
                                        client: client.nome,
                                        store: revenue.loja,
                                        value: parseFloat(revenue.valbrut.replace(/\s{1,}/g, '').replace(/\./g, '').replace(/\,/g, '.')),
                                        released: Moment.formatDate(revenue.emissao).format('DD[/]MM[/]YYYY')
                                    })
                                }
                            }
                        }

                        return resolve(response);
                    } catch (error) {
                        return reject(error);
                    }
                })

                return await exec();
            } catch (error) {
                throw new Error(String(error));
            }
        }
    }
}