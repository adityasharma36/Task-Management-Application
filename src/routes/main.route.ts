import { Router } from "express";
import authRoutes from "./auth.route.ts";
import userRoutes from "./user.route.ts";
import taskRoutes from "./task.route.ts";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/tasks", taskRoutes);

export default router;