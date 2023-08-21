import { Request, Response } from "express";
import FileDb from "../models/File";
import { IncomingForm } from "formidable";
import Bucket from "../services/Bucket";

export default class FileController {
  static async findAllFiles(req: Request, res: Response) {
    try {
      const files = await FileDb.findAll();
      return res.status(200).json(files);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error)
      return res.status(500).json(error.message);
    }
  }

  static async findOneFile(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const file = await FileDb.findOne({
        where: { id: Number(id) },
      });
      return res.status(200).json(file);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error)
      return res.status(500).json(error.message);
    }
  }

  static async getUrlFile(req: Request, res: Response) {
    const { id } = req.params;
    
    try {
      const file = await FileDb.findOne({
        where: { id: Number(id) },
      });
      
      if (file) {
        const bucket = new Bucket(file.service);
        const url = { url: await bucket.getSignedUrl(file.newFilename) };
        return res.status(200).json(url);
      } else {
        return res.status(404);
      }
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error)
      return res.status(500).json(error.message);
    }
  }

  static async createFile(req: Request, res: Response) {
    const form = new IncomingForm();
    try {
      form.parse(req, async (err, fields: any, files: any) => {
        const service = (process.env.BUCKET_SERVICE as 'aws' | 'gcp' | undefined ) ?? 'aws';
        const bucket = new Bucket(service);
        const url = await bucket.uploadFile(
          files.filetoupload[0].newFilename,
          files.filetoupload[0].filepath,
          files.filetoupload[0].mimetype
        );
        const file = {
          url,
          originalFilename: files.filetoupload[0].originalFilename,
          newFilename: files.filetoupload[0].newFilename,
          mimeType: files.filetoupload[0].mimeType,
          service
        };
        const fileCreated = await FileDb.create(file);
        return res.status(202).json(fileCreated);
      });
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error)
      return res.status(500).json(error.message);
    }
  }

  static async destroyFile(req: Request, res: Response) {
    const { id } = req.params;
    try {
      let file = await FileDb.findByPk(id);
      if (file) {
        const bucket = new Bucket(file.service);
        await bucket.delete(file.newFilename);
      }
      await FileDb.destroy({ where: { id: Number(id) } });
      return res.status(202).json({ message: `File apagado` });
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error)
      return res.status(500).json(error.message);
    }
  }

  static async findAllFileDeleted(req: Request, res: Response) {
    try {
      const files = await FileDb.scope("deleted").findAll({ paranoid: false });
      return res.status(200).json(files);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error)
      return res.status(500).json(error.message);
    }
  }

  static async restoreFile(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await FileDb.restore({ where: { id: Number(id) } });
      const fileUpdated = await FileDb.findOne({ where: { id: Number(id) } });
      return res.status(202).json(fileUpdated);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error)
      return res.status(500).json(error.message);
    }
  }
}
