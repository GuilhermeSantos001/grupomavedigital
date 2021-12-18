import { Sequelize } from 'sequelize';
import config from '@/config/postgresql.config';

const connection = new Sequelize(config);

export default connection;