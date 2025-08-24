
export enum CodeResponseType {
  USER_SUCCESS = 'USER_SUCCESS',
  USER_EXISTING = 'USER_EXISTING',
  USER_LOGIN_EXISTING = 'USER_LOGIN_EXISTING',
  USER_EMAIL_EXISTING = 'USER_EMAIL_EXISTING',
  USER_LOGOUT = 'USER_LOGOUT',
  USER_LOGIN_SUCCESS = 'USER_LOGIN_SUCCESS',
  USER_SESSION_ID_VALID = 'USER_SESSION_ID_VALID',
  USER_LOGOUT_SESSION_ID_INVALID = 'USER_LOGOUT_SESSION_ID_INVALID',
}

export interface ErrorResponse {
  status: number;
  code: CodeResponseType;
  message: string;
}

interface UserType {
  id: string;
  name: string;
}

export interface LoginResponse {
  message: string;
  user: UserType;
  time: string;
}

export function IsCodeResponseType(code: CodeResponseType) {
  return code && (code === CodeResponseType.USER_EMAIL_EXISTING ||
         code === CodeResponseType.USER_EXISTING ||
         code === CodeResponseType.USER_LOGIN_EXISTING ||
         code === CodeResponseType.USER_LOGOUT ||
         code === CodeResponseType.USER_SUCCESS);
}

export function IsResponseServer(obj: any): obj is ErrorResponse {
  return obj && IsCodeResponseType(obj.code) &&
          typeof obj.message === 'string';
}
