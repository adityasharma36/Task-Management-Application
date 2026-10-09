
import { Router } from "express";

import UserController from "../controllers/user.controller.ts";
import authMiddleware from "../middlewares/auth.middleware.ts";

const router = Router();
const userController = new UserController();

// Public registration
router.post("/register", userController.createUser);

// Protected profile routes
router.get("/me", authMiddleware, userController.getMe);
router.patch("/me", authMiddleware, userController.updateMe);
router.delete("/me", authMiddleware, userController.deleteMe);

export default router;