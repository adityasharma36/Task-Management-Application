import { api } from './client';
import type { Task, TaskStatus } from '../types';

export interface TaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  dueDate?: string | null;
}

function extractTasks(payload: unknown): Task[] {
  if (Array.isArray(payload)) return payload as Task[];
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.data)) return record.data as Task[];
    if (record.data && typeof record.data === 'object' && Array.isArray((record.data as Record<string, unknown>).tasks)) return (record.data as { tasks: Task[] }).tasks;
    if (Array.isArray(record.tasks)) return record.tasks as Task[];
  }
  return [];
}

function extractTask(payload: unknown): Task {
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const candidate = record.data && typeof record.data === 'object' && 'id' in record.data
      ? record.data : record.task && typeof record.task === 'object' ? record.task : record;
    return candidate as Task;
  }
  throw new Error('Unexpected task response');
}

export const tasksApi = {
  async list() { const response = await api.get('/tasks'); return extractTasks(response.data); },
  async create(input: TaskInput) { const response = await api.post('/tasks', input); return extractTask(response.data); },
  async update(id: string, input: Partial<TaskInput>) { const response = await api.patch(`/tasks/${encodeURIComponent(id)}`, input); return extractTask(response.data); },
  async remove(id: string) { await api.delete(`/tasks/${encodeURIComponent(id)}`); },
};
