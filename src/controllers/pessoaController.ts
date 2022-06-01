import { Request, Response } from "express";
import { Pessoa } from "../models"
import { PessoaType } from "../types";

export default class PessoaController{
    static async findAllPessoas(req: Request, res: Response) {
        try {
          const pessoas = await Pessoa.findAll();
          return res.status(200).json(pessoas);
        } catch (error: any) {
          console.log(error);
          return res.status(500).json(error.message);
        }
      }
    
      static async findOnePessoa(req: Request, res: Response) {
        const { id } = req.params;
        try {
          const pessoa = await Pessoa.findOne({
            where: { id: Number(id) },
          });
          return res.status(200).json(pessoa);
        } catch (error: any) {
          console.log(error);
          return res.status(500).json(error.message);
        }
      }
    
      static async findPessoaByName(req: Request, res: Response) {
        const { nome } = req.params;
        try {
          const pessoa = await Pessoa.findOne({
            where: { nome: nome },
          });
          return res.status(200).json(pessoa);
        } catch (error: any) {
          console.log(error);
          return res.status(500).json(error.message);
        }
      }
      
    
      static async createPessoa(req: Request, res: Response) {
        const pessoa: PessoaType = req.body;
        try {
          console.log(Object.keys(pessoa));
          const pessoaCreated = await Pessoa.create(pessoa);
          return res.status(201).json(pessoaCreated);
        } catch (error: any) {
          console.log(error);
          return res.status(500).json(error.message);
        }
      }
    
      static async updatePessoa(req: Request, res: Response) {
        const { id } = req.params;
        const pessoaUpdate: PessoaType = req.body;
        try{
            await Pessoa.update(pessoaUpdate, {where:{ id: Number(id) }});
            const pessoaUpdated = await Pessoa.findOne({where:{ id: Number(id) }});
            return res.status(202).json(pessoaUpdated);
        }catch(error:any){
            console.log(error);
            return res.status(500).json(error.message);
        }
    }
    
    static async destroyPessoa(req: Request, res: Response) {
        const { id } = req.params;
        try{
            await Pessoa.destroy({where:{ id: Number(id) }});
            return res.status(202).json({message: `Pessoa apagada`});
        }catch(error:any){
            console.log(error);
            return res.status(500).json(error.message);
        }
    }
    
}
