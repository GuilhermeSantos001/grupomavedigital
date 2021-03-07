const nodemailer = require("nodemailer");
const smtp = {
    'host': String(process.env.SMTP_HOST),
    'port': Number(process.env.SMTP_PORT),
    'secure': Boolean(eval(String(process.env.SMTP_SECURE).toLowerCase())),
    'auth': {
        'user': String(process.env.SMTP_USERNAME),
        'pass': String(process.env.SMTP_PASSWORD)
    }
};

module.exports = {
    getTestMessageUrl: nodemailer.getTestMessageUrl,
    transportVerify: (email) => {
        return new Promise(async (resolve, reject) => {
            const transporter = nodemailer.createTransport(smtp);
            transporter.verify((err, success) => {
                if (err) return reject(err);

                if (success) {
                    transporter.sendMail({
                        from: '"Grupo Mave Digital - 📧" <noreply@grupomave.com.br>',
                        to: `${email}`,
                        subject: "Email de verificação do SMTP",
                        text: `Esse email é um teste!`,
                        html: `
                        <b>Esse email é usado para testar as configurações do servidor de email.</b><br />
                        `
                    }).then(info => {
                        resolve(info);
                    }).catch(err => {
                        reject(err);
                    });
                }
            });
        })
    },
    usr_econfirm: (email, username, token) => {
        return new Promise(async (resolve, reject) => {
            const transporter = nodemailer.createTransport(smtp);
            transporter.verify((err, success) => {
                if (err) return reject(err);

                if (success) {
                    transporter.sendMail({
                        from: '"Grupo Mave Digital - 📧" <noreply@grupomave.com.br>',
                        to: `${email}`,
                        subject: "Confirmação de cadastro",
                        text: `Prezado(a) ${username}, por gentileza clique no link a baixo para confirmar sua conta!`,
                        html: `
                        <b>Prezado(a) ${username}, por gentileza clique no link a baixo para confirmar sua conta!</b><br />
                        <a href="http://${process.env.APP_ADDRESS}:${process.env.APP_PORT}/user/email/confirm/${token}">Acesse sua conta</a><br />
                        Esse link está valido por 7 dias. Após esse periodo você deverá solicitar ao administrador outro email de confirmação.<br />
                        Caso você não tenha feito essa solicitação, ignore este e-mail.<br />
                        - Atenciosamente, Equipe de TI.
                        `
                    }).then(info => {
                        resolve(info);
                    }).catch(err => {
                        reject(err);
                    });
                }
            });
        });
    },
    session_new_access: (email, username, browser, os, locationIP, ip) => {
        return new Promise(async (resolve, reject) => {
            const transporter = nodemailer.createTransport(smtp);
            transporter.verify((err, success) => {
                if (err) return reject(err);

                if (success) {
                    transporter.sendMail({
                        from: '"Grupo Mave Digital - 📧" <noreply@grupomave.com.br>',
                        to: `${email}`,
                        subject: "Novo Acesso Detectado",
                        text: `Prezado(a) ${username}, notamos um novo acesso em sua conta`,
                        html: `
                        <b>Prezado(a) ${username}, sua conta foi acessada em um novo dispositivo</b><br />
                        <b>Navegador: ${browser}</b><br/>
                        <b>Dispositivo: ${os}</b><br/>
                        <b>Localização: ${locationIP}</b><br/>
                        <b>Endereço de IP: ${ip}</b><br/>
                        <br>Se não foi você:</br><br />
                        * Sua conta pode ter sido comprometida e você deve tomar algumas precauções para proteger sua conta. Para começar, redefina sua senha agora.<br />
                        - Atenciosamente, Equipe de TI.
                        `
                    }).then(info => {
                        resolve(info);
                    }).catch(err => {
                        reject(err);
                    });
                }
            });
        });
    },
    usr_account_retrieve_twofactor: (email, username, token) => {
        return new Promise(async (resolve, reject) => {
            const transporter = nodemailer.createTransport(smtp);
            transporter.verify((err, success) => {
                if (err) return reject(err);

                if (success) {
                    transporter.sendMail({
                        from: '"Grupo Mave Digital - 📧" <noreply@grupomave.com.br>',
                        to: `${email}`,
                        subject: "Recuperação da Conta",
                        text: `Prezado(a) ${username}, por gentileza clique no link a baixo para recuperar sua conta!`,
                        html: `
                        <b>Prezado(a) ${username}, por gentileza clique no link a baixo para recuperar sua conta!</b><br />
                        <a href="http://${process.env.APP_ADDRESS}:${process.env.APP_PORT}/user/auth/security/retrieve/twofactor/${token}">Recuperar a Conta!</a><br />
                        Esse link está valido por 7 dias. Após esse periodo você deverá solicitar outro email de recuperação.<br />
                        Caso você não tenha feito essa solicitação, ignore este e-mail.<br />
                        - Atenciosamente, Equipe de TI.
                        `
                    }).then(info => {
                        resolve(info);
                    }).catch(err => {
                        reject(err);
                    });
                }
            });
        });
    }
}