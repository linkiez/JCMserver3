import jwt from "jsonwebtoken";
import { InvalidTokenError } from "../config/errors.js";
import Usuario from "./Usuario.js";
import redis from '../config/connRedis.js'

export default class TokenAccess {
  static async cria(usuario: Usuario) {
    return jwt.sign(
      usuario.toJSON(),
      process.env.CHAVE_JWT ||
        "40b5857f7689c9f542422f732e0aee5d49dccc2f50b7b0b1",
      {
        expiresIn: 3600, // expires in 5min
      }
    );
  }

  static async verifica(token: string) {
    if(await this.existe(token)) throw new InvalidTokenError("Access token inválido por logout!")

    let decoded: any = jwt.verify(
      token,
      process.env.CHAVE_JWT ||
        "40b5857f7689c9f542422f732e0aee5d49dccc2f50b7b0b1",
      function (error: any, decoded: any) {
        if (error) throw new InvalidTokenError("Falha em autenticar token.");

        return decoded;
      }
    );
    let user = await Usuario.findByPk(Number(decoded.id))
    return user;
  }

  static async salva(token: any) {
    await redis.set(token, '')
    redis.expire(token, 300)
  }

  static async existe(token: string) {
    return await redis.exists(token)
  }
}
