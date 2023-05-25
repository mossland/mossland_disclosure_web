import StatusCodes from 'http-status-codes';

export default class ServerError extends Error {
  public code: number;
  public errorObj: any;
  constructor(code: number, message: string, errorObj?: any) {
    super(message);
    this.code = code;
    if (process.env.NODE_ENV === 'development') {
        this.errorObj = errorObj;
    }
  }
}