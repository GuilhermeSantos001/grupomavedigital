/**
 * @description Retorna a URL do aplicativo
 * @author @GuilhermeSantos001
 * @update 17/07/2021
 * @version 1.0.0
 */

const BASE_URL = process.env.NODE_ENV !== "development" ? 'https://grupomavedigital.com.br' : `http://${process.env.APP_HOST}:${process.env.APP_PORT}`;

export default BASE_URL;