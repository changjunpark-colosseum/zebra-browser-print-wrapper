"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("./constants");
var types_1 = require("./types");
var ZebraBrowserPrintWrapper = /** @class */ (function () {
    function ZebraBrowserPrintWrapper() {
        var _this = this;
        this.device = {};
        this.connectionHealthy = false;
        this.lastHealthCheck = 0;
        this.HEALTH_CHECK_INTERVAL = 30000; // 30초
        /**
         * BrowserPrint 서비스 연결 상태를 확인합니다.
         * Chrome의 Private Network Access (PNA) 정책으로 인한 연결 문제를 미리 감지합니다.
         */
        this.checkConnection = function () { return __awaiter(_this, void 0, void 0, function () {
            var endpoint, controller_1, timeoutId, config, res, error_1, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        endpoint = constants_1.API_URL + 'available';
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        controller_1 = new AbortController();
                        timeoutId = setTimeout(function () { return controller_1.abort(); }, 5000);
                        config = {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'text/plain;charset=UTF-8',
                            },
                            cache: 'no-store',
                            signal: controller_1.signal,
                            // PNA 정책 대응을 위한 옵션
                            mode: 'cors',
                            credentials: 'omit',
                        };
                        return [4 /*yield*/, fetch(endpoint, config)];
                    case 2:
                        res = _a.sent();
                        clearTimeout(timeoutId);
                        if (res.ok) {
                            this.connectionHealthy = true;
                            this.lastHealthCheck = Date.now();
                            return [2 /*return*/, {
                                    connected: true,
                                    message: 'BrowserPrint 서비스에 정상적으로 연결되었습니다.',
                                }];
                        }
                        return [2 /*return*/, {
                                connected: false,
                                message: "\uC5F0\uACB0 \uC2E4\uD328: " + res.status + " " + res.statusText,
                            }];
                    case 3:
                        error_1 = _a.sent();
                        this.connectionHealthy = false;
                        // PNA 관련 에러 감지
                        if (error_1.name === 'TypeError' && error_1.message.includes('Failed to fetch')) {
                            return [2 /*return*/, {
                                    connected: false,
                                    message: 'Chrome 로컬 네트워크 접근 권한이 필요합니다. 브라우저에서 권한 요청 팝업을 확인해주세요. 팝업이 나타나지 않는다면 브라우저 캐시를 삭제하고 다시 시도해주세요.',
                                }];
                        }
                        if (error_1.name === 'AbortError') {
                            return [2 /*return*/, {
                                    connected: false,
                                    message: 'BrowserPrint 서비스에 연결할 수 없습니다. Zebra BrowserPrint가 설치되어 있고 실행 중인지 확인해주세요.',
                                }];
                        }
                        errorMessage = error_1 instanceof Error ? error_1.message : String(error_1);
                        return [2 /*return*/, {
                                connected: false,
                                message: "\uC5F0\uACB0 \uC624\uB958: " + errorMessage,
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        this.getAvailablePrinters = function () { return __awaiter(_this, void 0, void 0, function () {
            var healthCheck, config, endpoint, res, data, parseError_1, error_2, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.shouldCheckHealth()) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.checkConnection()];
                    case 1:
                        healthCheck = _a.sent();
                        if (!healthCheck.connected) {
                            throw new Error(healthCheck.message);
                        }
                        _a.label = 2;
                    case 2:
                        config = {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'text/plain;charset=UTF-8',
                            },
                            cache: 'no-store',
                            mode: 'cors',
                            credentials: 'omit',
                        };
                        endpoint = constants_1.API_URL + 'available';
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 9, , 10]);
                        return [4 /*yield*/, fetch(endpoint, config)];
                    case 4:
                        res = _a.sent();
                        if (!res.ok) {
                            throw new Error("\uC694\uCCAD \uC2E4\uD328: " + res.status + " " + res.statusText);
                        }
                        data = void 0;
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, res.json()];
                    case 6:
                        data = _a.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        parseError_1 = _a.sent();
                        throw new Error('BrowserPrint 응답 형식이 올바르지 않습니다. BrowserPrint를 다시 시작해주세요.');
                    case 8:
                        if (data && data !== undefined && data.printer && data.printer !== undefined && data.printer.length > 0) {
                            this.connectionHealthy = true;
                            this.lastHealthCheck = Date.now();
                            return [2 /*return*/, data.printer];
                        }
                        throw new Error('사용 가능한 프린터가 없습니다. 프린터가 연결되어 있고 전원이 켜져 있는지 확인해주세요.');
                    case 9:
                        error_2 = _a.sent();
                        this.connectionHealthy = false;
                        // PNA 관련 에러 감지
                        if (error_2.name === 'TypeError' && error_2.message.includes('Failed to fetch')) {
                            throw new Error('Chrome 로컬 네트워크 접근 권한이 필요합니다. 브라우저 캐시를 삭제하거나 권한을 다시 허용해주세요.');
                        }
                        errorMessage = error_2 instanceof Error ? error_2.message : String(error_2);
                        throw new Error(errorMessage);
                    case 10: return [2 /*return*/];
                }
            });
        }); };
        this.getDefaultPrinter = function () { return __awaiter(_this, void 0, void 0, function () {
            var healthCheck, config, endpoint, res, data, deviceRaw, name_1, deviceType, connection, uid, provider, manufacturer, error_3, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.shouldCheckHealth()) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.checkConnection()];
                    case 1:
                        healthCheck = _a.sent();
                        if (!healthCheck.connected) {
                            throw new Error(healthCheck.message);
                        }
                        _a.label = 2;
                    case 2:
                        config = {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'text/plain;charset=UTF-8',
                            },
                            cache: 'no-store',
                            mode: 'cors',
                            credentials: 'omit',
                        };
                        endpoint = constants_1.API_URL + 'default';
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 6, , 7]);
                        return [4 /*yield*/, fetch(endpoint, config)];
                    case 4:
                        res = _a.sent();
                        if (!res.ok) {
                            throw new Error("\uC694\uCCAD \uC2E4\uD328: " + res.status + " " + res.statusText);
                        }
                        return [4 /*yield*/, res.text()];
                    case 5:
                        data = _a.sent();
                        if (!data || data.trim() === '') {
                            throw new Error('BrowserPrint로부터 응답을 받지 못했습니다. BrowserPrint가 정상 실행 중인지 확인해주세요.');
                        }
                        if (data && data !== undefined && typeof data !== 'object' && data.split('\n\t').length === 7) {
                            deviceRaw = data.split('\n\t');
                            try {
                                name_1 = this.cleanUpString(deviceRaw[1]);
                                deviceType = this.cleanUpString(deviceRaw[2]);
                                connection = this.cleanUpString(deviceRaw[3]);
                                uid = this.cleanUpString(deviceRaw[4]);
                                provider = this.cleanUpString(deviceRaw[5]);
                                manufacturer = this.cleanUpString(deviceRaw[6]);
                                this.connectionHealthy = true;
                                this.lastHealthCheck = Date.now();
                                return [2 /*return*/, {
                                        connection: connection,
                                        deviceType: deviceType,
                                        manufacturer: manufacturer,
                                        name: name_1,
                                        provider: provider,
                                        uid: uid,
                                        version: 0,
                                    }];
                            }
                            catch (parseError) {
                                throw new Error('프린터 정보 파싱 중 오류가 발생했습니다. BrowserPrint를 다시 시작해주세요.');
                            }
                        }
                        throw new Error('기본 프린터가 설정되어 있지 않습니다. Windows에서 기본 프린터를 설정해주세요.');
                    case 6:
                        error_3 = _a.sent();
                        this.connectionHealthy = false;
                        // PNA 관련 에러 감지
                        if (error_3.name === 'TypeError' && error_3.message.includes('Failed to fetch')) {
                            throw new Error('Chrome 로컬 네트워크 접근 권한이 필요합니다. 브라우저 캐시를 삭제하거나 권한을 다시 허용해주세요.');
                        }
                        errorMessage = error_3 instanceof Error ? error_3.message : String(error_3);
                        throw new Error(errorMessage);
                    case 7: return [2 /*return*/];
                }
            });
        }); };
        this.setPrinter = function (device) {
            _this.device = device;
        };
        this.getPrinter = function () {
            return _this.device;
        };
        this.cleanUpString = function (str) {
            var arr = str.split(':');
            var result = arr[1].trim();
            return result;
        };
        this.checkPrinterStatus = function () { return __awaiter(_this, void 0, void 0, function () {
            var result, errors, isReadyToPrint, isError, media, head, pause, error_4, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // 프린터 설정 확인
                        if (!this.device || !this.device.uid) {
                            throw new types_1.ZebraError('프린터가 설정되지 않았습니다. setPrinter()를 먼저 호출해주세요.', types_1.ZebraErrorCode.PRINTER_NOT_SET);
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.write('~HQES')];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.read()];
                    case 3:
                        result = _a.sent();
                        // 응답 길이 검증
                        if (!result || result.length < 100) {
                            throw new Error('프린터 상태 응답이 올바르지 않습니다. 프린터가 온라인 상태인지 확인해주세요.');
                        }
                        errors = [];
                        isReadyToPrint = false;
                        isError = result.charAt(70);
                        media = result.charAt(88);
                        head = result.charAt(87);
                        pause = result.charAt(84);
                        isReadyToPrint = isError === '0';
                        switch (media) {
                            case '1':
                                errors.push('Paper out');
                                break;
                            case '2':
                                errors.push('Ribbon Out');
                                break;
                            case '4':
                                errors.push('Media Door Open');
                                break;
                            case '8':
                                errors.push('Cutter Fault');
                                break;
                            default:
                                break;
                        }
                        switch (head) {
                            case '1':
                                errors.push('Printhead Overheating');
                                break;
                            case '2':
                                errors.push('Motor Overheating');
                                break;
                            case '4':
                                errors.push('Printhead Fault');
                                break;
                            case '8':
                                errors.push('Incorrect Printhead');
                                break;
                            default:
                                break;
                        }
                        if (pause === '1')
                            errors.push('Printer Paused');
                        if (!isReadyToPrint && errors.length === 0)
                            errors.push('Error: Unknown Error');
                        return [2 /*return*/, {
                                isReadyToPrint: isReadyToPrint,
                                errors: errors.join(),
                            }];
                    case 4:
                        error_4 = _a.sent();
                        // write/read 에러는 이미 처리되어 던져짐
                        if (error_4.message.includes('프린터가 설정되지') ||
                            error_4.message.includes('Chrome 로컬 네트워크') ||
                            error_4.message.includes('프린터 상태 응답')) {
                            throw error_4;
                        }
                        errorMessage = error_4 instanceof Error ? error_4.message : String(error_4);
                        throw new Error("\uD504\uB9B0\uD130 \uC0C1\uD0DC \uD655\uC778 \uC911 \uC624\uB958 \uBC1C\uC0DD: " + errorMessage);
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        this.write = function (data, retryWithFreshDevice) {
            if (retryWithFreshDevice === void 0) { retryWithFreshDevice = true; }
            return __awaiter(_this, void 0, void 0, function () {
                var endpoint, myData, config, res, availablePrinters, freshDevice, i, refreshError_1, error_5, errorMessage;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 6, , 7]);
                            // Ensure device is set before writing
                            if (!this.device || !this.device.uid) {
                                throw new Error('프린터가 설정되지 않았습니다. setPrinter()를 먼저 호출해주세요.');
                            }
                            endpoint = constants_1.API_URL + 'write';
                            myData = {
                                device: this.device,
                                data: data,
                            };
                            config = {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'text/plain;charset=UTF-8',
                                },
                                body: JSON.stringify(myData),
                                mode: 'cors',
                                credentials: 'omit',
                            };
                            return [4 /*yield*/, fetch(endpoint, config)];
                        case 1:
                            res = _a.sent();
                            if (!(!res.ok && retryWithFreshDevice && this.device.name)) return [3 /*break*/, 5];
                            _a.label = 2;
                        case 2:
                            _a.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, this.getAvailablePrinters()];
                        case 3:
                            availablePrinters = _a.sent();
                            freshDevice = void 0;
                            for (i = 0; i < availablePrinters.length; i++) {
                                if (availablePrinters[i].name === this.device.name) {
                                    freshDevice = availablePrinters[i];
                                    break;
                                }
                            }
                            if (freshDevice) {
                                this.setPrinter(freshDevice);
                                // Retry once with fresh device info
                                return [2 /*return*/, this.write(data, false)];
                            }
                            return [3 /*break*/, 5];
                        case 4:
                            refreshError_1 = _a.sent();
                            return [3 /*break*/, 5];
                        case 5:
                            if (!res.ok) {
                                throw new Error("\uC4F0\uAE30 \uC2E4\uD328: " + res.status + " " + res.statusText);
                            }
                            this.connectionHealthy = true;
                            this.lastHealthCheck = Date.now();
                            return [3 /*break*/, 7];
                        case 6:
                            error_5 = _a.sent();
                            // PNA 관련 에러 감지
                            if (error_5.name === 'TypeError' && error_5.message.includes('Failed to fetch')) {
                                this.connectionHealthy = false;
                                throw new Error('Chrome 로컬 네트워크 접근 권한이 필요합니다. 브라우저 캐시를 삭제하거나 권한을 다시 허용해주세요.');
                            }
                            errorMessage = error_5 instanceof Error ? error_5.message : String(error_5);
                            throw new Error(errorMessage);
                        case 7: return [2 /*return*/];
                    }
                });
            });
        };
        this.read = function (retryWithFreshDevice) {
            if (retryWithFreshDevice === void 0) { retryWithFreshDevice = true; }
            return __awaiter(_this, void 0, void 0, function () {
                var endpoint, myData, config, res, availablePrinters, freshDevice, i, refreshError_2, data, error_6, errorMessage;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 7, , 8]);
                            // Ensure device is set before reading
                            if (!this.device || !this.device.uid) {
                                throw new Error('프린터가 설정되지 않았습니다. setPrinter()를 먼저 호출해주세요.');
                            }
                            endpoint = constants_1.API_URL + 'read';
                            myData = {
                                device: this.device,
                            };
                            config = {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'text/plain;charset=UTF-8',
                                },
                                body: JSON.stringify(myData),
                                mode: 'cors',
                                credentials: 'omit',
                            };
                            return [4 /*yield*/, fetch(endpoint, config)];
                        case 1:
                            res = _a.sent();
                            if (!(!res.ok && retryWithFreshDevice && this.device.name)) return [3 /*break*/, 5];
                            _a.label = 2;
                        case 2:
                            _a.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, this.getAvailablePrinters()];
                        case 3:
                            availablePrinters = _a.sent();
                            freshDevice = void 0;
                            for (i = 0; i < availablePrinters.length; i++) {
                                if (availablePrinters[i].name === this.device.name) {
                                    freshDevice = availablePrinters[i];
                                    break;
                                }
                            }
                            if (freshDevice) {
                                this.setPrinter(freshDevice);
                                // Retry once with fresh device info
                                return [2 /*return*/, this.read(false)];
                            }
                            return [3 /*break*/, 5];
                        case 4:
                            refreshError_2 = _a.sent();
                            return [3 /*break*/, 5];
                        case 5:
                            if (!res.ok) {
                                throw new Error("\uC77D\uAE30 \uC2E4\uD328: " + res.status + " " + res.statusText);
                            }
                            return [4 /*yield*/, res.text()];
                        case 6:
                            data = _a.sent();
                            this.connectionHealthy = true;
                            this.lastHealthCheck = Date.now();
                            return [2 /*return*/, data];
                        case 7:
                            error_6 = _a.sent();
                            // PNA 관련 에러 감지
                            if (error_6.name === 'TypeError' && error_6.message.includes('Failed to fetch')) {
                                this.connectionHealthy = false;
                                throw new Error('Chrome 로컬 네트워크 접근 권한이 필요합니다. 브라우저 캐시를 삭제하거나 권한을 다시 허용해주세요.');
                            }
                            errorMessage = error_6 instanceof Error ? error_6.message : String(error_6);
                            throw new Error(errorMessage);
                        case 8: return [2 /*return*/];
                    }
                });
            });
        };
        this.print = function (text) { return __awaiter(_this, void 0, void 0, function () {
            var error_7, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.write(text)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _a.sent();
                        errorMessage = error_7 instanceof Error ? error_7.message : String(error_7);
                        throw new Error(errorMessage);
                    case 3: return [2 /*return*/];
                }
            });
        }); };
    }
    /**
     * 주기적인 헬스체크를 통해 연결 상태를 유지합니다.
     */
    ZebraBrowserPrintWrapper.prototype.shouldCheckHealth = function () {
        return !this.connectionHealthy || Date.now() - this.lastHealthCheck > this.HEALTH_CHECK_INTERVAL;
    };
    return ZebraBrowserPrintWrapper;
}());
exports.default = ZebraBrowserPrintWrapper;
