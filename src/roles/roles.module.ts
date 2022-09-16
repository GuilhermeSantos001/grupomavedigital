import { Module } from '@nestjs/common';

import { RolesService } from '@/roles/roles.service';
import { RolesController } from '@/roles/roles.controller';
import { RolesParser } from '@/roles/parsers/roles.parser';

@Module({
  controllers: [RolesController],
  providers: [RolesService, RolesParser],
  exports: [RolesService],
})
export class RolesModule {}
