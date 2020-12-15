declare module 'vfile-reporter-pretty' {
  import { VFile } from 'vfile';
  function vfileReporterPretty(files: VFile[]): string;
  export = vfileReporterPretty;
}
