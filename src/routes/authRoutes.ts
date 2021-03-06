import { Router } from "express";
import { Authentication } from "../controllers/authController.js";
const router = Router();

router
.get("/logout", Authentication.logout)
.post("/login", Authentication.login)
.post("/refresh", Authentication.refresh)

export default router;
