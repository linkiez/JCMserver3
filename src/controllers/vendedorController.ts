import { Request, Response } from "express";
import Vendedor from "../models/Vendedor.js";
import Pessoa from "../models/Pessoa.js";

export default class VendedorController {
  static async findAllVendedors(req: Request, res: Response) {
    try {
      const vendedor = await Vendedor.findAll({});
      return res.status(200).json(vendedor);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async findOneVendedor(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const vendedor = await Vendedor.findOne({
        where: { id: Number(id) },
      });
      return res.status(200).json(vendedor);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async createVendedor(req: Request, res: Response) {
    let vendedor = req.body;
    if (vendedor.pessoa) {
      vendedor.id_pessoa = vendedor.pessoa.id;
      delete vendedor.pessoa;
    }
    try {
      const vendedorCreated = await Vendedor.create(vendedor);
      return res.status(201).json(vendedorCreated);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async updateVendedor(req: Request, res: Response) {
    const { id } = req.params;
    let vendedor = req.body;
    if (vendedor.pessoa) {
      vendedor.id_pessoa = vendedor.pessoa.id;
      delete vendedor.pessoa;
    }
    delete vendedor.id;
    try {
      await Vendedor.update(vendedor, { where: { id: Number(id) } });
      const vendedorUpdated = await Vendedor.findOne({
        where: { id: Number(id) },
      });
      return res.status(202).json(vendedorUpdated);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async destroyVendedor(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await Vendedor.destroy({ where: { id: Number(id) } });
      return res.status(202).json({ message: `Vendedor apagado` });
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async findAllVendedorDeleted(req: Request, res: Response) {
    try {
      const vendedor = await Vendedor.scope("deleted").findAll({
        paranoid: false,
      });
      return res.status(200).json(vendedor);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async restoreVendedor(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await Vendedor.restore({ where: { id: Number(id) } });
      const vendedorUpdated = await Vendedor.findOne({
        where: { id: Number(id) },
      });
      return res.status(202).json(vendedorUpdated);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }
}
