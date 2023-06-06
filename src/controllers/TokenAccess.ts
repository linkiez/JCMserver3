import jwt from "jsonwebtoken";
import { InvalidTokenError } from "../config/errors";
import Usuario from "../models/Usuario";
import redis from "../config/connRedis";

export default class TokenAccess {
  static async cria(usuario: Usuario) {
    return jwt.sign(
      usuario.toJSON(),
      process.env.CHAVE_JWT ||
        "40b5857f7689c9f542422f732e0aee5d49dccc2f50b7b0b1",
      {
        expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRE_IN || 900),
      }
    );
  }

  static async verifica(token: string) {
    if (await this.existe(token))
      throw new InvalidTokenError("Access token inválido por logout!");

    let decoded: any = jwt.verify(
      token,
      process.env.CHAVE_JWT ||
        "40b5857f7689c9f542422f732e0aee5d49dccc2f50b7b0b1",
      function (error: any, decoded: any) {
        if (error) throw new InvalidTokenError("Falha em autenticar token.");

        return decoded;
      }
    );
    let user = await Usuario.findByPk(Number(decoded.id));
    return user;
  }

  static async salva(token: any) {
    if (!redis.isOpen) {
      await redis.connect();
    }
    await redis.set(token, "");
    redis.expire(token, Number(process.env.ACCESS_TOKEN_EXPIRE_IN || 900));
    // redis.disconnect();
  }

  static async existe(token: string) {
    if (!redis.isOpen) {
      await redis.connect();
    }
    const response = await redis.exists(token);
    // redis.disconnect();
    return response;
  }
}
