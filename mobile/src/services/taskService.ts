import api from './api';
import { ITask, CreateTaskDTO, UpdateTaskDTO, TaskFilter, TaskSortOption } from '../types/task';

export interface GetTasksParams {
  filter?: TaskFilter;
  category?: string;
  search?: string;
  sort?: TaskSortOption;
}

export const taskService = {
  async getTasks(params?: GetTasksParams): Promise<ITask[]> {
    const response = await api.get<{ success: boolean; count: number; tasks: ITask[] }>('/tasks', {
      params,
    });
    return response.data.tasks;
  },

  async getTaskById(id: string): Promise<ITask> {
    const response = await api.get<{ success: boolean; task: ITask }>(`/tasks/${id}`);
    return response.data.task;
  },

  async createTask(dto: CreateTaskDTO): Promise<ITask> {
    const response = await api.post<{ success: boolean; task: ITask }>('/tasks', dto);
    return response.data.task;
  },

  async updateTask(id: string, dto: UpdateTaskDTO): Promise<ITask> {
    const response = await api.put<{ success: boolean; task: ITask }>(`/tasks/${id}`, dto);
    return response.data.task;
  },

  async toggleTask(id: string): Promise<ITask> {
    const response = await api.patch<{ success: boolean; task: ITask }>(`/tasks/${id}/toggle`);
    return response.data.task;
  },

  async deleteTask(id: string): Promise<string> {
    const response = await api.delete<{ success: boolean; deletedTaskId: string }>(`/tasks/${id}`);
    return response.data.deletedTaskId;
  },
};
