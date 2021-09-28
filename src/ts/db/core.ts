/**
 * @description Estrutura de base para interação com o banco de dados
 * @author @GuilhermeSantos001
 * @update 14/09/2021
 * @version 1.0.0
 */

import { compressToBase64, decompressFromBase64 } from 'lz-string';

import IndexedDB from '@/src/core/indexedDB';
import LocalStorageEx from '@/src/core/localStorageEx';

export default class Core_Database {
  private db: IndexedDB | LocalStorageEx;
  private name: string = 'app_gmd';
  private version: number = 1;

  constructor(name: string, version: number) {
    this.name = name;
    this.version = version;

    // Verifica se o indexedDB é suportado pelo navegador
    try {
      this.db = new IndexedDB(this.name, this.version);
    } catch {
      this.db = new LocalStorageEx(this.name, this.version);
    };
  };

  /**
   * @description Faz a compressão da variável
   */
  compress(value: any): string {
    return compressToBase64(JSON.stringify(value) || "");
  };

  /**
   * @description Faz a descompressão da variavel
   */
  decompress(value: string): Object | String {
    return JSON.parse(decompressFromBase64(value) || "");
  };

  /**
   * @description Formata os valores para o armazenamento
   */
  format_value(name: string, value: any): Object {
    let obj: Object = {};

    if (typeof value !== 'object') {
      obj = {
        id: name,
        value: this.compress(value),
        compress: true
      };
    } else {
      obj = {
        ...value,
        id: name,
        compress: false
      };
    };

    return obj;
  };

  /**
   * @description Adiciona um valor há store
   */
  async store_add(store: string, name: string, value: any): Promise<boolean> {
    try {
      return await this.db.storeAdd(store, 'id', this.format_value(name, value));
    } catch (error: any) {
      throw new Error(error);
    };
  };

  /**
   * @description Atualiza um valor da store
   */
  async store_update(store: string, name: string, newValue: any): Promise<boolean> {
    try {
      return await this.db.storeUpdate(store, 'id', name, this.format_value(name, newValue));
    } catch (error: any) {
      throw new Error(error);
    };
  };

  /**
   * @description Retorna um valor da store
   */
  async store_get(store: string, name: string): Promise<object> {
    try {
      const variable: any = await this.db.storeGet(store, 'id', name);

      if (
        variable.compress &&
        typeof variable.value === 'string'
      )
        variable.value = this.decompress(variable.value);

      delete variable.compress;

      return Object.keys(variable).length <= 0 ? undefined : variable;
    } catch (error: any) {
      throw new Error(error);
    };
  };

  /**
   * @description Retorna todos os valores da store
   */
  async store_get_all(store: string): Promise<Array<object>> {
    try {
      let variables: Array<any> = await this.db.storeGetAll(store, 'id');

      return variables.map(variable => {
        if (typeof variable.value === 'string')
          variable.value = this.decompress(variable.value);

        return variable;
      });
    } catch (error: any) {
      throw new Error(error);
    };
  };

  /**
   * @description Remove um valor da store
   */
  async store_remove(store: string, name: string): Promise<boolean> {
    try {
      return await this.db.storeRemove(store, 'id', name);
    } catch (error: any) {
      throw new Error(error);
    };
  };

  /**
   * @description Limpa toda a data da store
   */
  async store_clear(store: string): Promise<boolean> {
    try {
      return await this.db.storeClear(store, 'id');
    } catch (error: any) {
      throw new Error(error);
    };
  };
};