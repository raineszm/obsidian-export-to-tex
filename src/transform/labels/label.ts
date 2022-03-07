import { WikiLink } from 'remark-wiki-link';
import { Node, Parent } from 'unist';
import GithubSlugger from 'github-slugger';
import { VFile } from 'vfile';
import visit from 'unist-util-visit';
import { is } from 'unist-util-is';
import { Heading } from 'mdast';
import { isLabelParagraph } from './labelParagraph';
import { toNamedVFile } from '../../file';
import { keyToString, LinkTarget } from './linkTarget';

export interface Label {
  name: string;
  type: string;
}

export interface LabeledNode extends Node {
  data: {
    label?: Label;
  };
}

export interface LabeledLink extends WikiLink {
  data: {
    label?: Label;
    alias?: string;
  };
}

export function createLabel(
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

export function associateLabels(
  slugger: GithubSlugger,
  labelsMap: Map<string, Label>,
  tree: Node,
  file: VFile,
): void {
  visit(
    tree,
    ['heading', 'paragraph'],
    (node: Node, index: number, parent?: Parent) => {
      if (is<Heading>(node, 'heading')) {
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

function getHeadingLabel(node: Heading): string {
  // @ts-expect-error
  return `#${node.children.map((c) => c.value).join('')}`;
}
