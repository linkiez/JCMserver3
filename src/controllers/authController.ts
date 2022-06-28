import bcrypt from "bcrypt";
import passwordValidator from "password-validator";
import jwt from "jsonwebtoken";
import { InvalidArgumentError } from "../config/errors";
import { Request, Response } from "express";
import dotenv from "dotenv";
import Usuario from "../models/Usuario";
dotenv.config();

export class Authentication {
  static async gerarSenhaHash(senha: string) {
    return await bcrypt.hash(senha, 12);
  }

  static validaSenhaNova(senha: string) {
    var schema = new passwordValidator();

    schema
      .is()
      .min(8, "Senha deve possuir no minimo 8 caracteres.")
      .is()
      .max(128, "Senha deve possuir no maximo 128 caracteres.")
      .has()
      .uppercase(1, "Senha deve possuir no minimo uma letra maiuscula.")
      .has()
      .lowercase(1, "Senha deve possuir no minimo uma letra minuscula.")
      .has()
      .digits(1, "Senha deve possuir no minimo um numero.")
      .has()
      .symbols(1, "Senha deve possuir no minimo um simbolo.");

    const resultado = schema.validate(senha, { details: true }) as Array<any>;
    if (resultado.length !== 0)
      throw new InvalidArgumentError(resultado.map(item => item.message));

    return true;
  }

  static async login(req: Request, res: Response) {
    const { email, senha } = req.body;
    const usuario = await Usuario.findOne({ where: { email: email } });

    if (usuario) {
      const verificaSenha = await bcrypt.compare(senha, usuario.senha);

      if (verificaSenha) {
        const token = jwt.sign(usuario, process.env.CHAVE_JWT || "secret", {
          expiresIn: 300, // expires in 5min
        });
        return res.json({ auth: true, token: token });
      }
    } else {
      res.status(500).json({ message: "Login inválido!" });
    }
  }

  static async verifyJWT(req: any, res: any, next: any) {
    const token = req.headers["x-access-token"];
    if (!token)
      return res
        .status(401)
        .json({ auth: false, message: "Token não fornecido." });

    jwt.verify(
      token,
      process.env.CHAVE_JWT || "secret",
      function (error: any, decoded: any) {
        if (error)
          return res
            .status(500)
            .json({ auth: false, message: "Falha em autenticar token." });

        // se tudo estiver ok, salva no request para uso posterior
        req.user = decoded;
        next();
      }
    );
  }
}
