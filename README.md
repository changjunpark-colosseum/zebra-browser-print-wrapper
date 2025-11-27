# Zebra Browser Print Wrapper

This package is a wrapper for the [Zebra Browser Print](https://www.zebra.com/la/es/support-downloads/printer-software/by-request-software.html#browser-print) and allows you to easily integrate your Zebra printers with web applications like (ReactJS).

## Install

Install the module in your project via YARN

```bash
yarn add zebra-browser-print-wrapper
```

Or NPM

```bash
npm i zebra-browser-print-wrapper
```

## Available Methods

##### **checkConnection()**

BrowserPrint 서비스 연결 상태를 확인합니다. Chrome의 Private Network Access (PNA) 정책으로 인한 연결 문제를 미리 감지할 수 있습니다.

**Returned object:**

```js
{
  connected: boolean;
  message: string;
}
```

**사용 시기:**

- 프린터 작업 전에 연결 상태를 미리 확인하고 싶을 때
- Chrome PNA 권한 문제로 인한 에러를 사용자에게 명확히 안내하고 싶을 때

##### **getAvailablePrinters()**

Return a list of the current available printers

##### **getDefaultPrinter()**

Gets the current default printer

##### **setPrinter()**

Sets the printer field

##### **getPrinter()**

Returns the printer field

##### **checkPrinterStatus()**

Returns an object indicating if the printer is ready and if not returns the error.

**Returned object:**

```js
{
  isReadyToPrint: boolean;
  errors: string;
}
```

**Possible errors:**

- Paper out
- Ribbon Out
- Media Door Open
- Cutter Fault
- Printhead Overheating
- Motor Overheating
- Printhead Fault
- Incorrect Printhead
- Printer Paused
- Unknown Error

##### **print(str)**

Prints a text string.

You can use this method with simple text or add a string using the [ZPL language](https://www.zebra.com/content/dam/zebra/manuals/printers/common/programming/zpl-zbi2-pm-en.pdf 'ZPL language')

## Chrome Private Network Access (PNA) 정책 관련 안내

Chrome은 보안을 위해 **Private Network Access (PNA)** 정책을 적용합니다. HTTPS 웹사이트에서 로컬 네트워크 장치(예: `http://localhost:9100`)에 접근할 때 사용자의 명시적인 권한이 필요합니다.

### 발생 가능한 문제

1. **초기 연결 시**: Chrome이 "로컬 네트워크 장치에 접근해도 되는지" 권한 팝업을 표시합니다. "허용"을 선택하면 정상 작동합니다.

2. **며칠 후 재접속 시**: 권한 정보가 만료되거나 무효화되면 다음과 같은 에러가 발생할 수 있습니다:
   - `Failed to fetch`
   - `net::ERR_FAILED`
   - CORS 에러처럼 보이는 메시지

### 해결 방법

**방법 1: 브라우저 캐시 삭제**

1. Chrome 설정 > 개인정보 및 보안 > 인터넷 사용 기록 삭제
2. "쿠키 및 기타 사이트 데이터"와 "캐시된 이미지 및 파일" 선택
3. 삭제 후 페이지를 새로고침하면 권한 팝업이 다시 표시됩니다

**방법 2: 사이트 권한 재설정**

1. 주소창 왼쪽의 자물쇠 아이콘 클릭
2. "사이트 설정" 선택
3. "권한 재설정" 클릭

이 패키지는 PNA 관련 에러를 자동으로 감지하여 명확한 에러 메시지를 제공합니다.

## Example

### 기본 사용법

```js
// Import the zebra-browser-print-wrapper package
const ZebraBrowserPrintWrapper = require('zebra-browser-print-wrapper');

const printBarcode = async (serial) => {
  try {
    // Create a new instance of the object
    const browserPrint = new ZebraBrowserPrintWrapper();

    // Select default printer
    const defaultPrinter = await browserPrint.getDefaultPrinter();

    // Set the printer
    browserPrint.setPrinter(defaultPrinter);

    // Check printer status
    const printerStatus = await browserPrint.checkPrinterStatus();

    // Check if the printer is ready
    if (printerStatus.isReadyToPrint) {
      // ZPL script to print a simple barcode
      const zpl = `^XA
                        ^BY2,2,100
                        ^FO20,20^BC^FD${serial}^FS
                        ^XZ`;

      await browserPrint.print(zpl);
      console.log('출력 완료!');
    } else {
      console.log('프린터 에러:', printerStatus.errors);
    }
  } catch (error) {
    console.error('출력 실패:', error.message);
  }
};

const serial = '0123456789';
printBarcode(serial);
```

### Chrome PNA 대응을 포함한 권장 사용법

```js
const ZebraBrowserPrintWrapper = require('zebra-browser-print-wrapper');

const printBarcodeWithConnectionCheck = async (serial) => {
  try {
    const browserPrint = new ZebraBrowserPrintWrapper();

    // 1. 먼저 BrowserPrint 서비스 연결 상태 확인
    const connectionStatus = await browserPrint.checkConnection();

    if (!connectionStatus.connected) {
      // PNA 권한 문제 또는 BrowserPrint 미실행 안내
      alert(connectionStatus.message);
      return;
    }

    console.log('연결 성공:', connectionStatus.message);

    // 2. 프린터 선택
    const defaultPrinter = await browserPrint.getDefaultPrinter();
    browserPrint.setPrinter(defaultPrinter);

    // 3. 프린터 상태 확인
    const printerStatus = await browserPrint.checkPrinterStatus();

    if (printerStatus.isReadyToPrint) {
      // 4. 출력 실행
      const zpl = `^XA
                        ^BY2,2,100
                        ^FO20,20^BC^FD${serial}^FS
                        ^XZ`;

      await browserPrint.print(zpl);
      console.log('출력 완료!');
    } else {
      console.error('프린터 에러:', printerStatus.errors);
      alert(`프린터 상태 확인 필요: ${printerStatus.errors}`);
    }
  } catch (error) {
    console.error('출력 실패:', error.message);

    // PNA 관련 에러는 명확한 메시지가 포함되어 있음
    alert(`출력 실패: ${error.message}`);
  }
};

const serial = '0123456789';
printBarcodeWithConnectionCheck(serial);
```

### React에서 사용하기

```jsx
import React, { useState } from 'react';
import ZebraBrowserPrintWrapper from 'zebra-browser-print-wrapper';

function PrintButton() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePrint = async () => {
    setLoading(true);
    setStatus('');

    try {
      const browserPrint = new ZebraBrowserPrintWrapper();

      // 연결 상태 확인
      const connectionStatus = await browserPrint.checkConnection();

      if (!connectionStatus.connected) {
        setStatus(`연결 실패: ${connectionStatus.message}`);
        setLoading(false);
        return;
      }

      // 프린터 설정
      const defaultPrinter = await browserPrint.getDefaultPrinter();
      browserPrint.setPrinter(defaultPrinter);

      // 프린터 상태 확인
      const printerStatus = await browserPrint.checkPrinterStatus();

      if (printerStatus.isReadyToPrint) {
        const zpl = `^XA
                            ^BY2,2,100
                            ^FO20,20^BC^FD0123456789^FS
                            ^XZ`;

        await browserPrint.print(zpl);
        setStatus('출력 완료!');
      } else {
        setStatus(`프린터 에러: ${printerStatus.errors}`);
      }
    } catch (error) {
      setStatus(`에러: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handlePrint} disabled={loading}>
        {loading ? '출력 중...' : '바코드 출력'}
      </button>
      {status && <p>{status}</p>}
    </div>
  );
}

export default PrintButton;
```
