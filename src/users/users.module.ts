import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { HttpModule } from '@nestjs/axios';

import { EmailJob } from '@/users/jobs/email.job';
import EmailNameJob from '@/users/constants/email-name-job.constant';

import { CoreModule } from '@/core/core.module';

import { UsersService } from '@/users/users.service';
import { CustomersController } from '@/users/users.controller';
import { UsersParser } from '@/users/parsers/users.parser';

@Module({
  imports: [
    BullModule.registerQueue({
      name: EmailNameJob,
    }),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    CoreModule,
  ],
  controllers: [CustomersController],
  providers: [EmailJob, UsersService, UsersParser],
  exports: [UsersService],
})
export class UsersModule {}
