export interface UserData {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

export interface AuthResponse {
  success: boolean;
  user: UserData;
  csrf_token: string;
  session_id: string;
  message: string;
  remember_me?: boolean;
}