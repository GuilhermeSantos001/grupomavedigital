import { JobContract,JobOptionsDefault } from '@/contracts/JobsContract';

import MailSend from '@/utils/mailsend';

const ConfirmMail: JobContract = {
  key: 'SESSION_NEW_ACCESS',
  options: { ...JobOptionsDefault },
  async handle({ data }) {
    try {
      await MailSend.sessionNewAccess(data.email, data.username, data.navigator);
    } catch (error) {
      throw new Error(String(error));
    }
  }
}

export default ConfirmMail;