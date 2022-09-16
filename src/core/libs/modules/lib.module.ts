import { Global, Module } from '@nestjs/common';
import { JsonExService } from '@/core/libs/modules/json-ex.service';

@Global()
@Module({
  providers: [JsonExService],
  exports: [JsonExService],
})
export class LibModule {}
