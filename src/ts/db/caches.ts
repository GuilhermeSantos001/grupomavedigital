/**
 * @description Banco de dados dos caches utilizados no sistema
 * @author @GuilhermeSantos001
 * @update 14/09/2021
 * @version 1.0.0
 */

import CoreDB from '@/src/db/core';

class Caches extends CoreDB {
  constructor() {
    super('caches', 1);
  };

  /**
   * @description Adiciona/Atualiza um cache
   */
  async define(name: string, value: Object): Promise<boolean> {
    if (!await this.get(name)) {
      return this.store_add('cache', name, value);
    } else {
      return this.store_update('cache', name, value);
    };
  };

  /**
   * @description Remove um cache
   */
  remove(name: string): Promise<boolean> {
    return this.store_remove('cache', name);
  };

  /**
   * @description Retorna o valor do cache
   */
  get(name: string): Promise<Object> {
    return this.store_get('cache', name);
  };
};

const caches = new Caches();

export default caches;