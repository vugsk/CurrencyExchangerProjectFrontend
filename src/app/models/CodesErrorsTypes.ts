
export enum CodeResponseType {
  USER_SUCCESS = 'USER_SUCCESS',
  USER_EXISTING = 'USER_EXISTING',
  USER_LOGIN_EXISTING = 'USER_LOGIN_EXISTING',
  USER_EMAIL_EXISTING = 'USER_EMAIL_EXISTING',
  USER_LOGOUT = 'USER_LOGOUT',
  USER_SESSION_ID_VALID = 'USER_SESSION_ID_VALID',
}

export function IsCodeResponseType(code: CodeResponseType) {
  return code && (code === CodeResponseType.USER_EMAIL_EXISTING ||
    code === CodeResponseType.USER_EXISTING ||
    code === CodeResponseType.USER_LOGIN_EXISTING ||
    code === CodeResponseType.USER_LOGOUT ||
    code === CodeResponseType.USER_SUCCESS);
}
