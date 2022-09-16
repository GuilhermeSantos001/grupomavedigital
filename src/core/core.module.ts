import { Module } from '@nestjs/common';

import { CoreService } from '@/core/core.service';
import { PrismaModule } from '@/core/prisma/prisma.module';
import { LocaleModule } from '@/core/i18n/i18n.module';
import { LibModule } from '@/core/libs/modules/lib.module';

@Module({
  imports: [PrismaModule, LocaleModule, LibModule],
  providers: [CoreService],
  exports: [CoreService, PrismaModule, LocaleModule, LibModule],
})
export class CoreModule {}
