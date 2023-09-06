import e, { Request, Response } from "express";
import nodemailer from "nodemailer";

export default class EmailController {
  static async sendEmail(req: Request, res: Response) {
    try {
      if (!req.body) throw new Error("Requisição inválida");

      if (!req.body.name) throw new Error("Form: Nome não informado");

      if (!req.body.email) throw new Error("Form: E-mail não informado");

      if (!req.body.tel) throw new Error("Form: Telefone não informado");

      if (!req.body.message) throw new Error("Form: Mensagem não informada");

      if (!req.body.token) throw new Error("Form: Token não informado");

      const validoCaptha = await validateCaptcha(req.body.token);
      if (!validoCaptha) {
        throw new Error("Form: Token inválido");
      }

      let transporter = nodemailer.createTransport({
        // name: "no-reply@jcmmetais.com.br",
        // host: "br1012.hostgator.com.br",
        service: "Gmail",
        // port: 465,
        // secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      const response = await transporter.sendMail({
        from: `"Formulário Contato JCM Metais " <contato@jcmmetais.com.br>`,
        to: "contato@jcmmetais.com.br",
        replyTo: req.body.email,
        subject: "Formulário de contato - Contato",
        text: req.body.message,
        html: `
                        <p>De: ${req.body.name}</p>
                        <p>E-mail: ${req.body.email}</p>
                        <p>Telefone: ${req.body.tel}</p>
                        <p>Mensagem: ${req.body.mensagem}</p>
                        <br>
                        <p>E-mail enviado através do formulário de contato de https://www.jcmmetais.com.br/contato .</p>
                        `,
      });
      console.log(response)
      return res.status(200).json({ message: "Email enviado com sucesso" });
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }
  }
}

async function validateCaptcha(response_key: string) {
  const secret_key = process.env.CAPTCHA_SECRET_KEY;

  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${response_key}`;

  const response = await fetch(url, {
    method: "post",
  });

  const responseJson = await response.json();

  if (responseJson.success) {
    return true;
  } else {
    console.log(responseJson);
    return false;
  }
}
