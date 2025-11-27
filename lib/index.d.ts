import { Device, ConnectionStatus } from './types';
export default class ZebraBrowserPrintWrapper {
    device: Device;
    private connectionHealthy;
    private lastHealthCheck;
    private readonly HEALTH_CHECK_INTERVAL;
    /**
     * BrowserPrint 서비스 연결 상태를 확인합니다.
     * Chrome의 Private Network Access (PNA) 정책으로 인한 연결 문제를 미리 감지합니다.
     */
    checkConnection: () => Promise<ConnectionStatus>;
    /**
     * 주기적인 헬스체크를 통해 연결 상태를 유지합니다.
     */
    private shouldCheckHealth;
    getAvailablePrinters: () => Promise<Device[]>;
    getDefaultPrinter: () => Promise<Device>;
    setPrinter: (device: Device) => void;
    getPrinter: () => Device;
    cleanUpString: (str: string) => string;
    checkPrinterStatus: () => Promise<{
        isReadyToPrint: boolean;
        errors: string;
    }>;
    write: (data: string, retryWithFreshDevice?: boolean) => Promise<void>;
    read: (retryWithFreshDevice?: boolean) => Promise<string>;
    print: (text: string) => Promise<void>;
}
