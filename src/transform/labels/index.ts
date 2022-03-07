import GithubSlugger from 'github-slugger';
import { Processor, Transformer } from 'unified';
import { Node } from 'unist';
import { VFile } from 'vfile';
import { associateLabels, Label } from './label';
import { setLinkTargets } from './linkTarget';

export function labels(this: Processor): Transformer {
  const slugger = new GithubSlugger();
  const labels = new Map<string, Label>();
  return (tree: Node, file: VFile) => {
    associateLabels(slugger, labels, tree, file);
    setLinkTargets(labels, tree, file);
  };
}
