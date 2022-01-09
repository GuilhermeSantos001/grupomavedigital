/**
 * @class Manipulador dos privilégios do sistema
 * @author GuilhermeSantos001
 * @update 07/12/2021
 */

import { PrivilegesSystem } from '@/mongo/user-manager-mongo';

export default class Privilege {

    /**
     * * TAGS *
     */

    // ? TAG PADRÃO DO SISTEMA
    static TAG_COMMON(): string {
        return String('Common').trim().toLowerCase();
    }

    // ? TAG DOS ADMINISTRADORES
    static TAG_ADMIN(): string {
        return String('Administrador').trim().toLowerCase();
    }

    // ? TAG DOS MODERADORES
    static TAG_MODERATOR(): string {
        return String('Moderador').trim().toLowerCase();
    }

    // ? TAG DOS SUPERVISORES
    static TAG_SUPERVISOR(): string {
        return String('Supervisor').trim().toLowerCase();
    }

    // ? TAG DA DIRETORIA
    static TAG_DIRETORIA(): string {
        return String('Diretoria').trim().toLowerCase();
    }

    // ? TAG FINANCEIRA DO FATURAMENTO
    static TAG_FIN_FATURAMENTO(): string {
        return String('fin_faturamento').trim().toLowerCase();
    }

    // ? TAG FINANCEIRA DO ASSISTENTE
    static TAG_FIN_ASSISTENTE(): string {
        return String('fin_assistente').trim().toLowerCase();
    }

    // ? TAG FINANCEIRA DO GERENTE
    static TAG_FIN_GERENTE(): string {
        return String('fin_gerente').trim().toLowerCase();
    }

    // ? TAG RH/DP DO BENEFICIOS
    static TAG_RH_BENEFICIOS(): string {
        return String('rh_beneficios').trim().toLowerCase();
    }

    // ? TAG RH/DP DO ENCARREGADO
    static TAG_RH_ENCARREGADO(): string {
        return String('rh_encarregado').trim().toLowerCase();
    }

    // ? TAG RH/DP DO JURIDICO
    static TAG_RH_JURIDICO(): string {
        return String('rh_juridico').trim().toLowerCase();
    }

    // ? TAG RH/DP DO RECRUTAMENTO
    static TAG_RH_RECRUTAMENTO(): string {
        return String('rh_recrutamento').trim().toLowerCase();
    }

    // ? TAG RH/DP DO SESMET
    static TAG_RH_SESMET(): string {
        return String('rh_sesmet').trim().toLowerCase();
    }

    // ? TAG SUPRIMENTOS DO COMPRAS
    static TAG_SUP_COMPRAS(): string {
        return String('sup_compras').trim().toLowerCase();
    }

    // ? TAG SUPRIMENTOS DO ESTOQUE
    static TAG_SUP_ESTOQUE(): string {
        return String('sup_estoque').trim().toLowerCase();
    }

    // ? TAG SUPRIMENTOS DO ASSISTENTE
    static TAG_SUP_ASSISTENTE(): string {
        return String('sup_assistente').trim().toLowerCase();
    }

    // ? TAG SUPRIMENTOS DO GERENTE
    static TAG_SUP_GERENTE(): string {
        return String('sup_gerente').trim().toLowerCase();
    }

    // ? TAG COMERCIAL DO VENDAS
    static TAG_COM_VENDAS(): string {
        return String('com_vendas').trim().toLowerCase();
    }

    // ? TAG COMERCIAL DO ADM
    static TAG_COM_ADM(): string {
        return String('com_adm').trim().toLowerCase();
    }

    // ? TAG COMERCIAL DO GERENTE
    static TAG_COM_GERENTE(): string {
        return String('com_gerente').trim().toLowerCase();
    }

    // ? TAG COMERCIAL DO QUALIDADE
    static TAG_COM_QUALIDADE(): string {
        return String('com_qualidade').trim().toLowerCase();
    }

    // ? TAG OPERACIONAL DA MESA OPERACIONAL
    static TAG_OPE_MESA(): string {
        return String('ope_mesa').trim().toLowerCase();
    }

    // ? TAG OPERACIONAL DO COORDENADOR
    static TAG_OPE_COORDENADOR(): string {
        return String('ope_coordenador').trim().toLowerCase();
    }

    // ? TAG OPERACIONAL DO SUPERVISOR
    static TAG_OPE_SUPERVISOR(): string {
        return String('ope_supervisor').trim().toLowerCase();
    }

    // ? TAG OPERACIONAL DO GERENTE
    static TAG_OPE_GERENTE(): string {
        return String('ope_gerente').trim().toLowerCase();
    }

    // ? TAG MARKETING DA EQUIPE
    static TAG_MKT_GERAL(): string {
        return String('mkt_geral').trim().toLowerCase();
    }

    // ? TAG JURIDICO DA EQUIPE
    static TAG_JUR_ADVOGADO(): string {
        return String('jur_advogado').trim().toLowerCase();
    }

    // ? TAG CONTABILIDADE DA EQUIPE
    static TAG_CONT_CONTABIL(): string {
        return String('cont_contabil').trim().toLowerCase();
    }

    /**
     * * ALIAS *
     */

    // ? ALIAS DOS NÃO VINCULADOS
    static ALIAS_UNEXPECTED(): string {
        return String('Desconhecido(a)').trim();
    }

    // ? ALIAS DO SISTEMA
    static ALIAS_COMMON(): string {
        return String('Membro').trim();
    }

    // ? ALIAS DOS ADMINISTRADORES
    static ALIAS_ADMIN(): string {
        return String('Administrador(a)').trim();
    }

    // ? ALIAS DOS MODERADORES
    static ALIAS_MODERATOR(): string {
        return String('Moderador(a)').trim();
    }

    // ? ALIAS DOS SUPERVISORES
    static ALIAS_SUPERVISOR(): string {
        return String('Supervisor(a)').trim();
    }

    // ? ALIAS DOS DIRETORES
    static ALIAS_DIRETORIA(): string {
        return String('Diretor(a)').trim();
    }

    // ? ALIAS FINANCEIRO DO FATURAMENTO
    static ALIAS_FIN_FATURAMENTO(): string {
        return String('Faturista').trim();
    }

    // ? ALIAS FINANCEIRO DO ASSISTENTE
    static ALIAS_FIN_ASSISTENTE(): string {
        return String('Assistente Financeiro').trim();
    }

    // ? ALIAS FINANCEIRO DO GERENTE
    static ALIAS_FIN_GERENTE(): string {
        return String('Gerente Financeiro').trim();
    }

    // ? ALIAS RH/DP DO BENEFICIOS
    static ALIAS_RH_BENEFICIOS(): string {
        return String('Benéficos RH/DP').trim();
    }

    // ? ALIAS RH/DP DO ENCARREGADO
    static ALIAS_RH_ENCARREGADO(): string {
        return String('Encarregado RH/DP').trim();
    }

    // ? ALIAS RH/DP DO JURIDICO
    static ALIAS_RH_JURIDICO(): string {
        return String('Jurídico RH/DP').trim();
    }

    // ? ALIAS RH/DP DO RECRUTAMENTO
    static ALIAS_RH_RECRUTAMENTO(): string {
        return String('Recrutador(a)').trim();
    }

    // ? ALIAS RH/DP DO SESMET
    static ALIAS_RH_SESMET(): string {
        return String('Segurança do Trabalho').trim();
    }

    // ? ALIAS SUPRIMENTOS DO COMPRAS
    static ALIAS_SUP_COMPRAS(): string {
        return String('Comprador(a)').trim();
    }

    // ? ALIAS SUPRIMENTOS DO ESTOQUE
    static ALIAS_SUP_ESTOQUE(): string {
        return String('Estoquista').trim();
    }

    // ? ALIAS SUPRIMENTOS DO ASSISTENTE
    static ALIAS_SUP_ASSISTENTE(): string {
        return String('Assistente de Suprimentos').trim();
    }

    // ? ALIAS SUPRIMENTOS DO GERENTE
    static ALIAS_SUP_GERENTE(): string {
        return String('Gerente Suprimentos').trim();
    }

    // ? ALIAS COMERCIAL DO VENDAS
    static ALIAS_COM_VENDAS(): string {
        return String('Vendedor(a)').trim();
    }

    // ? ALIAS COMERCIAL DO ADM
    static ALIAS_COM_ADM(): string {
        return String('Administrativo Comercial').trim();
    }

    // ? ALIAS COMERCIAL DO GERENTE
    static ALIAS_COM_GERENTE(): string {
        return String('Gerente Comercial').trim();
    }

    // ? ALIAS COMERCIAL DO QUALIDADE
    static ALIAS_COM_QUALIDADE(): string {
        return String('Qualidade').trim();
    }

    // ? ALIAS OPERACIONAL DA MESA OPERACIONAL
    static ALIAS_OPE_MESA(): string {
        return String('Mesa Operacional').trim();
    }

    // ? ALIAS OPERACIONAL DO COORDENADOR
    static ALIAS_OPE_COORDENADOR(): string {
        return String('Coordenador(a)').trim();
    }

    // ? ALIAS OPERACIONAL DO SUPERVISOR
    static ALIAS_OPE_SUPERVISOR(): string {
        return String('Supervisor(a)').trim();
    }

    // ? ALIAS OPERACIONAL DO GERENTE
    static ALIAS_OPE_GERENTE(): string {
        return String('Gerente Operacional').trim();
    }

    // ? ALIAS MARKETING DA EQUIPE
    static ALIAS_MKT_GERAL(): string {
        return String('Marketing').trim();
    }

    // ? ALIAS JURIDICO DA EQUIPE
    static ALIAS_JUR_ADVOGADO(): string {
        return String('Advogado(a)').trim();
    }

    // ? ALIAS CONTABILIDADE DA EQUIPE
    static ALIAS_CONT_CONTABIL(): string {
        return String('Contador(a)').trim();
    }

    // ? VERIFICA SE O USUÁRIO TEM A PERMISSÃO INFORMADA
    static check(args: Array<string>, values: Array<PrivilegesSystem>): boolean {
        return args.filter(arg =>
            values.map(value => value.trim().toLowerCase()).indexOf(arg) !== -1
        ).length > 0;
    }

    // ? RETORNA O ALIAS DO PRIVILEGIO DO USUÁRIO
    static alias(value: PrivilegesSystem): string {
        switch (value.toLowerCase()) {
            case this.TAG_COMMON():
                return this.ALIAS_COMMON();
            case this.TAG_ADMIN():
                return this.ALIAS_ADMIN();
            case this.TAG_MODERATOR():
                return this.ALIAS_MODERATOR();
            case this.TAG_SUPERVISOR():
                return this.ALIAS_SUPERVISOR();
            case this.TAG_DIRETORIA():
                return this.ALIAS_DIRETORIA();
            case this.TAG_FIN_FATURAMENTO():
                return this.ALIAS_FIN_FATURAMENTO();
            case this.TAG_FIN_ASSISTENTE():
                return this.ALIAS_FIN_ASSISTENTE();
            case this.TAG_FIN_GERENTE():
                return this.ALIAS_FIN_GERENTE();
            case this.TAG_RH_BENEFICIOS():
                return this.ALIAS_RH_BENEFICIOS();
            case this.TAG_RH_ENCARREGADO():
                return this.ALIAS_RH_ENCARREGADO();
            case this.TAG_RH_JURIDICO():
                return this.ALIAS_RH_JURIDICO();
            case this.TAG_RH_RECRUTAMENTO():
                return this.ALIAS_RH_RECRUTAMENTO();
            case this.TAG_RH_SESMET():
                return this.ALIAS_RH_SESMET();
            case this.TAG_SUP_COMPRAS():
                return this.ALIAS_SUP_COMPRAS();
            case this.TAG_SUP_ESTOQUE():
                return this.ALIAS_SUP_ESTOQUE();
            case this.TAG_SUP_ASSISTENTE():
                return this.ALIAS_SUP_ASSISTENTE();
            case this.TAG_SUP_GERENTE():
                return this.ALIAS_SUP_GERENTE();
            case this.TAG_COM_VENDAS():
                return this.ALIAS_COM_VENDAS();
            case this.TAG_COM_ADM():
                return this.ALIAS_COM_ADM();
            case this.TAG_COM_GERENTE():
                return this.ALIAS_COM_GERENTE();
            case this.TAG_COM_QUALIDADE():
                return this.ALIAS_COM_QUALIDADE();
            case this.TAG_OPE_MESA():
                return this.ALIAS_OPE_MESA();
            case this.TAG_OPE_COORDENADOR():
                return this.ALIAS_OPE_COORDENADOR();
            case this.TAG_OPE_SUPERVISOR():
                return this.ALIAS_OPE_SUPERVISOR();
            case this.TAG_OPE_GERENTE():
                return this.ALIAS_OPE_GERENTE();
            case this.TAG_MKT_GERAL():
                return this.ALIAS_MKT_GERAL();
            case this.TAG_JUR_ADVOGADO():
                return this.ALIAS_JUR_ADVOGADO();
            case this.TAG_CONT_CONTABIL():
                return this.ALIAS_CONT_CONTABIL();
            default:
                return this.ALIAS_UNEXPECTED();
        }
    }

    // ? VERIFICA SE O USUÁRIO TEM A PERMISSÃO: PADRÃO
    static pattern(values: Array<PrivilegesSystem>): boolean {
        return this.check([this.TAG_COMMON()], values);
    }

    // ? VERIFICA SE O USUÁRIO TEM A PERMISSÃO: ADMINISTRADOR
    static admin(values: Array<PrivilegesSystem>): boolean {
        return this.check([this.TAG_ADMIN()], values);
    }

    // ? VERIFICA SE O USUÁRIO TEM A PERMISSÃO: EQUIPE DE MANUTENÇÃO DO SISTEMA
    static staff(values: Array<PrivilegesSystem>): boolean {
        return this.check([this.TAG_ADMIN(), this.TAG_MODERATOR()], values);
    }
}