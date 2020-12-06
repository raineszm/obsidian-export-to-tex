import { Node } from 'unist';
import { Plugin } from 'unified';
import { VFile } from 'vfile';
import flatMap from 'unist-util-flatmap';
import { EmbedDirective, TextDirective } from './directives';

export const embed: Plugin<[]> = () => embedTransformer;

function embedTransformer(tree: Node, file: VFile): Node {
  return flatMap(tree, (node) => {
    if (node.type !== 'textDirective') return [node];
    const directive = node as TextDirective;
    if (directive.name !== 'embed') return [node];
    const embed = directive as EmbedDirective;

    return resolveEmbed(embed.attributes.target, file);
  });
}

function resolveEmbed(embedTarget: string, file: VFile): Node[] {
  return [];
}
