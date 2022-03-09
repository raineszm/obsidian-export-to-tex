import { Node, Parent } from 'unist';
import GithubSlugger from 'github-slugger';
import { VFile } from 'vfile';
import { visit } from 'unist-util-visit';
import { is } from 'unist-util-is';
import { Heading } from 'mdast';
import {
  isLabelParagraph,
  isLabelText,
  LabelParagraph,
  LabelText,
} from './labelNodes';
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

export function associateLabels(
  slugger: GithubSlugger,
  labelsMap: Map<string, Label>,
  tree: Node,
  file: VFile,
): void {
  visit(
    tree,
    ['heading', 'paragraph', 'text'],
    (node: Node, index: number | null, parent: Parent) => {
      const labelData = getLabelData(file, node, index, parent);
      if (!labelData) return;
      createLabel(slugger, labelsMap, file, labelData);
      if (labelData?.removeNode) return index;
    },
  );
}

interface LabelData {
  target: LabeledNode;
  name: string;
  removeNode: boolean;
}

function createLabel(
  slugger: GithubSlugger,
  labelsMap: Map<string, Label>,
  file: VFile,
  labelData: LabelData,
): void {
  const namedFile = toNamedVFile(file);
  const { target: node, name: subpath } = labelData;
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

function getLabelData(
  file: VFile,
  node: Node,
  index: number | null,
  parent?: Parent,
): LabelData | undefined {
  if (is<Heading>(node, 'heading')) {
    return getHeadingLabel(node);
  } else if (isLabelParagraph(node)) {
    return getLabelParagraphData(file, node, index, parent);
  } else if (isLabelText(node)) {
    return getLabelTextData(file, node, index, parent);
  }
}

function getHeadingLabel(node: Heading): LabelData {
  return {
    // @ts-expect-error
    name: `#${node.children.map((c) => c.value).join('')}`,
    target: node as LabeledNode,
    removeNode: false,
  };
}

function getLabelParagraphData(
  file: VFile,
  node: LabelParagraph,
  index: number | null,
  parent?: Parent,
): LabelData | undefined {
  if (parent === undefined || index === null || index === 0) {
    file.message(
      `Label ${node.children[0].value} cannot be associated to a block`,
      node.children[0],
    );
    replaceWithComment(node.children[0].value, node, index, parent);
    return;
  }

  parent.children.splice(index, 1);

  return {
    target: parent.children[index - 1] as LabeledNode,
    name: node.children[0].value,
    removeNode: true,
  };
}

function getLabelTextData(
  file: VFile,
  node: LabelText,
  index: number | null,
  parent?: Parent,
): LabelData | undefined {
  if (parent === undefined || index === null || index === 0) {
    file.message(`Label ${node.value} cannot be associated to a block`, node);
    replaceWithComment(node.value, node, index, parent);
    return;
  }

  parent.children.splice(index, 1);

  return {
    target: parent.children[index - 1] as LabeledNode,
    name: node.value,
    removeNode: true,
  };
}

function replaceWithComment(
  text: string,
  node: Node,
  index: number | null,
  parent?: Parent,
): void {
  if (parent === undefined || index === null) return;
  const marker = {
    type: 'comment',
    name: text,
    attributes: '',
    parameters: {},
    node,
  };
  parent.children[index] = marker;
}
