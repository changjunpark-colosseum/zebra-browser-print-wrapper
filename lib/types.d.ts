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
export declare enum ZebraErrorCode {
    PNA_PERMISSION_DENIED = "PNA_PERMISSION_DENIED",
    BROWSERPRINT_NOT_RUNNING = "BROWSERPRINT_NOT_RUNNING",
    CONNECTION_TIMEOUT = "CONNECTION_TIMEOUT",
    NETWORK_ERROR = "NETWORK_ERROR",
    NO_PRINTER_FOUND = "NO_PRINTER_FOUND",
    NO_DEFAULT_PRINTER = "NO_DEFAULT_PRINTER",
    PRINTER_NOT_SET = "PRINTER_NOT_SET",
    PRINTER_OFFLINE = "PRINTER_OFFLINE",
    INVALID_RESPONSE = "INVALID_RESPONSE",
    PARSE_ERROR = "PARSE_ERROR",
    WRITE_FAILED = "WRITE_FAILED",
    READ_FAILED = "READ_FAILED",
    STATUS_CHECK_FAILED = "STATUS_CHECK_FAILED",
    UNKNOWN_ERROR = "UNKNOWN_ERROR"
}
export declare class ZebraError extends Error {
    code: ZebraErrorCode;
    originalError?: Error;
    constructor(message: string, code: ZebraErrorCode, originalError?: Error);
}
