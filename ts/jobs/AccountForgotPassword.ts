import { JobContract, JobOptionsDefault } from '@/contracts/JobsContract';

import MailSend from '@/utils/mailsend';

const ConfirmMail: JobContract = {
  key: 'ACCOUNT_FORGOT_PASSWORD',
  options: { ...JobOptionsDefault },
  async handle({ data }) {
    try {
      await MailSend.accountForgotPassword(data.email, data.username, data.signature, data.token);
    } catch (error) {
      throw new Error(String(error));
    }
  }
}

export default ConfirmMail;