
import TaskRepository from "../repositories/task.repositorie.ts";

import {
  BadRequestError,
  NotFoundError,
  InternalError,
} from "../utils/errors/custom.error.ts";

export type TaskStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED";

export interface CreateTaskDTO {
  title: string;
  description?: string;
  status?: TaskStatus;
  dueDate?: Date | string | null;
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  dueDate?: Date | string | null;
}

class TaskService {
  private readonly taskRepository = new TaskRepository();

  // Validate and normalize the due date.
  private normalizeDueDate(
    dueDate: Date | string | null | undefined,
  ): Date | null | undefined {
    if (dueDate === undefined || dueDate === null) {
      return dueDate;
    }

    const parsedDate =
      dueDate instanceof Date ? dueDate : new Date(dueDate);

    if (Number.isNaN(parsedDate.getTime())) {
      throw new BadRequestError("Invalid due date");
    }

    return parsedDate;
  }

  // Create a task for the authenticated user.
  async createTask(userId: string, data: CreateTaskDTO) {
  try {
    if (!userId) {
      throw new BadRequestError("User ID is required");
    }

    if (!data.title?.trim()) {
      throw new BadRequestError("Task title is required");
    }

    const taskData: {
      title: string;
      description?: string | null;
      status?: TaskStatus;
      dueDate?: Date | null;
    } = {
      title: data.title.trim(),
    };

    if (data.description !== undefined) {
      taskData.description = data.description;
    }

    if (data.status !== undefined) {
      taskData.status = data.status;
    }

    if (data.dueDate !== undefined) {
      const dueDate = this.normalizeDueDate(data.dueDate);

      if (dueDate !== undefined) {
        taskData.dueDate = dueDate;
      }
    }

    return await this.taskRepository.createTask(userId, taskData);
  } catch (error) {
    if (error instanceof Error && "statusCode" in error) {
      throw error;
    }

    throw new InternalError("Failed to create task");
  }
}

  // Get all tasks owned by the user.
  async getAllTasks(userId: string) {
    try {
      if (!userId) {
        throw new BadRequestError("User ID is required");
      }

      return await this.taskRepository.findAllTask(userId);
    } catch (error) {
      if (error instanceof Error && "statusCode" in error) {
        throw error;
      }

      throw new InternalError("Failed to fetch tasks");
    }
  }

  // Get one task belonging to the user.
  async getTaskById(id: string, userId: string) {
    try {
      if (!id || !userId) {
        throw new BadRequestError(
          "Task ID and user ID are required",
        );
      }

      const task = await this.taskRepository.findTaskById(
        id,
        userId,
      );

      if (!task) {
        throw new NotFoundError("Task not found");
      }

      return task;
    } catch (error) {
      if (error instanceof Error && "statusCode" in error) {
        throw error;
      }

      throw new InternalError("Failed to fetch task");
    }
  }

  
async updateTask(
  id: string,
  userId: string,
  data: UpdateTaskDTO,
) {
  try {
    if (!id || !userId) {
      throw new BadRequestError(
        "Task ID and user ID are required",
      );
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestError(
        "At least one field is required to update",
      );
    }

    const taskData: {
      title?: string;
      description?: string | null;
      status?: TaskStatus;
      dueDate?: Date | null;
    } = {};

    if (data.title !== undefined) {
      if (!data.title.trim()) {
        throw new BadRequestError(
          "Task title cannot be empty",
        );
      }

      taskData.title = data.title.trim();
    }

    if (data.description !== undefined) {
      taskData.description = data.description;
    }

    if (data.status !== undefined) {
      const allowedStatuses: TaskStatus[] = [
        "PENDING",
        "IN_PROGRESS",
        "COMPLETED",
      ];

      if (!allowedStatuses.includes(data.status)) {
        throw new BadRequestError("Invalid task status");
      }

      taskData.status = data.status;
    }

    if (data.dueDate !== undefined) {
      const dueDate = this.normalizeDueDate(data.dueDate);

      if (dueDate !== undefined) {
        taskData.dueDate = dueDate;
      }
    }

    const updatedTask = await this.taskRepository.updateTask(
      id,
      userId,
      taskData,
    );

    if (!updatedTask) {
      throw new NotFoundError("Task not found");
    }

    return updatedTask;
  } catch (error) {
    if (error instanceof Error && "statusCode" in error) {
      throw error;
    }

    throw new InternalError("Failed to update task");
  }
}


  async deleteTask(
    id: string,
    userId: string,
  ): Promise<{ message: string }> {
    try {
      if (!id || !userId) {
        throw new BadRequestError(
          "Task ID and user ID are required",
        );
      }

      const deletedTask = await this.taskRepository.deleteTask(
        id,
        userId,
      );

      if (!deletedTask) {
        throw new NotFoundError("Task not found");
      }

      return { message: "Task deleted successfully" };
    } catch (error) {
      if (error instanceof Error && "statusCode" in error) {
        throw error;
      }

      throw new InternalError("Failed to delete task");
    }
  }
}

export default TaskService;