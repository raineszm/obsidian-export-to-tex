import GithubSlugger from 'github-slugger';
import { Processor, Transformer } from 'unified';
import { Node } from 'unist';
import { VFile } from 'vfile';
import visit from 'unist-util-visit';
import { ObsidianVFile } from './file';
import {
  assertLabeledLink,
  isHeading,
  isLabelDirective,
} from './mdastInterfaces';

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
    const text = getTargetText(node);
    const filename = (file as ObsidianVFile).data.file.basename;
    const sigil = node.type === 'textDirective' ? '^' : '';
    const labelPrefix = node.type === 'textDirective' ? 'block' : 'sec';
    const label = labelPrefix + ':' + slugger.slug(text);
    const linkText = `${filename}#${sigil}${text}`;

    if (node.data === undefined) {
      node.data = {};
    }

    node.data.label = label;
    labelsMap.set(linkText, label);
  });
}

function getTargetText(node: Node): string {
  if (isHeading(node)) {
    return node.children.map((c) => c.value).join('');
  } else if (isLabelDirective(node)) {
    return node.attributes.text;
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
    if (!node.value.contains('#')) {
      return;
    }
    const key = node.value.startsWith('#')
      ? (file as ObsidianVFile).data.file.basename + node.value
      : node.value;
    const label = labelsMap.get(key);
    if (label !== null) {
      node.data.label = label;
    }
  });
}
