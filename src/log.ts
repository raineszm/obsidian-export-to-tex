import * as loglevel from 'loglevel';
export const log = loglevel.getLogger('export-to-tex');
export function setDebug(debug: boolean): void {
  log.setLevel(debug ? 'debug' : 'info');
}
