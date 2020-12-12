import GithubSlugger from 'github-slugger';
import { Processor, Transformer } from 'unified';
import { Node } from 'unist';
import { VFile } from 'vfile';
import visit from 'unist-util-visit';
import { Heading } from 'mdast';
import { LabelDirective, TextDirective } from './directives';
import { ObsidianVFile } from './file';
import { WikiLink } from 'remark-wiki-link';

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
  switch (node.type) {
    case 'heading':
      return (node as Heading).children.map((c) => c.value).join('');
    case 'textDirective': {
      const directive = node as TextDirective;
      if (directive.name === 'label') {
        return (directive as LabelDirective).attributes.text;
      }
      throw new Error(
        'Tried to generate label for unexpected directiev type: ' +
          directive.name,
      );
    }
    default:
      throw new Error(
        'Tried to generate label for unexpected type: ' + node.type,
      );
  }
}

export interface LabeledLink extends WikiLink {
  data: {
    label?: string;
    alias?: string;
  };
}

function targetLabels(
  labelsMap: Map<string, string>,
  tree: Node,
  file: VFile,
): void {
  visit(tree, 'wikiLink', (node) => {
    const link = node as LabeledLink;
    if (!link.value.contains('#')) {
      return;
    }
    const key = link.value.startsWith('#')
      ? (file as ObsidianVFile).data.file.basename + link.value
      : link.value;
    const label = labelsMap.get(key);
    if (label !== null) {
      link.data.label = label;
    }
  });
}
