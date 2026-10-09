
import type {
  Request,
  Response,
  NextFunction,
} from "express";

import TaskService from "../service/task.service.ts";
import { BadRequestError } from "../utils/errors/custom.error.ts";

class TaskController {
  private readonly taskService = new TaskService();

  // Create task
  createTask = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      const task = await this.taskService.createTask(
        userId,
        req.body,
      );

      res.status(201).json({
        success: true,
        message: "Task created successfully",
        data: task,
      });
    } catch (error) {
      next(error);
    }
  };

  // Get all tasks for the authenticated user
  getAllTasks = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      const tasks = await this.taskService.getAllTasks(userId);

      res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks,
      });
    } catch (error) {
      next(error);
    }
  };

  // Get one task
  getTaskById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
    const id = req.params.id;

    if (typeof id !== "string" || !id.trim()) {
        throw new BadRequestError("Valid task ID is required");
    }

      if (!userId ) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }
       

      const task = await this.taskService.getTaskById(
        id,
        userId,
      );

      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  };

  // Update one task
  updateTask = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      const id = req.params.id;

        if (typeof id !== "string" || !id.trim()) {
        throw new BadRequestError("Valid task ID is required");
        }

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      const task = await this.taskService.updateTask(
        id,
        userId,
        req.body,
      );

      res.status(200).json({
        success: true,
        message: "Task updated successfully",
        data: task,
      });
    } catch (error) {
      next(error);
    }
  };

  // Delete one task
  deleteTask = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      const id = req.params.id;

        if (typeof id !== "string" || !id.trim()) {
        throw new BadRequestError("Valid task ID is required");
        }

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      const result = await this.taskService.deleteTask(
        id,
        userId,
      );

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default TaskController;