/**
 * @description Classe usada para interação com LocalStorage
 * @author @GuilhermeSantos001
 * @update 14/09/2021
 * @version 1.0.0
 */

export default class LocalStorageEx {
  private readonly db: string;
  private readonly version: number;
  private data: any = {};

  constructor(db_name: string = 'default', version: number = 1) {
    this.db = db_name;
    this.version = version;
    this.load();
  };

  /**
   * @description Armazena os dados no disco
   */
  save() {
    return localStorage.setItem(`database_${this.db}_version_${this.version}`, JSON.stringify(this.data));
  };

  /**
   * @description Carrega os dados do disco
   */
  load() {
    this.data = JSON.parse(localStorage.getItem(`database_${this.db}_version_${this.version}`) || "{}");
  };

  /**
   * @description Limpa os dados do disco
   */
  clear() {
    this.data = {};

    return localStorage.clear();
  };

  /**
   * @description Adiciona um novo valor há store
   */
  storeAdd(storeName: string = 'main', keyPath: string = 'id', data: any = { id: '0001' }) {
    if (!this.data[storeName])
      this
        .data[storeName] = [];

    let obj: any = {};
    obj[keyPath] = undefined;

    this
      .data[storeName]
      .push(
        Object
          .assign(obj, data)
      );

    this.save();

    return true;
  };

  /**
   * @description Atualiza o novo valor na store
   */
  storeUpdate(storeName: string = 'main', keyPath: string = 'id', key: string = '0001', newData: object = {}) {
    if (this.data[storeName]) {
      this
        .data[storeName]
        .filter((data: any) => {
          if (data[keyPath] === key)
            data = newData;
        });

      this.save();

      return true;
    };

    return false;
  };

  /**
   * @description Retorna o novo valor da store
   */
  storeGet(storeName: string = 'main', keyPath: string = 'id', key: string = '0001') {
    if (this.data[storeName]) {
      return this.data[storeName].filter((data: any) => data[keyPath] === key).at(0) || {};
    };

    return {};
  };

  /**
   * @description Retorna todos os valores da store
   */
  storeGetAll(storeName: string = 'main', keyPath: string = 'id') {
    if (this.data[storeName]) {
      return this.data[storeName].filter((data: any) => data[keyPath] !== undefined) || [];
    };

    return [];
  };

  /**
   * @description Remove o valor da store
   */
  storeRemove(storeName: string = 'main', keyPath: string = 'id', key: string = '0001') {
    if (this.data[storeName]) {
      this.data[storeName] = this.data[storeName].filter((data: any) => data[keyPath] !== key);

      this.save();

      return true;
    };

    return false;
  };

  /**
   * @description Limpa os valores da store
   */
  storeClear(storeName: string = 'main') {
    if (this.data[storeName]) {
      this.data[storeName] = undefined;

      this.save();

      return true;
    };

    return false;
  };
};