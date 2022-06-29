import { Router } from 'express';
import UsuarioController from '../controllers/usuarioController.js';
import { Authentication } from "../controllers/authController.js";

const router = Router();
router
    .get('/usuario', Authentication.verificaLogin, UsuarioController.findAllUsuarios)
    .get('/usuario/deleted', UsuarioController.findAllUsuarioDeleted)
    .get('/usuario/:id', UsuarioController.findOneUsuario)
    .post('/usuario', UsuarioController.createUsuario)
    .post('/usuario/restore/:id', UsuarioController.restoreUsuario)
    .put('/usuario/:id', UsuarioController.updateUsuario)
    .delete('/usuario/:id', UsuarioController.destroyUsuario);

    export default router;
