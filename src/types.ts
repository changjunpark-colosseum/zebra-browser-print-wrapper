export interface Device {
  name: string;
  deviceType: string;
  connection: string;
  uid: string;
  provider: string;
  manufacturer: string;
  version: number;
}

export interface ConnectionStatus {
  connected: boolean;
  message: string;
}

export interface PrinterStatus {
  isReadyToPrint: boolean;
  errors: string;
}

export enum ZebraErrorCode {
  // 연결 관련
  PNA_PERMISSION_DENIED = 'PNA_PERMISSION_DENIED',
  BROWSERPRINT_NOT_RUNNING = 'BROWSERPRINT_NOT_RUNNING',
  CONNECTION_TIMEOUT = 'CONNECTION_TIMEOUT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  
  // 프린터 관련
  NO_PRINTER_FOUND = 'NO_PRINTER_FOUND',
  NO_DEFAULT_PRINTER = 'NO_DEFAULT_PRINTER',
  PRINTER_NOT_SET = 'PRINTER_NOT_SET',
  PRINTER_OFFLINE = 'PRINTER_OFFLINE',
  
  // 데이터 관련
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  PARSE_ERROR = 'PARSE_ERROR',
  
  // 작업 관련
  WRITE_FAILED = 'WRITE_FAILED',
  READ_FAILED = 'READ_FAILED',
  STATUS_CHECK_FAILED = 'STATUS_CHECK_FAILED',
  
  // 일반
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export class ZebraError extends Error {
  code: ZebraErrorCode;
  originalError?: Error;

  constructor(message: string, code: ZebraErrorCode, originalError?: Error) {
    super(message);
    this.name = 'ZebraError';
    this.code = code;
    this.originalError = originalError;
    
    // TypeScript에서 Error를 상속할 때 필요
    Object.setPrototypeOf(this, ZebraError.prototype);
  }
}
