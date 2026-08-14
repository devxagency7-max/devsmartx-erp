import { ConsoleLogger } from './ConsoleLogger';

export type { Logger } from './Logger';
export { ConsoleLogger } from './ConsoleLogger';

export const logger = new ConsoleLogger(import.meta.env.DEV as boolean);
