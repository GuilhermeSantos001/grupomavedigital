import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class HelloWorld {
  private readonly logger = new Logger(HelloWorld.name);

  private async handle() {
    this.logger.debug(`Cron job running. Hello World!`);
  }

  @Cron('0 */5 * * * *') // * Every 5 minutes
  async handleCron() {
    this.logger.debug('Cron job started');

    await this.handle();
  }
}
