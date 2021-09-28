/**
 * @description Banco de dados das variáveis utilizadas no sistema
 * @author @GuilhermeSantos001
 * @update 13/09/2021
 * @version 1.0.0
 */

import CoreDB from '@/src/db/core';

class Variables extends CoreDB {
  constructor() {
    super('variables', 1);
  };

  /**
   * @description Adiciona/Atualiza uma variável
   */
  async define(name: string, value: Object): Promise<boolean> {
    if (!await this.get(name)) {
      return this.store_add('variable', name, value);
    } else {
      return this.store_update('variable', name, value);
    };
  };

  /**
   * @description Remove uma variável
   */
  remove(name: string): Promise<boolean> {
    return this.store_remove('variable', name);
  };

  /**
   * @description Retorna o valor da variável
   */
  get(name: string): Promise<Object> {
    return this.store_get('variable', name);
  };
};

const variables = new Variables();

export default variables;