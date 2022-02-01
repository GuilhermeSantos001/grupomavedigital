/**
 * @description Job -> Envia o e-mail com o pedido aos procuradores do arquivo/pasta
 * @author GuilhermeSantos001
 * @update 31/01/2022
 */

import { JobContract } from '@/contracts/JobsContract';

 import MailSend from '@/utils/mailsend';

 const ConfirmMail: JobContract = {
   key: 'HERCULES_ORDERS',
  options: {},
   async handle({ data }) {
     try {
       await MailSend.herculesOrders(data.email, data.username, data.title, data.description, data.link);
     } catch (error) {
       throw new Error(String(error));
     }
   }
 }

 export default ConfirmMail;