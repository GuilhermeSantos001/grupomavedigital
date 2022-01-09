/**
 * @description Modelo dos projetos
 * @author GuilhermeSantos001
 * @update 31/08/2021
 * @version 1.0.0
 */

import {
    Model,
    DataTypes,
    Optional,
} from "sequelize";

import connection from '@/database/index';

const sequelize = connection;

/**
 * @description Atributos dos projetos
 */
interface ProjectAttributes {
    id: number;
    ownerId: number;
    name: string;
}

/**
 * @description Atributos opcionais dos projetos
 * Alguns atributos são opcionais para chamadas como por exemplo:
 * 'Project.build' e 'Project.create'
 */
type ProjectCreationAttributes = Optional<ProjectAttributes, "id">

/**
 * @description Classe dos projetos
 */
class Project extends Model<ProjectAttributes, ProjectCreationAttributes> implements ProjectAttributes {
    public id!: number;
    public ownerId!: number;
    public name!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

/**
 * @description Inicialização do modelo representado na tabela, com atributos e opções.
 */
Project.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        ownerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        name: {
            type: new DataTypes.STRING(128),
            allowNull: false,
        },
    },
    {
        tableName: "projects",
        sequelize,
    }
);

export default Project;