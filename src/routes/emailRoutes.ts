import { Router } from "express";
import EmailController from "../controllers/emailController.js";
const router = Router();

router.post('/form-site', EmailController.sendEmail);

export default router;
