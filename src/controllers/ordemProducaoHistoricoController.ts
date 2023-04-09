import OrdemProducaoHistorico from "../models/OrdemProducaoHistorico";
import {Request, Response} from 'express';

export default class OrdemProducaoHistoricoController {
    static async CreateOrdemProducaoHistorico(req: Request, res: Response) {
        const historico: any = req.body;
        try {
            const historicoCreated = await OrdemProducaoHistorico.create(historico);
            return res.status(200).json(historicoCreated);
        } catch (error) {
            return res.status(500).json(error);
        }
    }
    static async UpdateOrdemProducaoHistorico(req: Request, res: Response) {
        let historico: any = req.body;
        const id = historico.id;
        delete historico.id;
        try {
            await OrdemProducaoHistorico.update(historico, {
                where: {
                    id: id,
                },
            });
            const historicoUpdated = await OrdemProducaoHistorico.findByPk(id);
            return res.status(200).json(historicoUpdated);
        } catch (error) {
            return res.status(500).json(error);
        }
    }

    static async DeleteOrdemProducaoHistorico(req: Request, res: Response) {
        const id = req.params.id;
        try {
            await OrdemProducaoHistorico.destroy({
                where: {
                    id: id,
                },
            });
            return res.status(200).json({msg: "Historico excluido com sucesso"});
        } catch (error) {
            return res.status(500).json(error);
        }
    }
}
