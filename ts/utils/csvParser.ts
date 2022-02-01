/* eslint-disable no-async-promise-executor */
/**
 * @description Leitor de CSV
 * @author GuilhermeSantos001
 * @update 31/01/2022
 */

import csv from 'csv-parser';
import { createReadStream } from 'fs';
import { compressToBase64 } from 'lz-string'

import { RedisClient } from '@/lib/RedisClient';
import { localPath } from '@/utils/localpath'

import Moment from '@/utils/moment';

export default class CSVParser {
  static readonly db: number = 6;
  static readonly expiry: number = 7; // Cache expira em 7 dias
  static readonly redis: RedisClient = new RedisClient(CSVParser.db);

  /**
   * @description Efetua a limpeza do cache
   */
  static async flush(): Promise<void> {
    try {
      return await this.redis.flush();
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : JSON.stringify(error));
    }
  }

  /**
   * @description Verifica se o cache está expirado
   */
  static isExpiry(filename: string): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        const value = await this.redis.get(`db_${filename}_expiry`);

        if (typeof value === 'string') {
          const
            now = new Date(),
            expiry = new Date(JSON.parse(value));

          if (now > expiry) {
            await this.redis.delete(`db_${filename}_expiry`);

            return resolve(true);
          }
        }

        resolve(false);
      } catch (error) {
        reject(error);
      }
    });
  }


  /**
   * @description Defini a data de expiração do cache
   */
  static setExpiry(filename: string) {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const now = new Date();

        now.setDate(now.getDate() + this.expiry);

        await this.redis.set(`db_${filename}_expiry`, JSON.stringify(now));

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * @description Retorna os valores em cache
   */
  static get<Type>(filename: string): Promise<Type[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const values = await this.redis.get(`db_${filename}`);

        if (typeof values === 'string') {
          return resolve(JSON.parse(values));
        }

        return resolve([]);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * @description Salva os valores do cache
   */
  static save(filename: string, data: string) {
    return new Promise<void>(async (resolve, reject) => {
      try {
        await this.redis.set(`db_${filename}`, data);

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * @description
   */
  static _read<Type>(filename: string, headerPreffix: string, filter: any = {}): Promise<Type[]> {
    const
      results: any = [];

    return new Promise((resolve, reject) => {
      createReadStream(localPath(`database/${filename}.csv`))
        .setEncoding('utf8')
        .pipe(csv({
          separator: ";",
          mapHeaders: ({ header }) =>
            String(header).replace(String(`${headerPreffix}_`).toUpperCase(), '').trim().toLowerCase()
          ,
          mapValues: ({ header, index, value }) => {
            let
              filterSuccess = false,
              inPeriod = false;

            value = String(value).replace(/�/g, '').trim();

            if (filter[header]) {
              if (filter[header].slice(0, 4).indexOf('time') !== -1) {
                if (inPeriod)
                  return value;

                const time = filter[header].replace('time:', '').trim().split(','),
                  startDate = Moment.formatDate(time[0]),
                  endDate = Moment.formatDate(time[1]),
                  date = Moment.formatDate(value);

                if (
                  date >= startDate && date <= endDate
                ) {
                  inPeriod = true;
                  filterSuccess = true;
                  return value;
                }

                return 'null';
              }

              if (filter[header].slice(0, 13).indexOf('length-bigger') !== -1) {
                if (value.length > Number(filter[header].replace(/[^0-9]+/g, ""))) {
                  filterSuccess = true;
                  return value;
                }

                return 'null';
              }

              if (!filterSuccess && filter[header] !== value) {
                return 'null';
              }
            }

            return value;
          }
        }))
        .on('data', (data) => {
          if (!Object.values(data).includes('null'))
            results.push(data)
        })
        .on('end', async () => {
          const cacheName = compressToBase64(`${filename}_${JSON.stringify(filter)}`);

          if (results.length > 0) {
            await CSVParser.setExpiry(cacheName);
            await CSVParser.save(cacheName, JSON.stringify(results));
          }

          return resolve(results);
        })
        .on('error', (error) => reject(error))
    });
  }

  /**
   * @description Executa a leitura do arquivo CSV
   */
  static async read<Type>(filename: string, headerPreffix: string, filter: any = {}, cache = true): Promise<Type[]> {
    try {
      if (cache) {
        const cacheName = compressToBase64(`${filename}_${JSON.stringify(filter)}`);

        const values = await this.get<Type>(cacheName);

        if (await this.isExpiry(cacheName)) {
          return await CSVParser._read<Type>(filename, headerPreffix, filter);
        } else {
          return values;
        }
      } else {
        return await CSVParser._read<Type>(filename, headerPreffix, filter);
      }
    } catch {
      return await CSVParser._read<Type>(filename, headerPreffix, filter);
    }
  }
}