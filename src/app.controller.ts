import { Controller, Get } from '@nestjs/common';
import { AppService } from '@/app.service';

@Controller('app')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello() {
    return this.appService.getHello();
  }

  @Get('health')
  async health() {
    return true;
  }
}
