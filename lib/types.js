"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZebraError = exports.ZebraErrorCode = void 0;
var ZebraErrorCode;
(function (ZebraErrorCode) {
    // 연결 관련
    ZebraErrorCode["PNA_PERMISSION_DENIED"] = "PNA_PERMISSION_DENIED";
    ZebraErrorCode["BROWSERPRINT_NOT_RUNNING"] = "BROWSERPRINT_NOT_RUNNING";
    ZebraErrorCode["CONNECTION_TIMEOUT"] = "CONNECTION_TIMEOUT";
    ZebraErrorCode["NETWORK_ERROR"] = "NETWORK_ERROR";
    // 프린터 관련
    ZebraErrorCode["NO_PRINTER_FOUND"] = "NO_PRINTER_FOUND";
    ZebraErrorCode["NO_DEFAULT_PRINTER"] = "NO_DEFAULT_PRINTER";
    ZebraErrorCode["PRINTER_NOT_SET"] = "PRINTER_NOT_SET";
    ZebraErrorCode["PRINTER_OFFLINE"] = "PRINTER_OFFLINE";
    // 데이터 관련
    ZebraErrorCode["INVALID_RESPONSE"] = "INVALID_RESPONSE";
    ZebraErrorCode["PARSE_ERROR"] = "PARSE_ERROR";
    // 작업 관련
    ZebraErrorCode["WRITE_FAILED"] = "WRITE_FAILED";
    ZebraErrorCode["READ_FAILED"] = "READ_FAILED";
    ZebraErrorCode["STATUS_CHECK_FAILED"] = "STATUS_CHECK_FAILED";
    // 일반
    ZebraErrorCode["UNKNOWN_ERROR"] = "UNKNOWN_ERROR";
})(ZebraErrorCode = exports.ZebraErrorCode || (exports.ZebraErrorCode = {}));
var ZebraError = /** @class */ (function (_super) {
    __extends(ZebraError, _super);
    function ZebraError(message, code, originalError) {
        var _this = _super.call(this, message) || this;
        _this.name = 'ZebraError';
        _this.code = code;
        _this.originalError = originalError;
        // TypeScript에서 Error를 상속할 때 필요
        Object.setPrototypeOf(_this, ZebraError.prototype);
        return _this;
    }
    return ZebraError;
}(Error));
exports.ZebraError = ZebraError;
