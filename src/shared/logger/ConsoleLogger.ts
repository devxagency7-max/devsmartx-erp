import type { Logger } from './Logger';

const PREFIX = '[DevSmartX]';

export class ConsoleLogger implements Logger {
  private readonly isDev: boolean;

  constructor(isDev: boolean) {
    this.isDev = isDev;
  }

  info(message: string, ...args: unknown[]): void {
    if (this.isDev) console.info(`${PREFIX} INFO:`, message, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.isDev) console.warn(`${PREFIX} WARN:`, message, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    // Errors are always logged, even in production
    console.error(`${PREFIX} ERROR:`, message, ...args);
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.isDev) console.debug(`${PREFIX} DEBUG:`, message, ...args);
  }
}
