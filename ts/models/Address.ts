/**
 * @description Modelo dos endereços
 * @author @GuilhermeSantos001
 * @update 31/08/2021
 * @version 1.0.0
 */

import {
    Model,
    DataTypes
} from "sequelize";

import connection from '@/database/index';

const sequelize = connection;

/**
 * @description Atributos dos endereços
 */
interface AddressAttributes {
    userId: number;
    address: string;
}

/**
 * @description Classe dos endereços
 */
class Address extends Model<AddressAttributes> implements AddressAttributes {
    public userId!: number;
    public address!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

/**
 * @description Inicialização do modelo representado na tabela, com atributos e opções.
 */
Address.init(
    {
        userId: {
            type: DataTypes.INTEGER,
        },
        address: {
            type: new DataTypes.STRING(128),
            allowNull: false,
        },
    },
    {
        tableName: "address",
        sequelize,
    }
);

export default Address;