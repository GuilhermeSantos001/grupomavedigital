/**
 * @description Job -> Envia o e-mail para confirmar a troca da senha do usuário
 * @author GuilhermeSantos001
 * @update 31/01/2022
 */

import { JobContract } from '@/contracts/JobsContract';

import MailSend from '@/utils/mailsend';

const ConfirmMail: JobContract = {
  key: 'ACCOUNT_FORGOT_PASSWORD',
  options: {},
  async handle({ data }) {
    try {
      await MailSend.accountForgotPassword(data.email, data.username, data.signature, data.token);
    } catch (error) {
      throw new Error(String(error));
    }
  }
}

export default ConfirmMail;