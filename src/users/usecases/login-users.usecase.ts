import { UserRepository } from '@/users/repositories/users.repository';
import { UserDatabaseContract } from '@/users/contracts/users-database.contract';

import { GeoIP } from '@/core/types/geo-ip.type';
import { Locale } from '@/core/libs/i18n.lib';
import { JsonEx } from '@/core/libs/json-ex.lib';

export class LoginUser {
  static async execute(
    email: string,
    password: string,
    device_name: string,
    geo_ip: GeoIP,
    database: UserDatabaseContract,
    locale: Locale,
    jsonEx: JsonEx,
  ) {
    const repository = new UserRepository(database, locale, jsonEx);

    return await repository.login(email, password, device_name, geo_ip);
  }
}
