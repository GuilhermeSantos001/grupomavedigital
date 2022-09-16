import { SessionValidateUser } from '@/users/usecases/session-validate-users.usecase';
import { UserPrismaDB } from '@/users/db/users-prisma.db';

import { GeoIP } from '@/core/types/geo-ip.type';

import { PrismaService } from '@/core/prisma/prisma.service';
import { Locale } from '@/core/libs/i18n.lib';
import { JsonEx } from '@/core/libs/json-ex.lib';

export class SessionValidateUserFactory {
  static async run(
    id: string,
    token_value: string,
    token_signature: string,
    token_revalidate_value: string,
    token_revalidate_signature: string,
    device_name: string,
    geo_ip: GeoIP,
    prismaService: PrismaService,
    locale: Locale,
    jsonEx: JsonEx,
  ) {
    return await SessionValidateUser.execute(
      id,
      token_value,
      token_signature,
      token_revalidate_value,
      token_revalidate_signature,
      device_name,
      geo_ip,
      new UserPrismaDB(prismaService),
      locale,
      jsonEx,
    );
  }
}
