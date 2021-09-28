/**
 * @description Gerenciador de alertas
 * @author @GuilhermeSantos001
 * @update 14/09/2021
 * @version 1.0.0
 */

import $ from 'jquery';

interface IAlert {
  message: string;
  delay: number;
};

class Alert {
  private show: boolean = false;
  private delay: any = false;
  private timeout: number = 1500;
  private cache: IAlert[] = [];
  private noCache: boolean = false;

  constructor() { };

  /**
   * @description Verifica se o alerta está sendo exibido
   */
  isShowing(): boolean {
    return this.show;
  };

  /**
   * @description Cria um novo alerta
   */
  create(message: string, delay: number): void {
    if (!this.noCache) {
      this.cache.push({ message, delay });
    } else {
      this.noCache = false;
    };

    if (!this.isShowing()) {
      this.show = true;
      $('body')
        .append(`
        <rocket-alerting data-message="${message}" data-delay="${delay}">
        </rocket-alerting>
        `);
    };

    if (!this.delay) {
      this.delay = setTimeout(() => {
        clearTimeout(this.delay),
          this.delay = false,
          this.show = false;

        this.cache.shift();

        let data: IAlert = {
          message: this.cache.at(0)?.message || "",
          delay: this.cache.at(0)?.delay || 0
        };

        if (data.message.length > 0 && data.delay > 0) {
          this.noCache = true;
          this.create(data.message, data.delay);
        };
      }, delay + this.timeout);
    };
  };
};

const alerting = new Alert();

export default alerting;