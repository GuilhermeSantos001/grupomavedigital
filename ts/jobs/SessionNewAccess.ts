/**
 * @description Job -> Envia o e-mail de novo acesso na conta do usuário por um endereço de IP fora do historico
 * @author GuilhermeSantos001
 * @update 22/01/2022
 */

import JobContract from '@/contracts/jobs.contracts';

import MailSend from '@/utils/mailsend';

const ConfirmMail: JobContract = {
  key: 'SESSION_NEW_ACCESS',
  options: {},
  async handle({ data }) {
    try {
      await MailSend.sessionNewAccess(data.email, data.username, data.navigator);
    } catch (error) {
      throw new Error(String(error));
    }
  }
}

export default ConfirmMail;