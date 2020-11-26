import {
  EmbedCache,
  getLinkpath,
  Loc,
  MetadataCache,
  Pos,
  resolveSubpath,
  TFile,
} from 'obsidian';

export class TeXPrinter {
  constructor(readonly metadata: MetadataCache) {}

  public async resolveEmbedsRecursively(
    file: TFile,
    regionStart: Loc,
    regionEnd?: Loc,
  ): Promise<string> {
    const fileCache = this.metadata.getFileCache(file);

    // Select only embeds within the selected region
    const enclosedEmbeds =
      fileCache.embeds
        ?.filter(({ position }) => inRegion(position, regionStart, regionEnd))
        ?.sort(compareEmbedCache)
        ?.map(
          async ({ position, link }) =>
            await this.resolveEmbed(link, file.path, position),
        ) ?? [];

    return await TeXPrinter.doTransclusion(
      file,
      await Promise.all(enclosedEmbeds),
      regionStart,
      regionEnd,
    );
  }

  private static async doTransclusion(
    file: TFile,
    enclosedEmbeds: Resolved[],
    regionStart: Loc,
    regionEnd?: Loc,
  ): Promise<string> {
    const data = await file.vault.cachedRead(file);
    return this.replaceCached(data, enclosedEmbeds, regionStart, regionEnd);
  }

  private static replaceCached(
    data: string,
    cached: Resolved[],
    regionStart?: Loc,
    regionEnd?: Loc,
  ): string {
    const chunks: string[] = [];
    let pointer = regionStart?.offset ?? 0;
    const end = regionEnd?.offset ?? data.length;

    for (const insert of cached) {
      chunks.push(
        data.slice(pointer, insert.position.start.offset),
        insert.data,
      );
      pointer = insert.position.end.offset;
    }

    if (pointer < end) {
      chunks.push(data.substr(pointer, end - pointer));
    }

    return chunks.join('');
  }

  private async resolveEmbed(
    link: string,
    sourcePath: string,
    position: Pos,
  ): Promise<Resolved> {
    const path = getLinkpath(link);
    const target = this.metadata.getFirstLinkpathDest(path, sourcePath);
    const subpath = link.replace(path, '');
    const result = resolveSubpath(this.metadata.getFileCache(target), subpath);
    return {
      data: await this.resolveEmbedsRecursively(
        target,
        result.start,
        result.end ?? undefined,
      ),
      position,
    };
  }

  process(file: TFile, data: string): string {
    return this.replaceHeadings(file, data);
  }

  async print(file: TFile): Promise<string> {
    const data = await this.resolveEmbedsRecursively(file, {
      line: 0,
      col: 0,
      offset: 0,
    });
    return this.process(file, data);
  }

  private replaceHeadings(file: TFile, data: string): string {
    const cache = this.metadata.getFileCache(file);
    const headings = cache?.headings?.map(({ heading, level, position }) => {
      return {
        data: TeXPrinter.texSection(heading, level),
        position,
      };
    });
    return TeXPrinter.replaceCached(data, headings ?? []);
  }

  static HEADINGS = [
    'section',
    'subsection',
    'subsubsection',
    'paragraph',
    'subparagraph',
  ];

  static texSection(heading: string, level: number): string {
    if (level < 1 || level > 5) {
      return '';
    }
    const anchor = TeXPrinter.asAnchor(heading);
    return `\\${
      TeXPrinter.HEADINGS[level + 1]
    }{${heading}}\\label{sec:${anchor}}`;
  }

  static asAnchor(heading: string): string {
    return heading.toLowerCase().replace(/[^a-z0-9]/, '-');
  }
}

interface Resolved {
  data: string;
  position: Pos;
}

function inRegion(position: Pos, regionStart: Loc, regionEnd?: Loc): boolean {
  const { start, end } = position;
  return (
    inInterval(start, regionStart, regionEnd) ||
    inInterval(end, regionStart, regionEnd)
  );
}

function inInterval(point: Loc, regionStart: Loc, regionEnd?: Loc): boolean {
  const { offset } = point;
  return (
    offset >= regionStart.offset &&
    offset <= (regionEnd?.offset ?? Number.MAX_SAFE_INTEGER)
  );
}
function compareEmbedCache(a: EmbedCache, b: EmbedCache): number {
  return a.position.start.offset - b.position.start.offset;
}
