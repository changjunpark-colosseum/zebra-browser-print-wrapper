import { API_URL } from './constants';

import { Device, ConnectionStatus, PrinterStatus } from './types';

export default class ZebraBrowserPrintWrapper {
  device: Device = {} as Device;

  checkConnection = async (): Promise<ConnectionStatus> => {
    const endpoint = API_URL + 'available';

    try {
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'text/plain;charset=UTF-8',
        },
      });

      if (res.ok) {
        return {
          connected: true,
          message: 'Connected',
        };
      }

      return {
        connected: false,
        message: `Connection failed: ${res.status}`,
      };
    } catch (error: any) {
      return {
        connected: false,
        message: error.message || 'Connection error',
      };
    }
  };

  getAvailablePrinters = async (): Promise<Device[]> => {
    const endpoint = API_URL + 'available';

    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8',
      },
    });

    if (!res.ok) {
      throw new Error(`Request failed: ${res.status}`);
    }

    const data = await res.json();

    if (data?.printer?.length > 0) {
      return data.printer as Device[];
    }

    throw new Error('No printers found');
  };

  getDefaultPrinter = async (): Promise<Device> => {
    const endpoint = API_URL + 'default';

    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8',
      },
    });

    if (!res.ok) {
      throw new Error(`Request failed: ${res.status}`);
    }

    const data = await res.text();

    if (data && data.split('\n\t').length === 7) {
      const deviceRaw = data.split('\n\t');

      return {
        connection: this.cleanUpString(deviceRaw[3]),
        deviceType: this.cleanUpString(deviceRaw[2]),
        manufacturer: this.cleanUpString(deviceRaw[6]),
        name: this.cleanUpString(deviceRaw[1]),
        provider: this.cleanUpString(deviceRaw[5]),
        uid: this.cleanUpString(deviceRaw[4]),
        version: 0,
      };
    }

    throw new Error('No default printer');
  };

  setPrinter = (device: Device) => {
    this.device = device;
  };

  getPrinter = (): Device => {
    return this.device;
  };

  cleanUpString = (str: string): string => {
    const arr = str.split(':');
    return arr[1].trim();
  };

  checkPrinterStatus = async (): Promise<PrinterStatus> => {
    if (!this.device?.uid) {
      throw new Error('Printer not set');
    }

    await this.write('~HQES');
    const result = await this.read();

    const errors = [];
    const isError = result.charAt(70);
    const media = result.charAt(88);
    const head = result.charAt(87);
    const pause = result.charAt(84);

    const isReadyToPrint = isError === '0';

    if (media === '1') errors.push('Paper out');
    if (media === '2') errors.push('Ribbon Out');
    if (media === '4') errors.push('Media Door Open');
    if (media === '8') errors.push('Cutter Fault');
    if (head === '1') errors.push('Printhead Overheating');
    if (head === '2') errors.push('Motor Overheating');
    if (head === '4') errors.push('Printhead Fault');
    if (head === '8') errors.push('Incorrect Printhead');
    if (pause === '1') errors.push('Printer Paused');
    if (!isReadyToPrint && errors.length === 0) errors.push('Unknown Error');

    return {
      isReadyToPrint,
      errors: errors.join(', '),
    };
  };

  write = async (data: string): Promise<void> => {
    if (!this.device?.uid) {
      throw new Error('Printer not set');
    }

    const endpoint = API_URL + 'write';

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8',
      },
      body: JSON.stringify({
        device: this.device,
        data,
      }),
    });

    if (!res.ok) {
      throw new Error(`Write failed: ${res.status}`);
    }
  };

  read = async (): Promise<string> => {
    if (!this.device?.uid) {
      throw new Error('Printer not set');
    }

    const endpoint = API_URL + 'read';

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8',
      },
      body: JSON.stringify({
        device: this.device,
      }),
    });

    if (!res.ok) {
      throw new Error(`Read failed: ${res.status}`);
    }

    return await res.text();
  };

  print = async (text: string): Promise<void> => {
    await this.write(text);
  };
}
