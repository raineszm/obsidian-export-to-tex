import * as loglevel from 'loglevel';
export const log = loglevel.getLogger('export-to-tex');

export enum LogLevelOptions {
  trace = 'trace',
  debug = 'debug',
  info = 'info',
  warn = 'warn',
  error = 'error',
}
export type LogLevelString = keyof typeof LogLevelOptions;
