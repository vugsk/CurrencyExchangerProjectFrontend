import {CodeResponseType, IsCodeResponseType} from "../../models/CodesErrorsTypes";



export interface ErrorResponse {
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

export function IsResponseServer(obj: any): obj is ErrorResponse {
  return obj && IsCodeResponseType(obj.code) &&
          typeof obj.message === 'string';
}
