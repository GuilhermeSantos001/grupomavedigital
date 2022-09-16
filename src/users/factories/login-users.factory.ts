import { LoginUser } from '@/users/usecases/login-users.usecase';
import { UserPrismaDB } from '@/users/db/users-prisma.db';

import { GeoIP } from '@/core/types/geo-ip.type';

import { PrismaService } from '@/core/prisma/prisma.service';
import { Locale } from '@/core/libs/i18n.lib';
import { JsonEx } from '@/core/libs/json-ex.lib';

export class LoginUserFactory {
  static async run(
    email: string,
    password: string,
    device_name: string,
    geo_ip: GeoIP,
    prismaService: PrismaService,
    locale: Locale,
    jsonEx: JsonEx,
  ) {
    return await LoginUser.execute(
      email,
      password,
      device_name,
      geo_ip,
      new UserPrismaDB(prismaService),
      locale,
      jsonEx,
    );
  }
}
