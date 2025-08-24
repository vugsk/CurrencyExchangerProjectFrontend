import {CodeResponseType} from '../../models/CodesErrorsTypes';

interface Page {
  message: string;
  name: string;
}

export interface IErrorPage {
  code: CodeResponseType;
  page: Page;
}

export interface ServerError {
  code: "";
  message: string;
  title: string;
}
