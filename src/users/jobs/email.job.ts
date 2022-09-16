import { Logger } from '@nestjs/common';
import { Process, Processor, OnQueueError } from '@nestjs/bull';
import { Job } from 'bull';

import EmailNameJob from '@/users/constants/email-name-job.constant';
import AccountActivateProcess from '@/users/jobs/constants/email/account-activate-process.constant';
import { AccountActivateType } from '@/users/jobs/types/email/account-activate.type';

import { EmailSend } from '@/core/utils/email-send.util';

@Processor(EmailNameJob)
export class EmailJob {
  private readonly logger = new Logger(EmailJob.name);

  @OnQueueError()
  onError(err: Error) {
    throw new Error(`Queue error: ${err.message}`);
  }

  @Process(AccountActivateProcess)
  async handleAccountActivate(job: Job<AccountActivateType>) {
    this.logger.debug(
      `Email for activation of account(${job.data.username}) sent...`,
    );

    return await EmailSend.AccountEmailConfirm(
      job.data.email,
      job.data.username,
      job.data.token,
      job.data.temporarypass,
    );
  }
}
