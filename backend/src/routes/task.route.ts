import { Router } from "express";
import TaskController from "../controllers/task.controller.ts";
import authMiddleware from "../middlewares/auth.middleware.ts";

const router = Router();
const controller = new TaskController();

router.use(authMiddleware);

router.post("/", controller.createTask);
router.get("/", controller.getAllTasks);
router.get("/:id", controller.getTaskById);
router.patch("/:id", controller.updateTask);
router.delete("/:id", controller.deleteTask);

export default router;