import { Request, Response } from "express";

export class HealthController {
    static healthCheck(req: Request, res: Response) {
      return res.status(200).json({ status: 'OK' });
    }
  }
  