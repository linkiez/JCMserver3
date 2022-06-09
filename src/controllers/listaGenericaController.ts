import { Request, Response } from "express";
import ListaGenericaItem from "../models/ListaGenericaItem.js";
import ListaGenerica from "../models/ListaGenerica.js";
import { ListaGenericaType } from "../types/index.js";
import { ListaGenericaItemType } from "../types/index.js";
import sequelize from "../config/connection.js";

export default class ListaGenericaController {
  static async findAllListaGenerica(req: Request, res: Response) {
    try {
      let listaGenericas =
        (await ListaGenerica.findAll()) as Array<ListaGenericaType>;

      return res.status(200).json(listaGenericas);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async findOneListaGenerica(req: Request, res: Response) {
    const { id } = req.params;
    try {
      let listaGenerica = (await ListaGenerica.findOne({
        where: { id: Number(id) },
        include: [ListaGenericaItem],
      })) as ListaGenericaType;

      return res.status(200).json(listaGenerica);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async createListaGenerica(req: Request, res: Response) {
    const t = await sequelize.transaction();
    let listaGenerica: ListaGenericaType;

    try {
      listaGenerica = req.body;

      let listaGenericaItem = listaGenerica.ListaGenericaItem;
      delete listaGenerica.ListaGenericaItem;

      let listaGenericaCreated = (await ListaGenerica.create(
        listaGenerica
      )) as ListaGenericaType;

      if (listaGenericaItem) {
        listaGenericaItem.forEach((item) => {
          item.id_lista = listaGenericaCreated.id;
          ListaGenericaItem.create(item);
        });
      }

      await t.commit();

      listaGenericaCreated = (await ListaGenerica.findOne({
        where: { id: listaGenericaCreated.id },
        include: [ListaGenericaItem],
      })) as ListaGenericaType;

      return res.status(201).json(listaGenericaCreated);
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
      let listaGenerica: ListaGenericaType = req.body;

      delete listaGenerica.id;

      let listaGenericaItem = listaGenerica.ListaGenericaItem;
      delete listaGenerica.ListaGenericaItem;

      await ListaGenerica.update(listaGenerica, {
        where: { id: Number(id) },
      });
      await ListaGenericaItem.destroy({
        where: { id_lista: Number(id) },
      });

      if (listaGenericaItem)
        listaGenericaItem.forEach(async (item: ListaGenericaItemType) => {
          item.id_lista = Number(id);
          delete item.id;

          await ListaGenericaItem.create(item);
        });

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
      await ListaGenericaItem.destroy({
        where: { id_lista: Number(id) },
      });
      await ListaGenerica.destroy({ where: { id: Number(id) } });

      await t.commit();

      return res.status(202).json({ message: `Lista apagada` });
    } catch (error: any) {
      await t.rollback();
      console.log(error);
      return res.status(500).json(error.message);
    }
  }
}
