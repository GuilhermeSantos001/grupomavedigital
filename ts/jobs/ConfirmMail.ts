import { JobContract, JobOptionsDefault } from '@/contracts/JobsContract';

import MailSend from '@/utils/mailsend';

const ConfirmMail: JobContract = {
  key: 'CONFIRM_MAIL',
  options: { ...JobOptionsDefault },
  async handle({ data }) {
    try {
      await MailSend.econfirm(data.email, data.username, data.token, data.temporarypass);
    } catch (error) {
      throw new Error(String(error));
    }
  }
}

export default ConfirmMail;