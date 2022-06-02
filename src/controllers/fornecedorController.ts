import { Request, Response } from "express";
import Fornecedor from "../models/Fornecedor.js"
import { FornecedorType } from "../types/index.js";

export default class FornecedorController{
    static async findAllFornecedors(req: Request, res: Response) {
        try {
          const fornecedors = await Fornecedor.findAll();
          return res.status(200).json(fornecedors);
        } catch (error: any) {
          console.log(error);
          return res.status(500).json(error.message);
        }
      }
    
      static async findOneFornecedor(req: Request, res: Response) {
        const { id } = req.params;
        try {
          const fornecedor = await Fornecedor.findOne({
            where: { id: Number(id) },
          });
          return res.status(200).json(fornecedor);
        } catch (error: any) {
          console.log(error);
          return res.status(500).json(error.message);
        }
      }
    
      static async createFornecedor(req: Request, res: Response) {
        const fornecedor: FornecedorType = req.body;
        try {
          console.log(Object.keys(fornecedor));
          const fornecedorCreated = await Fornecedor.create(fornecedor);
          return res.status(201).json(fornecedorCreated);
        } catch (error: any) {
          console.log(error);
          return res.status(500).json(error.message);
        }
      }
    
      static async updateFornecedor(req: Request, res: Response) {
        const { id } = req.params;
        const fornecedorUpdate: FornecedorType = req.body;
        try{
            await Fornecedor.update(fornecedorUpdate, {where:{ id: Number(id) }});
            const fornecedorUpdated = await Fornecedor.findOne({where:{ id: Number(id) }});
            return res.status(202).json(fornecedorUpdated);
        }catch(error:any){
            console.log(error);
            return res.status(500).json(error.message);
        }
    }
    
    static async destroyFornecedor(req: Request, res: Response) {
        const { id } = req.params;
        try{
            await Fornecedor.destroy({where:{ id: Number(id) }});
            return res.status(202).json({message: `Fornecedor apagado`});
        }catch(error:any){
            console.log(error);
            return res.status(500).json(error.message);
        }
    }
    
}
