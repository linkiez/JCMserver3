import { InvalidTokenError } from "../config/errors.js";
import crypto from "crypto";
import moment from "moment";
import redis from "../config/connRedis.js";

export default class TokenRefresh {
  static async cria(id: any) {
    const token = crypto.randomBytes(24).toString("hex");
    this.salva(token, id);
    return token;
  }

  static async renova(token: string) {
    let id = await redis.get(token);
    await redis.del(token);
    return this.cria(id);
  }

  static async salva(token: any, id: number) {
    await redis.set(token, id);
    redis.expireAt(
      token,
      moment().add(Number(process.env.REFRESH_TOKEN_EXPIRE_IN || 5), "d").unix()
    );
  }

  static async apaga(token: string) {
    redis.del(token);
  }

  static async existe(token: string) {
    return redis.exists(token);
  }

  static async id(token: string) {
    return redis.get(token);
  }
}
