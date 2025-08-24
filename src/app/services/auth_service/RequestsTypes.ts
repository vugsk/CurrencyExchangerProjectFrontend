
export interface LoginRequest {
  password: string;
  email_or_login: string;
}

export interface RegistrationRequest {
  password: string;
  email: string;
  login: string;
}

export interface UpdateDataUserRequests {
  name: string;
  email: string;
  login: string;
  now_password: string;
  new_password: string;
  time_update: string;
}
