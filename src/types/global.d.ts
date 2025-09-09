import { Process } from 'process';
import { Buffer } from 'buffer';

declare global {
  interface Window {
    process: Process;
    Buffer: typeof Buffer;
    global: Window;
  }
}

declare module 'process' {
  global {
    namespace NodeJS {
      interface Process {
        browser: boolean;
      }
    }
  }
}

declare module 'stream-browserify';
declare module 'vm-browserify';
declare module 'path-browserify';
declare module 'crypto-browserify';
declare module 'buffer';
declare module 'util';

export {};