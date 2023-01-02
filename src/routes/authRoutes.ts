import { Router } from "express";
import { Authentication } from "../controllers/authController";
const router = Router();

router
.get("/logout", Authentication.logout)
.post("/login", Authentication.login)
.get("/refresh", Authentication.refresh)

export default router;
