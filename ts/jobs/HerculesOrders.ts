import { JobContract, JobOptionsDefault } from '@/contracts/JobsContract';

import MailSend from '@/utils/mailsend';

const ConfirmMail: JobContract = {
  key: 'HERCULES_ORDERS',
  options: { ...JobOptionsDefault },
  async handle({ data }) {
    try {
      await MailSend.herculesOrders(data.email, data.username, data.title, data.description, data.link);
    } catch (error) {
      throw new Error(String(error));
    }
  }
}

export default ConfirmMail;