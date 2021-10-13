/**
 * @description Rotas dos dados
 * @author @GuilhermeSantos001
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
        }
    }
}