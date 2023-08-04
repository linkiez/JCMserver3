import { Request, Response } from "express";
import Usuario from "../models/Usuario";
import Pessoa from "../models/Pessoa";
import { Authentication } from "../controllers/authController";
import { Op } from "sequelize";

export default class UsuarioController {
  static async findAllUsuarios(req: Request, res: Response) {
    try {
      let consulta: any = {
        pageCount: Number(req.query.pageCount) || 10,
        page: Number(req.query.page) || 0,
        searchValue: req.query.searchValue,
      };
      let resultado: { usuarios: Usuario[]; totalRecords: Number } = {
        usuarios: [],
        totalRecords: 0,
      };

      let queryWhere: any = {
        email: { [Op.like]: `%${consulta.searchValue}%` },
      };

      if (req.query.deleted === "true")
        queryWhere = { ...queryWhere, deletedAt: { [Op.not]: null } };

      resultado.usuarios = await Usuario.findAll({
        limit: consulta.pageCount,
        offset: consulta.pageCount * consulta.page,
        where: consulta.searchValue !== "undefined" ? queryWhere : undefined,
        include: [{model:Pessoa, paranoid: false}],
        attributes: { exclude: ["id_pessoa", "senha", "acesso"] },
        paranoid: req.query.deleted === "true" ? false : true,
      });

      resultado.totalRecords = await Usuario.count({
        where: consulta.searchValue !== "undefined" ? queryWhere : undefined,
        paranoid: req.query.deleted === "true" ? false : true,
      });
      
      return res.status(200).json(resultado);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error)
      return res.status(500).json(error.message);
    }
  }

  static async findOneUsuario(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const usuario = await Usuario.findOne({
        where: { id: Number(id) },
        include: [{model: Pessoa, paranoid: false}],
        attributes: { exclude: ["id_pessoa", "senha"] },
      });
      return res.status(200).json(usuario);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error)
      return res.status(500).json(error.message);
    }
  }

  static async createUsuario(req: Request, res: Response) {
    let usuario = req.body;
    if (usuario.pessoa) {
      usuario.id_pessoa = usuario.pessoa.id;
      delete usuario.pessoa;
    }
    let usuarioAuth = req.user;
    if (usuarioAuth.acesso && !usuarioAuth?.acesso?.admin) {
      throw new Error("Você não tem permissão para criar um usuário");
    }
    try {
      if (Authentication.validaSenhaNova(usuario.senha)) {
        usuario.senha = await Authentication.gerarSenhaHash(usuario.senha);
        const usuarioCreated = await Usuario.create(usuario);
        const usuarioUpdated = await Usuario.findOne({
          where: { id: Number(usuarioCreated.id) },
          attributes: { exclude: ["id_pessoa", "senha"] },
        });
        return res.status(201).json(usuarioUpdated);
      }
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error)
      return res.status(500).json(error.message);
    }
  }

  static async updateUsuario(req: Request, res: Response) {
    const { id } = req.params;
    let usuario = req.body;
    if (usuario.pessoa) {
      usuario.id_pessoa = usuario.pessoa.id;
      delete usuario.pessoa;
    }
    let usuarioAuth = req.user;
    if (usuarioAuth.acesso && !usuarioAuth?.acesso?.admin) {
      throw new Error("Você não tem permissão para alterar um usuário");
    }
    delete usuario.id;
    try {
      if (usuario.senha) {
        Authentication.validaSenhaNova(usuario.senha);
        usuario.senha = await Authentication.gerarSenhaHash(usuario.senha);
      }
      await Usuario.update(usuario, { where: { id: Number(id) } });
      const usuarioUpdated = await Usuario.findOne({
        where: { id: Number(id) },
        attributes: { exclude: ["id_pessoa", "senha"] },
      });
      return res.status(202).json(usuarioUpdated);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error)
      return res.status(500).json(error.message);
    }
  }

  static async destroyUsuario(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await Usuario.destroy({ where: { id: Number(id) } });
      return res.status(202).json({ message: `Usuario apagado` });
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error)
      return res.status(500).json(error.message);
    }
  }

  static async findAllUsuarioDeleted(req: Request, res: Response) {
    try {
      const usuario = await Usuario.scope("deleted").findAll({
        paranoid: false,
        include: [Pessoa],
        attributes: { exclude: ["id_pessoa"] },
      });
      return res.status(200).json(usuario);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error)
      return res.status(500).json(error.message);
    }
  }

  static async restoreUsuario(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await Usuario.restore({ where: { id: Number(id) } });
      const usuarioUpdated = await Usuario.findOne({
        where: { id: Number(id) },
      });
      return res.status(202).json(usuarioUpdated);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error)
      return res.status(500).json(error.message);
    }
  }
}
