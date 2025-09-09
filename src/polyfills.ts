import { Buffer } from 'buffer';
import process from 'process';

declare global {
  interface Window {
    process: any;
    Buffer: any;
    global: Window;
  }
}

window.global = window;
window.process = process;
window.Buffer = Buffer;

export {};