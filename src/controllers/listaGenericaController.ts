import { Request, Response } from "express";
import ListaGenericaItem from "../models/ListaGenericaItem.js";
import ListaGenerica from "../models/ListaGenerica.js";
import sequelize from "../config/connection.js";

export default class ListaGenericaController {
  static async findAllListaGenerica(req: Request, res: Response) {
    try {
      let listaGenericas = await ListaGenerica.findAll();

      return res.status(200).json(listaGenericas);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async findAllListaGenericaDeleted(req: Request, res: Response) {
    try {
      let listaGenericas = await ListaGenerica.scope("deleted").findAll({
        paranoid: false,
      });

      return res.status(200).json(listaGenericas);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async findOneListaGenerica(req: Request, res: Response) {
    const { id } = req.params;
    try {
      let listaGenerica = await ListaGenerica.findOne({
        where: { id: Number(id) },
        include: [ListaGenericaItem],
      });

      return res.status(200).json(listaGenerica);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async createListaGenerica(req: Request, res: Response) {
    const t = await sequelize.transaction();
    let listaGenerica;

    try {
      listaGenerica = req.body;

      let listaGenericaItem = listaGenerica.ListaGenericaItem;
      delete listaGenerica.ListaGenericaItem;

      let listaGenericaCreated = await ListaGenerica.create(listaGenerica);

      if (listaGenericaItem) {
        listaGenericaItem.forEach((item: any) => {
          item.id_lista = listaGenericaCreated.id;
          ListaGenericaItem.create(item);
        });
      }

      await t.commit();

      let listaGenericaCreated2 = await ListaGenerica.findOne({
        where: { id: listaGenericaCreated.id },
        include: [ListaGenericaItem],
      });

      return res.status(201).json(listaGenericaCreated2);
    } catch (error: any) {
      await t.rollback();
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async updateListaGenerica(req: Request, res: Response) {
    const { id } = req.params;
    const t = await sequelize.transaction();

    try {
      let listaGenerica = req.body;

      delete listaGenerica.id;

      let listaGenericaItem = listaGenerica.ListaGenericaItem;
      delete listaGenerica.ListaGenericaItem;

      await ListaGenerica.update(listaGenerica, {
        where: { id: Number(id) },
      });

      if (listaGenericaItem) {
        await ListaGenericaItem.destroy({
          where: { id_lista: Number(id) },
        });

        listaGenericaItem.forEach(async (item: any) => {
          item.id_lista = Number(id);
          delete item.id;

          await ListaGenericaItem.create(item);
        });
      }

      await t.commit();

      let listaGenericaUpdated = await ListaGenerica.findOne({
        where: { id: Number(id) },
        include: ListaGenericaItem,
      });

      return res.status(202).json(listaGenericaUpdated);
    } catch (error: any) {
      await t.rollback();
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async destroyListaGenerica(req: Request, res: Response) {
    const { id } = req.params;
    const t = await sequelize.transaction();

    try {
      await ListaGenerica.destroy({ where: { id: Number(id) } });

      await t.commit();

      return res.status(202).json({ message: `Lista apagada` });
    } catch (error: any) {
      await t.rollback();
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async restoreListaGenerica(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await ListaGenerica.restore({ where: { id: Number(id) } });

      const listaGenericaUpdated = await ListaGenerica.findOne({
        where: { id: Number(id) },
      });
      return res.status(202).json(listaGenericaUpdated);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }
}
