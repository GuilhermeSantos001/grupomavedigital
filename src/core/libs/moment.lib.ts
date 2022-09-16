import moment from 'moment';

declare interface Options {
  layout?: string;
  exclude?: string;
}

export class Moment {
  constructor() {
    throw new Error('this is static class');
  }

  /**
   * @description Formats a date for the system locality with the options of layout and deleting some parts
   */
  static format(options?: Options): string {
    if (!options?.exclude) return moment().format(options?.layout);
    else
      return moment().format(options?.layout).replace(options.exclude, ' || ');
  }

  /**
   * @description Formats the date to the standard Year, Month, Day
   */
  static formatDate(date: string) {
    const year = date.substring(0, 4),
      month = date.substring(4, 6),
      day = date.substring(6, 8);

    const result = moment(`${year}-${month}-${day}`, 'YYYY-MM-DD');

    if (!result.isValid()) return moment();

    return result;
  }
}
