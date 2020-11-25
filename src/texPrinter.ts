import {
  resolveSubpath,
  getLinkpath,
  MetadataCache,
  Pos,
  TFile,
  Loc,
} from 'obsidian';

export class TeXPrinter {
  static START: Loc = {
    line: 0,
    col: 0,
    offset: 0,
  };

  constructor(readonly metadata: MetadataCache) {}

  public async resolveEmbeds(
    file: TFile,
    regionStart: Loc,
    regionEnd?: Loc,
  ): Promise<string> {
    const fileCache = this.metadata.getFileCache(file);

    // Select only embeds within the selected region
    const enclosedEmbeds =
      fileCache.embeds
        ?.filter(({ position }) => inRegion(position, regionStart, regionEnd))
        ?.sort((a, b) => a.position.start.offset - b.position.start.offset)
        ?.map(({ position, link }) => {
          const path = getLinkpath(link);
          const target = this.metadata.getFirstLinkpathDest(path, file.path);
          const subpath = link.replace(path, '');
          const result = resolveSubpath(
            this.metadata.getFileCache(target),
            subpath,
          );
          return {
            data: this.resolveEmbeds(
              target,
              result.start,
              result.end ?? undefined,
            ),
            position,
          };
        }) ?? [];

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
