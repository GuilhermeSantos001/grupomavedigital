/**
 * @description Job -> Envia o e-mail de recuperação da conta para o usuário
 * @author GuilhermeSantos001
 * @update 31/01/2022
 */

import { JobContract } from '@/contracts/JobsContract';

import MailSend from '@/utils/mailsend';

const ConfirmMail: JobContract = {
  key: 'ACCOUNT_RETRIEVE',
  options: {},
  async handle({ data }) {
    try {
      await MailSend.accountRetrieve(data.email, data.username, data.token);
    } catch (error) {
      throw new Error(String(error));
    }
  }
}

export default ConfirmMail;