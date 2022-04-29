/**
 * @description Rotas dos dados
 * @author GuilhermeSantos001
 * @update 13/10/2021
 */

import CSVParser from '@/utils/csvParser'

/**
 * @description Schema da tabela: "Clientes"
 */
interface Clients {
    filial: string
    cod: string
    loja: string
    nome: string
    nreduz: string
}

interface ClientsResponse {
    id: string
    filial: string
    name: string
    fullname: string
    store: string
}

/**
 * @description Schema da tabela: "Clientes"
 */
interface Filial {
    cod: string
    nome: string
    cnpj: string
}

interface FilialResponse {
    id: string
    name: string
    cnpj: string
}

/**
 * @description Schema da tabela: "Tipos de Títulos"
 */
interface BillsType {
    filial: string
    chave: string
    descri: string
}

interface BillsTypeResponse {
    filial: string
    key: string
    description: string
}

/**
 * @description Schema da tabela: "Bancos"
 */
interface Banking {
    filial: string
    cod: string
    agencia: string
    dvage: string
    numcon: string
    dvcta: string
    nome: string
    nreduz: string
}

interface BankingResponse {
    id: string
    filial: string
    agency: string
    agencyDigit: string
    account: string
    accountDigit: string
    name: string
    fullname: string
}

/**
 * @description Schema da tabela: "Naturezas Bancarias"
 */
interface BankingNatures {
    filial: string
    codigo: string
    descric: string
    conta: string
}

interface BankingNaturesResponse {
    id: string
    filial: string
    description: string
    account: string
}

module.exports = {
    Query: {
        dataClients: async (parent: unknown, args: { filial: string, cache: boolean }) => {
            try {
                let
                    A1_filter: any = {
                        'filial': args.filial
                    };

                const
                    clients = await CSVParser.read<Clients>('clientes', "A1", A1_filter, args.cache),
                    response: ClientsResponse[] = [];

                const exec = () => new Promise(async (resolve, reject) => {
                    try {
                        for (const client of clients) {
                            response.push({
                                id: client.cod,
                                filial: client.filial,
                                name: client.nreduz,
                                fullname: client.nome,
                                store: client.loja
                            })
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
        },
        dataFilial: async (parent: unknown, args: { cache: boolean }) => {
            try {
                let
                    F_filter: any = {};

                const
                    branchs = await CSVParser.read<Filial>('filiais', "F", F_filter, args.cache),
                    response: FilialResponse[] = [];

                const exec = () => new Promise(async (resolve, reject) => {
                    try {
                        for (const branch of branchs) {
                            response.push({
                                id: branch.cod,
                                name: branch.nome,
                                cnpj: branch.cnpj
                            })
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
        },
        dataBillsType: async (parent: unknown, args: { cache: boolean }) => {
            try {
                let
                    X5_filter: any = {};

                const
                    billsType = await CSVParser.read<BillsType>('tipos_de_titulos', "X5", X5_filter, args.cache),
                    response: BillsTypeResponse[] = [];

                const exec = () => new Promise(async (resolve, reject) => {
                    try {
                        for (const bills of billsType) {
                            response.push({
                                filial: bills.filial,
                                description: bills.descri,
                                key: bills.chave
                            })
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
        },
        dataBanking: async (parent: unknown, args: { cache: boolean }) => {
            try {
                let
                    A6_filter: any = {};

                const
                    bankings = await CSVParser.read<Banking>('bancos', "A6", A6_filter, args.cache),
                    response: BankingResponse[] = [];

                const exec = () => new Promise(async (resolve, reject) => {
                    try {
                        for (const banking of bankings) {
                            response.push({
                                id: banking.cod,
                                filial: banking.filial,
                                agency: banking.agencia,
                                agencyDigit: banking.dvage,
                                account: banking.numcon,
                                accountDigit: banking.dvcta,
                                name: banking.nreduz,
                                fullname: banking.nome
                            })
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
        },
        dataBankingNatures: async (parent: unknown, args: { id: string, cache: boolean }) => {
            try {
                let
                    ED_filter: any = {};

                if (args.id)
                    ED_filter['codigo'] = args.id;

                const
                    bankingNatures = await CSVParser.read<BankingNatures>('naturezas', "ED", ED_filter, args.cache),
                    response: BankingNaturesResponse[] = [];

                const exec = () => new Promise(async (resolve, reject) => {
                    try {
                        for (const natures of bankingNatures) {
                            response.push({
                                id: natures.codigo,
                                filial: natures.filial,
                                description: natures.descric,
                                account: natures.conta
                            })
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