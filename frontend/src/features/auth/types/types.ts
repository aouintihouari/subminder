export interface User {
  id: number;
  email: string;
  name: string | null;
  role: string;
}

export interface AuthResponse {
  status: string;
  message: string;
  token?: string;
  data?: {
    user: User;
  };
}
