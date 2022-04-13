import { Processor } from 'unified';
import { VFile } from 'vfile';
import { EmbedDirective } from './embedDirective';
import { Node } from 'unist';
import {
  BlockSubpathResult,
  FileSystemAdapter,
  HeadingSubpathResult,
  MetadataCache,
  parseLinktext,
  resolveSubpath,
  TFile,
} from 'obsidian';
import { makeVFile } from '../../file';
import { TexContext } from '../../data';
import { ImagePathSettings } from '../../plugin/settings';
import normalizePath from 'normalize-path';

export class EmbedResolver {
  constructor(
    readonly processor: Processor,
    readonly parentFile: VFile,
    readonly node: EmbedDirective,
  ) {}

  failedEmbed(): Node {
    const embedTarget = this.node.attributes.target;
    this.parentFile.message(
      `Failed to resolve embed ${embedTarget}`,
      this.node,
    );
    // @ts-expect-error
    return { type: 'inlineCode', value: `Missing ${embedTarget}` };
  }

  async resolve(): Promise<Node> {
    const embedTarget = this.node.attributes.target;
    this.parentFile.info(`Resolving embed "${embedTarget}"`, this.node);

    const metadata = this.processor.data('metadata');
    if (!(metadata instanceof MetadataCache)) {
      throw Error(
        'metadata must be passed to the processor in the form of an obsidian MetadataCache',
      );
    }

    const { file, result, subpath } = this.getTarget(metadata);

    if (file === undefined) {
      return this.failedEmbed();
    }

    switch (file.extension) {
      case 'md':
        if (result === null) {
          return this.failedEmbed();
        }
        this.parentFile.info(
          `Reading embedded file ${file.basename}`,
          this.node,
        );
        if (!(await file.vault.adapter.exists(file.path))) {
          this.parentFile.message(
            `${file.basename} does not exists`,
            this.node,
          );
          return this.failedEmbed();
        }
        return await this.processMarkdownEmbed(
          embedTarget,
          subpath,
          file,
          result,
        );
      default:
        return this.processImageEmbed(embedTarget, subpath, file);
    }
  }

  async processMarkdownEmbed(
    embedTarget: string,
    subpath: string,
    file: TFile,
    result: HeadingSubpathResult | BlockSubpathResult,
  ): Promise<Node> {
    const fileData = await file.vault.cachedRead(file);

    const data = fileData.slice(result.start.offset, result.end?.offset);

    this.parentFile.info(`Parsing "${embedTarget}"`, this.node);

    const embedFile = makeVFile(data, file.path, subpath);
    const node = this.processor.parse(embedFile);
    const processed = await this.processor.run(node, embedFile);
    this.parentFile.messages.push(...embedFile.messages);

    return processed;
  }

  processImageEmbed(embedTarget: string, subpath: string, file: TFile): Node {
    this.parentFile.info(`Processing image "${embedTarget}"`, this.node);
    const settings = this.processor.data('settings') as TexContext;
    const imagePath = EmbedResolver.getImagePath(file, settings);
    return {
      type: 'image',
      // @ts-expect-error
      url: imagePath,
    };
  }

  static readonly FAILED_TARGET = {
    subpath: '',
    result: null,
  };

  getTarget(metadata: MetadataCache): {
    file?: TFile;
    result: HeadingSubpathResult | BlockSubpathResult | null;
    subpath: string;
  } {
    const embedTarget = this.node.attributes.target;
    const { path, subpath } = parseLinktext(embedTarget);

    if (this.parentFile.path === undefined) {
      this.parentFile.message(
        `cannot resolve target of link ${embedTarget} as the path of the embedding file is not available`,
        this.node,
      );
      return EmbedResolver.FAILED_TARGET;
    }

    const target = metadata.getFirstLinkpathDest(path, this.parentFile.path);
    if (target === null) {
      this.parentFile.message(
        `cannot resolve target of link ${embedTarget}`,
        this.node,
      );
      return EmbedResolver.FAILED_TARGET;
    }
    const cache = metadata.getFileCache(target);
    if (cache === null) {
      this.parentFile.message(
        `cannot access file cache of ${embedTarget}`,
        this.node,
      );
      return EmbedResolver.FAILED_TARGET;
    }

    return {
      file: target,
      subpath,
      result: resolveSubpath(cache, subpath.trimEnd()),
    };
  }

  private static getImagePath(file: TFile, settings: TexContext): string {
    const adapter = file.vault.adapter as FileSystemAdapter;
    const absolutePath = adapter.getFullPath(file.path);

    switch (settings.exportToTex.imagePathSettings) {
      case ImagePathSettings.RelativeToRoot:
        return normalizePath(file.path);
      case ImagePathSettings.FullPath:
        return normalizePath(absolutePath);
      case ImagePathSettings.BaseName:
        return file.basename;
      case ImagePathSettings.RelativeToExport: {
        throw new Error('Relative to export setting is deprecated');
        // const exportPath = this.processor.data('exportPath') as string;
        // const exportFolder =
        //   // exportPath === null || exportPath === undefined
        //     ? settings.exportToTex.defaultExportDirectory
        //     : path.dirname(exportPath);
        // return normalizePath(path.relative(exportFolder, absolutePath));
      }
    }
  }
}
