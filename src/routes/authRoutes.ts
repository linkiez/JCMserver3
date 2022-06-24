import { Router } from "express";
import { Authentication } from "../controllers/authController.js";
const router = Router();

router.post("/login", Authentication.login);

export default router;
