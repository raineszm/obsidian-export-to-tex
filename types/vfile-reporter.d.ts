declare module 'vfile-reporter' {
  import { VFile } from 'vfile';
  namespace VFileReporter {
    interface VFileReporterOptions {
      verbose: boolean;
      quiet: boolean;
      silent: boolean;
      color: boolean;
      defaultName: string;
    }

    type vfileReporter = (
      files: VFile | VFile[] | Error,
      options?: VFileReporterOptions,
    ) => string;
  }
  const VFileReporter: VFileReporter.vfileReporter;
  export = VFileReporter;
}
