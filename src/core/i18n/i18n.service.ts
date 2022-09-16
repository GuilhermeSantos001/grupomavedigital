import { Injectable } from '@nestjs/common';

import { Locale } from '@/core/libs/i18n.lib';

@Injectable()
export class LocaleService {
  private readonly locale: Locale;

  constructor() {
    this.locale = new Locale();
  }

  get method() {
    return this.locale;
  }

  setLocale(locale: string) {
    return this.locale.setLocale(locale);
  }

  removeLocale(locale: string) {
    return this.locale.removeLocale(locale);
  }

  setPath(path: string) {
    return this.locale.setPath(path);
  }

  translate(phrase: string, ...params: string[]) {
    return this.locale.translate(phrase, ...params);
  }
}
