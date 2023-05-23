import { Router } from "express";
import { HealthController } from "../controllers/healthController";

const router = Router();

router.get("/health", HealthController.healthCheck);

export default router;
