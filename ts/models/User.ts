/**
 * @description Modelo dos usuários
 * @author @GuilhermeSantos001
 * @update 31/08/2021
 * @version 1.0.0
 */

import {
    Model,
    DataTypes,
    HasManyGetAssociationsMixin,
    HasManyAddAssociationMixin,
    HasManyHasAssociationMixin,
    Association,
    HasManyCountAssociationsMixin,
    HasManyCreateAssociationMixin,
    Optional,
} from "sequelize";

import connection from '@/database/index';

const sequelize = connection;

/**
 * @description Importação dos modelos
 */
import Project from '@/models/Project';
import Address from '@/models/Address';

/**
 * @description Atributos dos usuários
 */
interface UserAttributes {
    id: number;
    name: string;
    preferredName: string | null;
    email: string;
}

/**
 * @description Atributos opcionais dos usuários
 * Alguns atributos são opcionais para chamadas como por exemplo:
 * 'User.build' e 'User.create'
 */
type UserCreationAttributes = Optional<UserAttributes, "id">

/**
 * @description Classe dos usuários
 */
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: number; // Observe que a `asserção nula` `!` É necessária no modo estrito.
    public name!: string;
    public preferredName!: string | null; // para campos anuláveis
    public email!: string;

    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    /**
     * Uma vez que o TS não pode determinar a associação do modelo em tempo de compilação
     * temos que declará-los aqui puramente virtualmente
     * eles não existirão até que `Model.init` seja chamado.
     */
    public getProjects!: HasManyGetAssociationsMixin<Project>; // Observe as asserções nulas `!`
    public addProject!: HasManyAddAssociationMixin<Project, number>;
    public hasProject!: HasManyHasAssociationMixin<Project, number>;
    public countProjects!: HasManyCountAssociationsMixin;
    public createProject!: HasManyCreateAssociationMixin<Project>;

    // Você também pode pré-declarar possíveis inclusões, que só serão preenchidas se você incluir ativamente uma relação.
    public readonly projects?: Project[]; // Observe que isso é opcional, pois só é preenchido quando solicitado explicitamente no código
    public static associations: {
        projects: Association<User, Project>;
    };
}

/**
 * @description Inicialização do modelo representado na tabela, com atributos e opções.
 */
User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        name: {
            type: new DataTypes.STRING(128),
            allowNull: false,
        },
        preferredName: {
            type: new DataTypes.STRING(128),
            allowNull: true,
        },
        email: {
            type: new DataTypes.STRING(128),
            allowNull: false
        }
    },
    {
        tableName: "users",
        sequelize,
    }
);

/**
 * @description Aqui, associamos o que realmente preenche os métodos estáticos de `associação`
 * pré-declarados e outros.
 */
User.hasMany(Project, {
    sourceKey: "id", // Chave Primaria
    foreignKey: "ownerId", // Chave estrangeira
    as: "projects", // isso determina o nome em `associações`!
});

/**
 * @description Cria uma associação entre este (a origem) e o destino fornecido.
 * A chave estrangeira é adicionada ao destino.
 */
User.hasOne(Address, { sourceKey: "id" });

/**
 * @description Cria uma associação entre este (a origem) e o destino fornecido.
 * A chave estrangeira é adicionada à fonte.
 */
Address.belongsTo(User, { targetKey: "id" });

export default User;