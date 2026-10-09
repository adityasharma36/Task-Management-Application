
import bcrypt from "bcrypt";

import UserRepository from "../repositories/user.repositorie.ts";

import type {
  CreateUserDTO,
  UpdateUserDTO,
  UserResponseDTO,
} from "../dtos/user.dto.ts";
import { BadRequestError, ConflictError, InternalError, NotFoundError } from "../utils/errors/custom.error.ts";

export interface userTokenResponse{
    
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
  }

class UserService {
  private userRepository: InstanceType<typeof UserRepository>;

  constructor() {
    this.userRepository = new UserRepository();
  }


  private toUserResponse(user: userTokenResponse): UserResponseDTO {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }


  
  
  async createUser(data: CreateUserDTO): Promise<UserResponseDTO> {
    try {
      if (!data.name.trim() || !data.email.trim() || !data.password) {
        throw new BadRequestError(
          "Name, email and password are required",
        );
      }

      const existingUser = await this.userRepository.findByEmail(
        data.email,
      );

      if (existingUser) {
        throw new ConflictError("Email is already registered");
      }

      const passwordHash = await bcrypt.hash(data.password, 12);

      const user = await this.userRepository.createUser({
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        passwordHash,
      });

      return this.toUserResponse(user);
    } catch (error) {
      if (error instanceof Error && "statusCode" in error) {
        throw error;
      }

   
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2002"
      ) {
        throw new ConflictError("Email is already registered");
      }

      throw new InternalError("Failed to create user");
    }
  }


  async getUserById(id: string): Promise<UserResponseDTO> {
    try {
      const user = await this.userRepository.findById(id);

      if (!user) {
        throw new NotFoundError("User not found");
      }

      return this.toUserResponse(user);
    } catch (error) {
      if (error instanceof Error && "statusCode" in error) {
        throw error;
      }

      throw new InternalError("Failed to fetch user");
    }
  }


  async updateUser(id: string, data: UpdateUserDTO): Promise<UserResponseDTO> {
    try {
      if (Object.keys(data).length === 0) {
        throw new BadRequestError(
          "At least one field is required to update",
        );
      }

      const existingUser = await this.userRepository.findById(id);

      if (!existingUser) {
        throw new NotFoundError("User not found");
      }

      const updateData: {
        name?: string;
        email?: string;
        passwordHash?: string;
      } = {};

      if (data.name !== undefined) {
        if (!data.name.trim()) {
          throw new BadRequestError("Name cannot be empty");
        }

        updateData.name = data.name.trim();
      }

      if (data.email !== undefined) {
        const email = data.email.trim().toLowerCase();

        if (!email) {
          throw new BadRequestError("Email cannot be empty");
        }

        const emailOwner =
          await this.userRepository.findByEmail(email);

        if (emailOwner && emailOwner.id !== id) {
          throw new ConflictError("Email is already in use");
        }

        updateData.email = email;
      }

      if (data.password !== undefined) {
        if (data.password.length < 8) {
          throw new BadRequestError(
            "Password must be at least 8 characters long",
          );
        }

        updateData.passwordHash = await bcrypt.hash(data.password, 12);
      }

      const updatedUser = await this.userRepository.updateUser(
        id,
        updateData,
      );

      return this.toUserResponse(updatedUser);
    } catch (error) {
      if (error instanceof Error && "statusCode" in error) {
        throw error;
      }

      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2002"
      ) {
        throw new ConflictError("Email is already in use");
      }

      throw new InternalError("Failed to update user");
    }
  }


  async deleteUser(id: string): Promise<{ message: string }> {
    try {
      const existingUser = await this.userRepository.findById(id);

      if (!existingUser) {
        throw new NotFoundError("User not found");
      }

      await this.userRepository.deleteUser(id);

      return { message: "User deleted successfully" };
    } catch (error) {
      if (error instanceof Error && "statusCode" in error) {
        throw error;
      }

      throw new InternalError("Failed to delete user");
    }
  }
}

export default UserService;