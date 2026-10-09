
import type { Prisma } from "../generated/prisma/client.ts";
import prisma from "../prisma/client.ts";

export default class TaskRepository {

    
  async createTask(
    userId: string,
    data: Omit<Prisma.TaskCreateInput, "user">,
  ) {
    const response = await prisma.task.create({
      data: {
        ...data,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });

    return response;
  }

  async findAllTask(userId: string) {
    const response = await prisma.task.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return response;
  }

  async findTaskById(id: string, userId: string) {
    const response = await prisma.task.findFirst({
      where: {
        id,
        userId,
      },
    });

    return response;
  }

  async updateTask(
    id: string,
    userId: string,
    data: Prisma.TaskUpdateManyMutationInput,
  ) {
    const response = await prisma.task.updateMany({
      where: {
        id,
        userId,
      },
      data,
    });

    if (response.count === 0) {
      return null;
    }

    return await prisma.task.findFirst({
      where: {
        id,
        userId,
      },
    });
  }

  async deleteTask(id: string, userId: string) {
    const response = await prisma.task.deleteMany({
      where: {
        id,
        userId,
      },
    });

    return response.count > 0;
  }
}