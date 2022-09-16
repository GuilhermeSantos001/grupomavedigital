import { Global, Module } from '@nestjs/common';
import { LocaleService } from '@/core/i18n/i18n.service';

@Global()
@Module({
  providers: [LocaleService],
  exports: [LocaleService],
})
export class LocaleModule {}
