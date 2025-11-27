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
