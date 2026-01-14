export interface User {
  id: number;
  email: string;
  name: string | null;
  role: string;
  preferredCurrency: string;
}

export interface UpdateProfileDTO {
  name?: string;
  preferredCurrency?: string;
}

export interface AuthResponse {
  status: string;
  message: string;
  token?: string;
  data?: { user: User };
}

export interface UpdatePasswordDTO {
  currentPassword: string;
  newPassword: string;
  passwordConfirm: string;
}

export interface UpdatePasswordDTO {
  currentPassword: string;
  newPassword: string;
  passwordConfirm: string;
}
