/**
 * @description Classe usada para controle de cache avançado
 * @author @GuilhermeSantos001
 * @update 14/09/2021
 * @version 1.0.0
 */

import { compressToBase64, decompressFromBase64 } from 'lz-string';

import db_caches from '@/src/db/caches';

interface ICache {
  key: string;
  value: string;
  expiry: Date;
};

export default class Cache {
  private id: string;
  private cache: ICache[] = [];
  private delay: any = false;
  private loading: boolean = true;

  constructor(id: string) {
    this.id = id;
    this.initialize();
  };

  /**
   * @description Carrega os dados armazenados no disco e inicia o update
   */
  async initialize(): Promise<void> {
    await this.load();
    this.update();
  };

  /**
   * @description Verifica se os dados do cache estão sendo carregados
   */
  isLoading(): boolean {
    return this.loading;
  };

  /**
   * @description Faz a compressão do valor
   */
  compress(value: any): string {
    return compressToBase64(JSON.stringify(value));
  };

  /**
   * @description Faz a descompressão do valor
   */
  decompress(value: string): any {
    return JSON.parse(decompressFromBase64(value) || "");
  };

  /**
   * @description Armazena em disco os dados do cache
   */
  async save(): Promise<boolean> {
    return await db_caches.define(this.id, this.cache);
  };

  /**
   * @description Carrega os dados no disco para o cache
   */
  async load(): Promise<void> {
    const data: any = await db_caches.get(this.id);

    if (data)
      Object.keys(data).forEach(key => {
        if (key !== 'id')
          this.cache.push(data[key]);
      });

    this.loading = false;
  };

  /**
   * @description Procura por um dado no cache
   */
  find(key: string): ICache | undefined {
    return this.cache.find(cache => cache.key === key);
  };

  /**
   * @description Executa a limpeza dos dados expirados do cache
   */
  async clear(): Promise<void> {
    this.cache = this.cache.filter(cache => {
      const
        now = new Date(),
        expiry = new Date(cache.expiry);

      if (now <= expiry) {
        return true;
      };

      return false;
    });

    await this.save();
  };

  /**
   * @description Processa a string de expiração do cache
   */
  parserExpiry(expiry: string): Date {
    let
      value = parseInt(expiry.replace(/[^0-9]/g, '').trim() || "0"),
      type = expiry.replace(String(value), '').toLowerCase().trim(),
      now = new Date();

    if (
      type === 'days'
      || type === 'day'
      || type === 'd'
    ) {
      now.setDate(now.getDate() + value);
    };

    if (
      type === 'weeks'
      || type === 'week'
      || type === 'w'
    ) {
      now.setDate(now.getDate() + (7 * value));
    };

    if (
      type === 'hours'
      || type === 'hour'
      || type === 'h'
    ) {
      now.setHours(now.getHours() + value);
    };

    if (
      type === 'minutes'
      || type === 'minute'
      || type === 'm'
    ) {
      now.setMinutes(now.getMinutes() + value);
    };

    if (
      type === 'seconds'
      || type === 'second'
      || type === 's'
    ) {
      now.setSeconds(now.getSeconds() + value);
    };

    return now;
  };

  /**
   * @description Adiciona um novo dado ao cache
   */
  set(key: string, value: any, expiry: string): boolean {
    if (typeof this.find(key) !== 'number') {
      this.cache.push({ key, value: this.compress(value), expiry: this.parserExpiry(expiry) });

      return true;
    };

    return false;
  };

  /**
   * @description Retorna um valor do cache
   */
  get(key: string): ICache | undefined {
    let
      index = this.cache.findIndex(cache => cache.key === key),
      item = this.cache.at(index);

    if (item)
      item.value = this.decompress(item.value);

    return item || undefined;
  };

  /**
   * @description Processamento dos dados do cache
   */
  async update(): Promise<void> {
    await this.clear();

    if (!this.delay) {
      this.delay = setInterval(this.update.bind(this), 1000);
    };
  };
};