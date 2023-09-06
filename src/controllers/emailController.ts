import e, { Request, Response } from "express";
import nodemailer from "nodemailer";

export default class EmailController {
  static async sendEmail(req: Request, res: Response) {
    try {
      if (!req.body) {
        return res.status(400).json({ message: "Formulario Vazio" });
      }

      if (!req.body.name) {
        return res.status(400).json({ message: "Nome não informado" });
      }

      if (!req.body.email) {
        return res.status(400).json({ message: "E-mail não informado" });
      }

      if (!req.body.tel) {
        return res.status(400).json({ message: "Telefone não informado" });
      }

      if (!req.body.message) {
        return res.status(400).json({ message: "Mensagem não informada" });
      }

      if (!req.body.token) {
        return res.status(400).json({ message: "Token não informado" });
      }

      const validoCaptha = await validateCaptcha(req.body.token);
      if (!validoCaptha) {

        return res.status(400).json({ message: "Token inválido" });
      }

      let transporter = nodemailer.createTransport({
        name: "no-reply@jcmmetais.com.br",
        host: "br1012.hostgator.com.br",
        service: "br1012.hostgator.com.br",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      transporter.sendMail({
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
                        <p>E-mail enviado através do formulário de contato de https://jcmmetais.com.br/contato .</p>
                        `,
      });

      return res.status(200).json({ message: "Email enviado com sucesso" });
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }
  }
}

async function validateCaptcha(response_key: string) {
  const secret_key = "6Le9dPsnAAAAAJgezv5bCRjbyVAq8jmM2gCEIdDi";

  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${response_key}`;

  const response = await fetch(url, {
    method: "post",
  });

  const responseJson = await response.json();

  if (responseJson.success) {
    return true;
  } else {
    return false;
  }
}
