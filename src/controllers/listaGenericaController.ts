import { Request, Response } from "express";
import ListaGenericaItem from "../models/ListaGenericaItem";
import ListaGenerica from "../models/ListaGenerica";
import sequelize from "../config/connPostgre";

export default class ListaGenericaController {
  static async findAllListaGenerica(req: Request, res: Response) {
    try {
      let listaGenericas = await ListaGenerica.findAll({
        include: [ListaGenericaItem],
      });

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

  static async findByNameListaGenerica(req: Request, res: Response) {
    const { nome } = req.params;
    try {
      let listaGenerica = await ListaGenerica.findOne({
        where: { nome: nome },
        include: [ListaGenericaItem],
      });

      return res.status(200).json(listaGenerica);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async createListaGenerica(req: Request, res: Response) {
    const transaction = await sequelize.transaction();
    let listaGenerica;

    try {
      listaGenerica = req.body;

      let listaGenericaItem = listaGenerica.lista_generica_items;
      delete listaGenerica.lista_generica_items;

      let listaGenericaCreated = await ListaGenerica.create(listaGenerica, {
        transaction: transaction,
      });

      if (listaGenericaItem) {
        listaGenericaItem.forEach(async (item: any) => {
          item.id_lista = listaGenericaCreated.id;
          await ListaGenericaItem.create(item, { transaction: transaction });
        });
      }

      await transaction.commit();

      let listaGenericaCreated2 = await ListaGenerica.findOne({
        where: { id: listaGenericaCreated.id },
        include: [ListaGenericaItem],
      });

      return res.status(201).json(listaGenericaCreated2);
    } catch (error: any) {
      await transaction.rollback();
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async updateListaGenerica(req: Request, res: Response) {
    const { id } = req.params;
    const transaction = await sequelize.transaction();

    try {
      let listaGenerica = req.body;

      delete listaGenerica.id;

      let listaGenericaItem = listaGenerica.lista_generica_items;
      delete listaGenerica.lista_generica_items;

      await ListaGenerica.update(listaGenerica, {
        where: { id: Number(id) },
        transaction: transaction,
      });

      let listaPromises: any = [];

      let listaGenericaItemOld = await ListaGenericaItem.findAll({
        where: { id_lista: Number(id) },
      });

      let listaGenericaItemOldRemove = listaGenericaItemOld.filter(
        (item: ListaGenericaItem) => {
          let filtrado = listaGenericaItem.filter(
            (item2: ListaGenericaItem) => {
              return item2.id === item.id;
            }
          );
          if (filtrado.length == 0) {
            return true;
          } else {
            return false;
          }
        }
      );

      listaGenericaItemOldRemove.forEach((item: ListaGenericaItem) => {
        listaPromises.push(
          ListaGenericaItem.destroy({
            where: { id: item.id },
            transaction: transaction,
          })
        );
      });

      listaGenericaItem.forEach((item: any) => {
        item.id_lista = Number(id);
        if (!item.id) {
          listaPromises.push(
            ListaGenericaItem.create(item, { transaction: transaction })
          );
        } else {
          listaPromises.push(
            ListaGenericaItem.update(item, {
              where: { id: Number(item.id) },
              transaction: transaction,
            })
          );
        }
      });

      Promise.all(listaPromises).then(async () => {
        await transaction.commit();

        let listaGenericaUpdated = await ListaGenerica.findOne({
          where: { id: Number(id) },
          include: ListaGenericaItem,
        });

        return res.status(202).json(listaGenericaUpdated);
      });
    } catch (error: any) {
      await transaction.rollback();
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async destroyListaGenerica(req: Request, res: Response) {
    const { id } = req.params;

    try {
      await ListaGenerica.destroy({ where: { id: Number(id) } });

      return res.status(202).json({ message: `Lista apagada` });
    } catch (error: any) {
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
