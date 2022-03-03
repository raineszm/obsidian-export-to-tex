import GithubSlugger from 'github-slugger';
import { Processor, Transformer } from 'unified';
import { Node } from 'unist';
import { VFile } from 'vfile';
import visit from 'unist-util-visit';
import {
  assertLabeledLink,
  isHeading,
  isLabelDirective,
} from './mdastInterfaces';
import { toNamedVFile } from './file';
import { parseLinktext } from 'obsidian';

interface LinkTarget {
  path: string;
  subpath: string;
  type: 'block' | 'heading';
}

export function labels(this: Processor): Transformer {
  const slugger = new GithubSlugger();
  const labels = new Map<string, string>();
  return (tree: Node, file: VFile) => {
    addLabel(slugger, labels, tree, file);
    targetLabels(labels, tree, file);
  };
}

function addLabel(
  slugger: GithubSlugger,
  labelsMap: Map<string, string>,
  tree: Node,
  file: VFile,
): void {
  visit(tree, ['heading', 'textDirective'], (node: Node) => {
    if (!isHeading(node) && !isLabelDirective(node)) {
      file.message(`node of type ${node.type} cannot be labeled`);
      return;
    }
    const namedFile = toNamedVFile(file);
    const { subpath, type } = getLabel(node);
    const key: LinkTarget = {
      path: namedFile.stem,
      subpath,
      type,
    };

    if (node.data === undefined) {
      node.data = {};
    }
    if (node.data.label === undefined) {
      node.data.label = slugger.slug(subpath);
    }
    labelsMap.set(keyToString(key), node.data.label);
  });
}

function getLabel(node: Node): { subpath: string; type: 'heading' | 'block' } {
  if (isHeading(node)) {
    return {
      // @ts-expect-error
      subpath: `#${node.children.map((c) => c.value).join('')}`,
      type: 'heading',
    };
  } else if (isLabelDirective(node)) {
    return { subpath: `#^${node.attributes.text}`, type: 'block' };
  }
  throw new Error('Tried to generate label for unexpected type: ' + node.type);
}

function targetLabels(
  labelsMap: Map<string, string>,
  tree: Node,
  file: VFile,
): void {
  visit(tree, 'wikiLink', (node: Node) => {
    assertLabeledLink(node);
    if (node.data.label !== undefined) {
      return;
    }

    if (!node.value.contains('#')) {
      return;
    }

    const namedFile = toNamedVFile(file);
    const { path, subpath } = parseLinktext(node.value);
    const key: LinkTarget = {
      type: node.value.contains('^') ? 'block' : 'heading',
      path: path.length > 0 ? path : namedFile.stem,
      subpath,
    };
    const label = labelsMap.get(keyToString(key));
    if (label !== null) {
      node.data.label = label;
      node.data.targetType = key.type;
    }
  });
}

function keyToString(key: LinkTarget): string {
  return `${key.type}:${key.path}:${key.subpath}`;
}
