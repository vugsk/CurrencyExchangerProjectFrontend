
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

export interface User {
  email: string;
  name: string;
  telegramId: string;
}

export interface Currency {
  bank: string;
  symbol: string;
  sumCurrency: number;
}

export interface Crypt {
  fullName: string;
  name: string;
  sumCrypto: number;
}

export interface ExchangeTransfer {
  cryptoWallet: string;
  bankCard: string;
  crypt: Crypt;
  currency: Currency;
}

export interface CreateRequest_Request {
  user: User;
  transfer: ExchangeTransfer;
}

export interface CreateRequestRegistration_Request {
  telegramId: string;
  transfer: ExchangeTransfer;
}

export interface CodeEmailRequest {
  email: string;
}

export interface CodeRequest {
  code: string;
}

export interface NewPasswordRequest {
  new_password: string;
}

export interface RecoveryPasswordRequest {
  email_or_login: string;
}

