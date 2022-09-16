import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { HelloWorld } from '@/schedules/helloWorld';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [HelloWorld],
})
export class SchedulesModule {}
