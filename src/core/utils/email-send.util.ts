import SMTPTransport from 'nodemailer/lib/smtp-transport';

import { Nodemailer, Templates, Priority } from '@/core/libs/nodemailer.lib';

import { VariablesLayoutAccountEmailConfirm } from '@/core/interfaces/variables-layout-account-email-confirm.interface';

declare type Options = {
  from: string;
  email: string;
  subject: string;
  title: string;
  priority: Priority;
  variables: VariablesLayoutAccountEmailConfirm;
};

export class EmailSend {
  constructor() {
    throw new Error('this is static class');
  }

  static async AccountEmailConfirm(
    email: string,
    username: string,
    token: string,
    temporarypass: string | null,
  ): Promise<SMTPTransport.SentMessageInfo> {
    try {
      const options: Options = {
        from: '"Grupo Mave Digital(✉)" <support@grupomavedigital.com>',
        email: email,
        subject: 'Grupo Mave Digital - Confirmação de Conta',
        title: `Prezado(a) ${username}, clique no link abaixo para confirmar sua conta.`,
        priority: 'normal',
        variables: {
          username,
          url: `${process.env.WEBAPP_URI}/account/confirm?token=${token}`,
          temporarypass,
        },
      };

      return await Nodemailer.Send(
        {
          from: options.from,
          to: [options.email],
          subject: options.subject,
          priority: options.priority,
        },
        Templates.email_confirm,
        {
          title: options.title,
          variables: options.variables,
        },
      );
    } catch (error) {
      throw new Error(JSON.stringify(error));
    }
  }
}
