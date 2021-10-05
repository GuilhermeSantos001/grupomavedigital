/**
 * @description Retorna a URL do aplicativo
 * @author @GuilhermeSantos001
 * @update 04/10/2021
 */

const BASE_URL = process.env.NODE_ENV !== "development" ? 'https://grupomavedigital.com.br' : `http://${process.env.FRONTEND_HOST}:${process.env.FRONTEND_PORT}`;

export default BASE_URL;