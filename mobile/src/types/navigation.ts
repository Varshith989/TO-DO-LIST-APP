import { ITask } from './task';

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppStackParamList = {
  Home: undefined;
  CreateEditTask: { task?: ITask };
  TaskDetail: { taskId: string };
};
