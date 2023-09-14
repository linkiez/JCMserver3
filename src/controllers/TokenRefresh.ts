import crypto from "crypto";
import moment from "moment";
import redis from "../config/connRedis";
import { disconnect } from "process";

export default class TokenRefresh {
  static async cria(id: any) {
    const token = crypto.randomBytes(24).toString("hex");
    this.salva(token, id);
    return token;
  }

  static async renova(token: string) {
    if (!redis.isOpen) {
      await redis.connect();
    }
    let id = await redis.get(token);
    await redis.del(token);
    const response = await this.cria(id);
    if(process.env.NODE_ENV == "production")redis.disconnect();
    return response;
  }

  static async salva(token: any, id: number) {
    if (!redis.isOpen) {
      await redis.connect();
    } 
    await redis.set(token, id);
    redis.expireAt(
      token,
      moment().add(Number(process.env.REFRESH_TOKEN_EXPIRE_IN || 5), "d").unix()
    );
    if(process.env.NODE_ENV == "production")redis.disconnect();
  }

  static async apaga(token: string) {
    if (!redis.isOpen) {
      await redis.connect();
    }
    redis.del(token);
    if(process.env.NODE_ENV == "production")redis.disconnect();
  }

  static async existe(token: string) {
    if (!redis.isOpen) {
      await redis.connect();
    }
    const response = await redis.exists(token);
    if(process.env.NODE_ENV == "production")redis.disconnect();
    return response;
  }

  static async id(token: string) {
    if (!redis.isOpen) {
      await redis.connect();
    }
    const response = await redis.get(token);
    if(process.env.NODE_ENV == "production")redis.disconnect();
    return response;
  }
}
