import { API_URL } from './constants';

import { Device, ConnectionStatus, PrinterStatus, ZebraError, ZebraErrorCode } from './types';

export default class ZebraBrowserPrintWrapper {
  device: Device = {} as Device;
  private connectionHealthy: boolean = false;
  private lastHealthCheck: number = 0;
  private readonly HEALTH_CHECK_INTERVAL = 30000; // 30초

  /**
   * BrowserPrint 서비스 연결 상태를 확인합니다.
   * Chrome의 Private Network Access (PNA) 정책으로 인한 연결 문제를 미리 감지합니다.
   */
  checkConnection = async (): Promise<ConnectionStatus> => {
    const endpoint = API_URL + 'available';

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const config: RequestInit = {
        method: 'GET',
        headers: {
          'Content-Type': 'text/plain;charset=UTF-8',
        },
        cache: 'no-store' as RequestCache,
        signal: controller.signal,
        // PNA 정책 대응을 위한 옵션
        mode: 'cors',
        credentials: 'omit',
      };

      const res = await fetch(endpoint, config);
      clearTimeout(timeoutId);

      if (res.ok) {
        this.connectionHealthy = true;
        this.lastHealthCheck = Date.now();
        return {
          connected: true,
          message: 'BrowserPrint 서비스에 정상적으로 연결되었습니다.',
        };
      }

      return {
        connected: false,
        message: `연결 실패: ${res.status} ${res.statusText}`,
      };
    } catch (error: any) {
      this.connectionHealthy = false;

      // PNA 관련 에러 감지
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        return {
          connected: false,
          message:
            'Chrome 로컬 네트워크 접근 권한이 필요합니다. 브라우저에서 권한 요청 팝업을 확인해주세요. 팝업이 나타나지 않는다면 브라우저 캐시를 삭제하고 다시 시도해주세요.',
        };
      }

      if (error.name === 'AbortError') {
        return {
          connected: false,
          message:
            'BrowserPrint 서비스에 연결할 수 없습니다. Zebra BrowserPrint가 설치되어 있고 실행 중인지 확인해주세요.',
        };
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        connected: false,
        message: `연결 오류: ${errorMessage}`,
      };
    }
  };

  /**
   * 주기적인 헬스체크를 통해 연결 상태를 유지합니다.
   */
  private shouldCheckHealth(): boolean {
    return !this.connectionHealthy || Date.now() - this.lastHealthCheck > this.HEALTH_CHECK_INTERVAL;
  }

  getAvailablePrinters = async (): Promise<Device[]> => {
    // 헬스체크 수행
    if (this.shouldCheckHealth()) {
      const healthCheck = await this.checkConnection();
      if (!healthCheck.connected) {
        throw new Error(healthCheck.message);
      }
    }

    const config: RequestInit = {
      method: 'GET',
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8',
      },
      cache: 'no-store' as RequestCache,
      mode: 'cors',
      credentials: 'omit',
    };

    const endpoint = API_URL + 'available';

    try {
      const res = await fetch(endpoint, config);

      if (!res.ok) {
        throw new Error(`요청 실패: ${res.status} ${res.statusText}`);
      }

      let data;
      try {
        data = await res.json();
      } catch (parseError) {
        throw new Error('BrowserPrint 응답 형식이 올바르지 않습니다. BrowserPrint를 다시 시작해주세요.');
      }

      if (data && data !== undefined && data.printer && data.printer !== undefined && data.printer.length > 0) {
        this.connectionHealthy = true;
        this.lastHealthCheck = Date.now();
        return data.printer as Device[];
      }

      throw new Error('사용 가능한 프린터가 없습니다. 프린터가 연결되어 있고 전원이 켜져 있는지 확인해주세요.');
    } catch (error: any) {
      this.connectionHealthy = false;

      // PNA 관련 에러 감지
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error(
          'Chrome 로컬 네트워크 접근 권한이 필요합니다. 브라우저 캐시를 삭제하거나 권한을 다시 허용해주세요.',
        );
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(errorMessage);
    }
  };

  getDefaultPrinter = async (): Promise<Device> => {
    // 헬스체크 수행
    if (this.shouldCheckHealth()) {
      const healthCheck = await this.checkConnection();
      if (!healthCheck.connected) {
        throw new Error(healthCheck.message);
      }
    }

    const config: RequestInit = {
      method: 'GET',
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8',
      },
      cache: 'no-store' as RequestCache,
      mode: 'cors',
      credentials: 'omit',
    };

    const endpoint = API_URL + 'default';

    try {
      const res = await fetch(endpoint, config);

      if (!res.ok) {
        throw new Error(`요청 실패: ${res.status} ${res.statusText}`);
      }

      const data = await res.text();

      if (!data || data.trim() === '') {
        throw new Error('BrowserPrint로부터 응답을 받지 못했습니다. BrowserPrint가 정상 실행 중인지 확인해주세요.');
      }

      if (data && data !== undefined && typeof data !== 'object' && data.split('\n\t').length === 7) {
        const deviceRaw = data.split('\n\t');

        try {
          const name = this.cleanUpString(deviceRaw[1]);
          const deviceType = this.cleanUpString(deviceRaw[2]);
          const connection = this.cleanUpString(deviceRaw[3]);
          const uid = this.cleanUpString(deviceRaw[4]);
          const provider = this.cleanUpString(deviceRaw[5]);
          const manufacturer = this.cleanUpString(deviceRaw[6]);

          this.connectionHealthy = true;
          this.lastHealthCheck = Date.now();

          return {
            connection,
            deviceType,
            manufacturer,
            name,
            provider,
            uid,
            version: 0,
          };
        } catch (parseError) {
          throw new Error('프린터 정보 파싱 중 오류가 발생했습니다. BrowserPrint를 다시 시작해주세요.');
        }
      }

      throw new Error('기본 프린터가 설정되어 있지 않습니다. Windows에서 기본 프린터를 설정해주세요.');
    } catch (error: any) {
      this.connectionHealthy = false;

      // PNA 관련 에러 감지
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error(
          'Chrome 로컬 네트워크 접근 권한이 필요합니다. 브라우저 캐시를 삭제하거나 권한을 다시 허용해주세요.',
        );
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(errorMessage);
    }
  };

  setPrinter = (device: Device) => {
    this.device = device;
  };

  getPrinter = (): Device => {
    return this.device;
  };

  cleanUpString = (str: string): string => {
    const arr = str.split(':');
    const result = arr[1].trim();
    return result;
  };

  checkPrinterStatus = async (): Promise<PrinterStatus> => {
    // 프린터 설정 확인
    if (!this.device || !this.device.uid) {
      throw new ZebraError(
        '프린터가 설정되지 않았습니다. setPrinter()를 먼저 호출해주세요.',
        ZebraErrorCode.PRINTER_NOT_SET,
      );
    }

    try {
      await this.write('~HQES');
      const result = await this.read();

      // 응답 길이 검증
      if (!result || result.length < 100) {
        throw new Error('프린터 상태 응답이 올바르지 않습니다. 프린터가 온라인 상태인지 확인해주세요.');
      }

      const errors = [];
      let isReadyToPrint = false;

      const isError = result.charAt(70);
      const media = result.charAt(88);
      const head = result.charAt(87);
      const pause = result.charAt(84);

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

      if (pause === '1') errors.push('Printer Paused');

      if (!isReadyToPrint && errors.length === 0) errors.push('Error: Unknown Error');

      return {
        isReadyToPrint,
        errors: errors.join(),
      };
    } catch (error: any) {
      // write/read 에러는 이미 처리되어 던져짐
      if (
        error.message.includes('프린터가 설정되지') ||
        error.message.includes('Chrome 로컬 네트워크') ||
        error.message.includes('프린터 상태 응답')
      ) {
        throw error;
      }

      // 기타 예상치 못한 에러
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`프린터 상태 확인 중 오류 발생: ${errorMessage}`);
    }
  };

  write = async (data: string, retryWithFreshDevice = true): Promise<void> => {
    try {
      // Ensure device is set before writing
      if (!this.device || !this.device.uid) {
        throw new Error('프린터가 설정되지 않았습니다. setPrinter()를 먼저 호출해주세요.');
      }

      const endpoint = API_URL + 'write';

      const myData = {
        device: this.device,
        data,
      };

      const config: RequestInit = {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=UTF-8',
        },
        body: JSON.stringify(myData),
        mode: 'cors',
        credentials: 'omit',
      };

      const res = await fetch(endpoint, config);

      // If request fails and we haven't retried yet, refresh device info and retry
      if (!res.ok && retryWithFreshDevice && this.device.name) {
        try {
          // Try to get fresh printer info by name
          const availablePrinters = await this.getAvailablePrinters();
          let freshDevice: Device | undefined;
          for (let i = 0; i < availablePrinters.length; i++) {
            if (availablePrinters[i].name === this.device.name) {
              freshDevice = availablePrinters[i];
              break;
            }
          }
          if (freshDevice) {
            this.setPrinter(freshDevice);
            // Retry once with fresh device info
            return this.write(data, false);
          }
        } catch (refreshError) {
          // If refresh fails, throw original error
        }
      }

      // 프린트가 아예 연결되지 않은 경우
      if (!res.ok) {
        throw new Error(`쓰기 실패: ${res.status} ${res.statusText}`);
      }

      this.connectionHealthy = true;
      this.lastHealthCheck = Date.now();
    } catch (error: any) {
      // PNA 관련 에러 감지
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        this.connectionHealthy = false;
        throw new Error(
          'Chrome 로컬 네트워크 접근 권한이 필요합니다. 브라우저 캐시를 삭제하거나 권한을 다시 허용해주세요.',
        );
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(errorMessage);
    }
  };

  read = async (retryWithFreshDevice = true): Promise<string> => {
    try {
      // Ensure device is set before reading
      if (!this.device || !this.device.uid) {
        throw new Error('프린터가 설정되지 않았습니다. setPrinter()를 먼저 호출해주세요.');
      }

      const endpoint = API_URL + 'read';

      const myData = {
        device: this.device,
      };

      const config: RequestInit = {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=UTF-8',
        },
        body: JSON.stringify(myData),
        mode: 'cors',
        credentials: 'omit',
      };

      const res = await fetch(endpoint, config);

      // If request fails and we haven't retried yet, refresh device info and retry
      if (!res.ok && retryWithFreshDevice && this.device.name) {
        try {
          // Try to get fresh printer info by name
          const availablePrinters = await this.getAvailablePrinters();
          let freshDevice: Device | undefined;
          for (let i = 0; i < availablePrinters.length; i++) {
            if (availablePrinters[i].name === this.device.name) {
              freshDevice = availablePrinters[i];
              break;
            }
          }
          if (freshDevice) {
            this.setPrinter(freshDevice);
            // Retry once with fresh device info
            return this.read(false);
          }
        } catch (refreshError) {
          // If refresh fails, throw original error
        }
      }

      if (!res.ok) {
        throw new Error(`읽기 실패: ${res.status} ${res.statusText}`);
      }

      const data = await res.text();
      this.connectionHealthy = true;
      this.lastHealthCheck = Date.now();
      return data;
    } catch (error: any) {
      // PNA 관련 에러 감지
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        this.connectionHealthy = false;
        throw new Error(
          'Chrome 로컬 네트워크 접근 권한이 필요합니다. 브라우저 캐시를 삭제하거나 권한을 다시 허용해주세요.',
        );
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(errorMessage);
    }
  };

  print = async (text: string): Promise<void> => {
    try {
      await this.write(text);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(errorMessage);
    }
  };
}
