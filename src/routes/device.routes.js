import { Router } from "express";
import { registerDevice } from "../controllers/device.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// 🔐 user must be logged in
router.post("/register", authMiddleware, registerDevice);

export default router;