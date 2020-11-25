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
        ?.map(({ position, link }) =>
          this.resolveEmbed(link, file.path, position),
        ) ?? [];

    return await TeXPrinter.doTransclusion(
      file,
      enclosedEmbeds,
      regionStart,
      regionEnd,
    );
  }

  private static async doTransclusion(
    file: TFile,
    enclosedEmbeds: ResolvedEmbed[],
    regionStart: Loc,
    regionEnd?: Loc,
  ): Promise<string> {
    const data = await file.vault.cachedRead(file);
    const chunks: string[] = [];
    let pointer = regionStart.offset;
    const end = regionEnd?.offset ?? data.length;

    for (const embed of enclosedEmbeds) {
      chunks.push(
        data.slice(pointer, embed.position.start.offset),
        await embed.data,
      );
      pointer = embed.position.end.offset;
    }

    if (pointer < end) {
      chunks.push(data.substr(pointer, end - pointer));
    }

    return chunks.join('');
  }

  private resolveEmbed(
    link: string,
    sourcePath: string,
    position: Pos,
  ): ResolvedEmbed {
    const path = getLinkpath(link);
    const target = this.metadata.getFirstLinkpathDest(path, sourcePath);
    const subpath = link.replace(path, '');
    const result = resolveSubpath(this.metadata.getFileCache(target), subpath);
    return {
      data: this.resolveEmbedsRecursively(
        target,
        result.start,
        result.end ?? undefined,
      ),
      position,
    };
  }

  async print(file: TFile): Promise<string> {
    return await this.resolveEmbedsRecursively(file, {
      line: 0,
      col: 0,
      offset: 0,
    });
  }
}

interface ResolvedEmbed {
  data: Promise<string>;
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
