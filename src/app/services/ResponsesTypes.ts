
enum CodeResponseType {
  USER_SUCCESS = 'USER_SUCCESS',
  USER_EXISTING = 'USER_EXISTING',
  USER_LOGIN_EXISTING = 'USER_LOGIN_EXISTING',
  USER_EMAIL_EXISTING = 'USER_EMAIL_EXISTING',
  USER_LOGOUT = 'USER_LOGOUT',
}

export interface ErrorResponseServer {
  message: string;
  code: CodeResponseType;
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

export function IsResponseServer(obj: any): obj is ErrorResponseServer {
  return obj && IsCodeResponseType(obj.code) &&
          typeof obj.message === 'string';
}
