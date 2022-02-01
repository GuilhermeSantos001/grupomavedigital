/**
 * @description Job -> Envia um e-mail de confirmação da conta do usuário
 * @author GuilhermeSantos001
 * @update 31/01/2022
 */

import { JobContract } from '@/contracts/JobsContract';

import MailSend from '@/utils/mailsend';

const ConfirmMail: JobContract = {
  key: 'CONFIRM_MAIL',
  options: {},
  async handle({ data }) {
    try {
      await MailSend.econfirm(data.email, data.username, data.token, data.temporarypass);
    } catch (error) {
      throw new Error(String(error));
    }
  }
}

export default ConfirmMail;