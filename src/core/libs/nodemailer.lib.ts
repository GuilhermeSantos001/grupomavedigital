import * as path from 'path';
import * as nodemailer from 'nodemailer';
import { pugEngine } from 'nodemailer-pug-engine';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

import { smtpOptions } from '@/core/constants';

declare type Recipient = {
  from: string;
  to: string[];
  subject: string;
  cc?: string[];
  cco?: string[];
  priority?: Priority;
};

declare type CTX = {
  title: string;
  variables: object;
};

export type Priority = 'high' | 'normal' | 'low';

export const Templates = {
  default: 'default',
  email_test: 'email-test',
  email_confirm: 'email-confirm',
};

export class Nodemailer {
  constructor() {
    throw new Error('this is static class');
  }

  static Test(recipient: Recipient) {
    return Nodemailer.Send(recipient, Templates.email_test, {
      title: 'Testing e-mail delivery',
      variables: {},
    });
  }

  static Send(
    recipient: Recipient,
    template: string,
    variables: CTX,
  ): Promise<SMTPTransport.SentMessageInfo> {
    return new Promise(async (resolve, reject) => {
      const mailOptions = {
        from: recipient.from,
        to: recipient.to,
        cc: recipient.cc || [],
        bcc: recipient.cco || [],
        priority: recipient.priority || 'normal',
        subject: String(recipient.subject),
        template: String(template),
        ctx: variables,
      };

      const transporter = nodemailer.createTransport({
        host: smtpOptions.host,
        port: smtpOptions.port,
        secure: smtpOptions.secure,
        auth: {
          user: smtpOptions.auth.user,
          pass: smtpOptions.auth.pass,
        },
      });

      transporter.verify((err, info) => {
        if (err) return reject(err);

        if (info) {
          transporter.use(
            'compile',
            pugEngine({
              templateDir: path.resolve(__dirname, '../templates'),
              pretty: true,
            }),
          );

          transporter.sendMail(mailOptions, (err, info) => {
            if (err) return reject(err);
            return resolve(info);
          });
        } else {
          return reject(info);
        }
      });
    });
  }
}
