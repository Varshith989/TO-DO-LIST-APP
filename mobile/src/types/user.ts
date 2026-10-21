export interface IUser {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: IUser;
  errors?: Array<{ field: string; message: string }>;
}
