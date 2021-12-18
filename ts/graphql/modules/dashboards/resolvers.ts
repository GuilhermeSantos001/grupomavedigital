/**
 * @description Rotas dos paineis
 * @author @GuilhermeSantos001
 * @update 14/10/2021
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

/**
 * @description Schema da tabela: "Faturamento"
 */
interface BillsReceive {
    prefixo: string
    num: string
    parcela: string
    tipo: string
    naturez: string
    cliente: string
    loja: string
    nomcli: string
    emissao: string
    baixa: string
    vencto: string
    vencrea: string
    irrf: string
    iss: string
    inss: string
    csll: string
    cofins: string
    pis: string
    valor: string
    valliq: string
    saldo: string
}

interface BillsReceiveClient {
    id: string
    name: string
    store: string
}

interface BillsReceiveTaxes {
    IRRF: string
    ISS: string
    INSS: string
    CSLL: string
    COFINS: string
    PIS: string
}

interface BillsReceiveResponse {
    prefix: string
    num: string
    parcel: string
    type: string
    bankingNature: string
    client: BillsReceiveClient
    released: string
    finished: string
    expectedExpiration: string
    realExpiration: string
    taxes: BillsReceiveTaxes
    grossValue: number
    liquidValue: number
    balanceValue: number
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
                throw new TypeError(String(error));
            }
        },
        dashboardReceive: async (parent: unknown, args: { filial: string, client: string, store: string, type: string, bankingNature: string, period: string[], cache: boolean }) => {
            try {
                let
                    E1_filter: any = {
                        'emissao': `time: ${args.period[0]},${args.period[1]}`
                    };

                if (args.filial) {
                    E1_filter['filial'] = args.filial;
                }

                if (args.client) {
                    E1_filter['cliente'] = args.client;
                }

                if (args.store) {
                    E1_filter['loja'] = args.store;
                }

                if (args.type) {
                    E1_filter['tipo'] = args.type;
                }

                if (args.bankingNature) {
                    E1_filter['naturez'] = args.bankingNature;
                }

                const
                    billsReceive = await CSVParser.read<BillsReceive>('contas_a_receber', "E1", E1_filter, args.cache),
                    response: BillsReceiveResponse[] = [];

                const exec = () => new Promise(async (resolve, reject) => {
                    try {
                        for (const receive of billsReceive) {
                            response.push({
                                prefix: receive.prefixo,
                                num: receive.num,
                                parcel: receive.parcela,
                                type: receive.tipo,
                                bankingNature: receive.naturez,
                                client: {
                                    id: receive.cliente,
                                    name: receive.nomcli,
                                    store: receive.loja
                                },
                                released: Moment.formatDate(receive.emissao).format('DD[/]MM[/]YYYY'),
                                finished: Moment.formatDate(receive.baixa).format('DD[/]MM[/]YYYY'),
                                expectedExpiration: Moment.formatDate(receive.vencto).format('DD[/]MM[/]YYYY'),
                                realExpiration: Moment.formatDate(receive.vencrea).format('DD[/]MM[/]YYYY'),
                                taxes: {
                                    IRRF: String(parseFloat(receive.irrf.replace(/\s{1,}/g, '').replace(/\./g, '').replace(/\,/g, '.'))),
                                    ISS: String(parseFloat(receive.iss.replace(/\s{1,}/g, '').replace(/\./g, '').replace(/\,/g, '.'))),
                                    INSS: String(parseFloat(receive.inss.replace(/\s{1,}/g, '').replace(/\./g, '').replace(/\,/g, '.'))),
                                    CSLL: String(parseFloat(receive.csll.replace(/\s{1,}/g, '').replace(/\./g, '').replace(/\,/g, '.'))),
                                    COFINS: String(parseFloat(receive.cofins.replace(/\s{1,}/g, '').replace(/\./g, '').replace(/\,/g, '.'))),
                                    PIS: String(parseFloat(receive.pis.replace(/\s{1,}/g, '').replace(/\./g, '').replace(/\,/g, '.')))
                                },
                                grossValue: parseFloat(receive.valor.replace(/\s{1,}/g, '').replace(/\./g, '').replace(/\,/g, '.')),
                                liquidValue: parseFloat(receive.valliq.replace(/\s{1,}/g, '').replace(/\./g, '').replace(/\,/g, '.')),
                                balanceValue: parseFloat(receive.saldo.replace(/\s{1,}/g, '').replace(/\./g, '').replace(/\,/g, '.')) > 0 ?
                                    parseFloat(receive.valor.replace(/\s{1,}/g, '').replace(/\./g, '').replace(/\,/g, '.')) - parseFloat(receive.saldo.replace(/\s{1,}/g, '').replace(/\./g, '').replace(/\,/g, '.')) : 0,
                            })
                        }

                        return resolve(response);
                    } catch (error) {
                        return reject(error);
                    }
                })

                return await exec();
            } catch (error) {
                throw new TypeError(String(error));
            }
        }
    }
}