import { Options } from 'sequelize';

const options: Options = {
    dialect: 'postgres',
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "FYvLK18GlMZCeofKt",
    database: "grupomavedigital_homolog",
    define: {
        timestamps: true,
        underscored: true
    }
};

export default options;