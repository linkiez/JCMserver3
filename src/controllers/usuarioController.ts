import { Request, Response } from "express";
import Usuario from "../models/Usuario.js";
import Pessoa from "../models/Pessoa.js";
import { Authentication } from "../controllers/authController.js";

export default class UsuarioController {
  static async findAllUsuarios(req: Request, res: Response) {
    try {
      const usuario = await Usuario.findAll({
        include: [Pessoa],
        attributes: { exclude: ["id_pessoa", "senha", "acesso"] },
      });
      return res.status(200).json(usuario);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async findOneUsuario(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const usuario = await Usuario.findOne({
        where: { id: Number(id) },
        include: [Pessoa],
        attributes: { exclude: ["id_pessoa", "senha"] },
      });
      return res.status(200).json(usuario);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async createUsuario(req: Request, res: Response) {
    let usuario = req.body;
    if (usuario.pessoa) {
      usuario.id_pessoa = usuario.pessoa.id;
      delete usuario.pessoa;
    }
    // let usuarioAuth = req.user;
    // if(!usuarioAuth?.acesso?.admin){
    //   delete usuario.acesso
    // }
    try {
      if (Authentication.validaSenhaNova(usuario.senha)) {
        usuario.senha = await Authentication.gerarSenhaHash(usuario.senha);
        const usuarioCreated = await Usuario.create(usuario);
        return res.status(201).json(usuarioCreated);
      }
    } catch (error: any) {
      console.log(error);
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
    let usuarioAuth: any = req.user;
    if(!usuarioAuth.acesso.admin){
      delete usuario.acesso
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
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async destroyUsuario(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await Usuario.destroy({ where: { id: Number(id) } });
      return res.status(202).json({ message: `Usuario apagado` });
    } catch (error: any) {
      console.log(error);
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
      console.log(error);
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
      console.log(error);
      return res.status(500).json(error.message);
    }
  }
}
