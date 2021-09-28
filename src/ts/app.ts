/**
 * @description Classe global da aplicação
 * @author @GuilhermeSantos001
 * @update 04/08/2021
 * @version 1.0.0
 */

/**
 * @description Banco de Dados
 */
import variables from "@/src/db/variables";

/**
 * @description Utilidades
 */
import loading from '@/src/utils/loading';
import alerting from '@/src/utils/alerting';

export default class APP {
    constructor() { };

    /**
     * @description Armazena a versão atual do framework
     */
    static readonly version: string = '1.0.0';

    /**
     * @description Armazena a licença atual do framework
     */
    static readonly license: string = 'GPL-3.0';

    /**
     * @description Armazena o fundador do framework
     */
    static readonly author: string = 'GuilhermeSantos001 <luizgp120@hotmail.com>';

    /**
     * @description Armazena o nome do framework
     */
    static readonly fullname: string = 'Rocket.js';

    /**
     * @description Armazena o valor padrão de delay
     */
    static readonly default_delay: number = 3600;

    /**
     * @description Armazena o valor para 1 segundo em ms
     */
    static readonly one_second_delay: number = 1000;

    /**
     * @description Armazena o valor da url principal
     */
    static readonly baseurl: string = String(location.origin);

    /**
     * @description Armazena o valor da url do graphql
     */
    static readonly graphqlUrl: string = "__GULP__VARIABLE__GRAPHQL_URL__";

    /**
     * @description Bloqueia o fechamento da pagina antes de confirmar
     */
    block_close_page(): void {
        window.onbeforeunload = function (e) {
            // Cancelar o evento
            e.preventDefault(); // Se você impedir o comportamento padrão no Mozilla Firefox, o prompt será sempre mostrado
            // O Chrome requer que returnValue seja definido
            e.returnValue = '';
        };
    };

    /**
     * @description Adiciona/Atualiza uma variável
     */
    static variable_define(name: string, value: any): Promise<boolean> {
        return variables.define(name, value);
    };

    /**
     * @description Retorna o valor da variável
     */
    static variable_get(name: string): Promise<Object> {
        return variables.get(name);
    };

    /**
     * @description Remove uma variável
     */
    static variables_remove(name: string): Promise<boolean> {
        return variables.remove(name);
    };

    /**
     * @description Inicia a execução do loading
     */
    static start_loading(): void {
        return loading.start();
    };

    /**
     * @description Para a execução do loading
     */
    static stop_loading(): void {
        return loading.stop();
    };

    /**
     * @description Cria um novo alerta
     */
    static alert_create(message: string, delay: number = 2500): void {
        return alerting.create(message, delay);
    };

    /**
     * @description Abre o gerenciador de email do computador do usuário
     * com o email de destino já definido
     */
    static external_mail_open(email: string) {
        return window.open(`mailto:${email}`, '_blank');
    };
};