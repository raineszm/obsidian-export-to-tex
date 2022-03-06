import GithubSlugger from 'github-slugger';
import { Processor, Transformer } from 'unified';
import { Node, Parent } from 'unist';
import { VFile } from 'vfile';
import visit from 'unist-util-visit';
import {
  assertLabeledLink,
  isHeading,
  isParagraph,
  isText,
  Label,
  LabeledNode,
} from './mdastInterfaces';
import { toNamedVFile } from './file';
import { parseLinktext } from 'obsidian';
import { Heading, Paragraph, Text } from 'mdast';

interface LinkTarget {
  path: string;
  subpath: string;
  isHeading: boolean;
}

export function labels(this: Processor): Transformer {
  const slugger = new GithubSlugger();
  const labels = new Map<string, Label>();
  return (tree: Node, file: VFile) => {
    associateLabels(slugger, labels, tree, file);
    targetLabels(labels, tree, file);
  };
}

function associateLabels(
  slugger: GithubSlugger,
  labelsMap: Map<string, Label>,
  tree: Node,
  file: VFile,
): void {
  visit(
    tree,
    ['heading', 'paragraph'],
    (node: Node, index: number, parent?: Parent) => {
      if (isHeading(node)) {
        return createLabel(
          slugger,
          labelsMap,
          file,
          node as LabeledNode,
          getHeadingLabel(node),
        );
      }
      if (!isLabelParagraph(node)) return;
      if (parent === undefined || index === 0) {
        file.message(
          `Label ${node.children[0].value} cannot be associated to a block`,
          node.children[0],
        );
        return;
      }
      const target = parent.children[index - 1];
      parent.children.splice(index, 1);
      createLabel(
        slugger,
        labelsMap,
        file,
        target as LabeledNode,
        node.children[0].value,
      );
      return index;
    },
  );
}

function createLabel(
  slugger: GithubSlugger,
  labelsMap: Map<string, Label>,
  file: VFile,
  node: LabeledNode,
  subpath: string,
): void {
  const namedFile = toNamedVFile(file);
  const key: LinkTarget = {
    path: namedFile.stem,
    subpath,
    isHeading: node.type === 'heading',
  };

  if (node.data === undefined) {
    node.data = {};
  }
  if (node.data.label === undefined) {
    node.data.label = {
      name: slugger.slug(subpath),
      type: node.type,
    };
  }
  labelsMap.set(keyToString(key), node.data.label);
}
function getHeadingLabel(node: Heading): string {
  // @ts-expect-error
  return `#${node.children.map((c) => c.value).join('')}`;
}

const LABEL_REGEX: RegExp = /^\^\w+$/;

export interface LabelParagraph extends Paragraph {
  children: Text[];
}

function isLabelParagraph(node: Node): node is LabelParagraph {
  if (!isParagraph(node)) return false;
  if (node.children.length !== 1) return false;
  const child = node.children[0];
  if (!isText(child)) return false;
  return child.value.match(LABEL_REGEX) !== null;
}

function targetLabels(
  labelsMap: Map<string, Label>,
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
      isHeading: !node.value.contains('^'),
      path: path.length > 0 ? path : namedFile.stem,
      subpath,
    };
    const label = labelsMap.get(keyToString(key));
    if (label !== null) {
      node.data.label = label;
      node.data.isHeading = key.isHeading;
    }
  });
}

function keyToString(key: LinkTarget): string {
  return `${key.isHeading ? 'h' : 'b'}:${key.path}:${key.subpath}`;
}
