/**
 * @description Leitor de CSV
 * @author GuilhermeSantos001
 * @update 12/10/2021
 */

import csv from 'csv-parser';
import { createReadStream } from 'fs';
import { compressToBase64 } from 'lz-string'

import REDIS from '@/core/redis';
import { localPath } from '@/utils/localpath'

import Moment from '@/utils/moment';

export default class CSVParser {
  static readonly db: number = 6;
  static readonly expiry: number = 7; // Cache expira em 7 dias

  /**
   * @description Efetua a limpeza do cache
   */
  static async flush(): Promise<void> {
    try {
      const client = new REDIS(this.db);

      await client.connect();
      await client.flush();

      client.disconnect();
    } catch (error) {
      throw new Error(JSON.stringify(error));
    }
  }

  /**
   * @description Verifica se o cache está expirado
   */
  static isExpiry(filename: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const client = new REDIS(this.db);

      client.get(`db_${filename}_expiry`, async (response: boolean, values: any[]) => {
        client.disconnect();

        if (!response)
          return reject();

        if (values.filter(value => value !== '').length > 0) {
          const
            now = new Date(),
            expiry = new Date(values[0]);

          if (now > expiry) {
            await this.flush();
            resolve(true);
          }
        }

        resolve(false);
      });
    });
  }


  /**
   * @description Defini a data de expiração do cache
   */
  static setExpiry(filename: string) {
    return new Promise<void>((resolve, reject) => {
      const
        client = new REDIS(this.db),
        now = new Date();

      now.setDate(now.getDate() + this.expiry);

      client.set(`db_${filename}_expiry`, now.toISOString(), (response: boolean) => {
        client.disconnect();

        if (!response) {
          return reject();
        }

        return resolve();
      });
    });
  }

  /**
   * @description Retorna os valores em cache
   */
  static get<Type>(filename: string): Promise<Type[]> {
    return new Promise((resolve, reject) => {
      const client = new REDIS(this.db);

      client.get(`db_${filename}`, (response: boolean, values: any[]) => {
        client.disconnect();

        if (!response)
          return reject();

        if (values.filter(value => value !== '').length > 0)
          resolve(JSON.parse(values[0]));

        reject();
      });
    });
  }

  /**
   * @description Salva os valores do cache
   */
  static save(filename: string, data: string) {
    return new Promise<void>((resolve, reject) => {
      const client = new REDIS(this.db);

      client.set(`db_${filename}`, data, (response: boolean) => {
        client.disconnect();

        if (!response) {
          return reject();
        }

        return resolve();
      });
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