import bcrypt from "bcrypt";
import passwordValidator from "password-validator";
import jwt from "jsonwebtoken";
import { InvalidArgumentError } from "../config/errors";
import { Request, Response } from "express";
import dotenv from "dotenv";
import Usuario from "../models/Usuario";
import TokenAccess from "./TokenAccess";
import TokenRefresh from "./TokenRefresh";
import Pessoa from "../models/Pessoa";
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
      throw new InvalidArgumentError(resultado.map((item) => item.message));

    return true;
  }

  static async login(req: Request, res: Response) {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res
        .status(400)
        .json("Email e senha são obrigatórios.");
    }

    try {
      let usuario = await Usuario.findOne({
        where: { email },
        include: [Pessoa],
        attributes: { exclude: ["id_pessoa"] },
      });

      if (!usuario) {
        return res.status(404).json("Usuário não encontrado.");
      }

      if(usuario.senha){
        const verificaSenha = await bcrypt.compare(senha, usuario.senha);
        if (!verificaSenha) {
          return res.status(401).json("Email ou senha incorretos.");
        }
      }

      delete usuario.dataValues.senha;

      const refreshToken = await TokenRefresh.cria(usuario.id);
      const accessToken = await TokenAccess.cria(usuario);

      return res.json({
        auth: true,
        accessToken,
        refreshToken
      });

    } catch (error) {
      console.log("Resquest: ", req.body, "Erro: ", error)
      return res.status(500).json("Erro durante o login.");
    }
  }


  static async verificaLogin(req: any, res: any, next: any) {
    const token = req.headers["x-access-token"];
    if (!token) {
      return res
        .status(401)
        .json("Access token não fornecido.");
    }
    try {
      req.user = await TokenAccess.verifica(token);
      next();
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error)
      return res.status(401).json(error.message);
    }
  }

  static verificaAcesso = (acesso: any) => {
    return (req: Request, res: Response, next: any) => {
      let usuario: any = req.user;
      if (
        usuario["acesso"] &&
        usuario["acesso"][acesso[0]] &&
        usuario["acesso"][acesso[0]][acesso[1]]
      ) {
        next();
      } else {
        return res
          .status(401)
          .json("Acesso não autorizado.");
      }
    };
  };

  static async logout(req: Request, res: Response) {
    const accessToken = req.headers["x-access-token"];
    const refreshToken = req.headers["x-refresh-token"];
    if (!accessToken) {
      return res
        .status(401)
        .json("Access token não fornecido.");
    }
    if (!refreshToken) {
      return res
        .status(401)
        .json("Refresh token não fornecido.");
    }
    try {
      TokenAccess.salva(accessToken);
      TokenRefresh.apaga(refreshToken as string);
      return res.status(200).json("Logout realizado com sucesso.");
    } catch (error: any) {
      return res.status(500).json(error.message);
    }
  }

  static async refresh(req: Request, res: Response) {
    const refreshToken = req.headers["x-refresh-token"];

    if (!refreshToken) {
      return res
        .status(401)
        .json("Refresh token não fornecido.");
    }

    const id = await TokenRefresh.id(refreshToken as string);
    const usuario = await Usuario.findByPk(Number(id));

    if (!usuario) {
      return res
        .status(401)
        .json("Refresh token não reconhecido.");
    }
    const newAccessToken = await TokenAccess.cria(usuario);
    const newRefreshToken = await TokenRefresh.renova(refreshToken as string);

    return res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  }
}
