export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  userId?: string;
}

export interface AuthResponse {
  success?: boolean;
  message?: string;
  data?: {
    user?: User;
    accessToken?: string;
  };
  user?: User;
  accessToken?: string;
}

export interface ApiErrorShape {
  message?: string;
  errors?: Array<{ field?: string; message: string }>;
}
