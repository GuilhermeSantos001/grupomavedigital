import { JobContract, JobOptionsDefault } from '@/contracts/JobsContract';

import MailSend from '@/utils/mailsend';

const ConfirmMail: JobContract = {
  key: 'ACCOUNT_RETRIEVE',
  options: { ...JobOptionsDefault },
  async handle({ data }) {
    try {
      await MailSend.accountRetrieve(data.email, data.username, data.token);
    } catch (error) {
      throw new Error(String(error));
    }
  }
}

export default ConfirmMail;