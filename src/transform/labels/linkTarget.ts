import { Label, LabeledLink } from './label';
import { Node } from 'unist';
import { VFile } from 'vfile';
import visit from 'unist-util-visit';
import { assertNodeType } from '../../nodeTypeHelpers';
import { toNamedVFile } from '../../file';
import { parseLinktext } from 'obsidian';

export interface LinkTarget {
  path: string;
  subpath: string;
  isHeading: boolean;
}

export function keyToString(key: LinkTarget): string {
  return `${key.isHeading ? 'h' : 'b'}:${key.path}:${key.subpath}`;
}

export function setLinkTargets(
  labelsMap: Map<string, Label>,
  tree: Node,
  file: VFile,
): void {
  visit(tree, 'wikiLink', (node: Node) => {
    assertNodeType<LabeledLink>(node, 'wikiLink');
    if (node.data.label !== undefined) {
      return;
    }

    if (!node.value.contains('#')) {
      return;
    }

    const namedFile = toNamedVFile(file);
    const { path, subpath } = parseLinktext(node.value);
    const key: LinkTarget = {
      isHeading: !node.value.contains('^'),
      path: path.length > 0 ? path : namedFile.stem,
      subpath,
    };
    const label = labelsMap.get(keyToString(key));
    if (label !== null) {
      node.data.label = label;
    }
  });
}
