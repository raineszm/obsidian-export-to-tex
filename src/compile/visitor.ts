import { Node, Parent } from 'unist';
import { Blockquote, Heading, Paragraph, Root, Text } from 'mdast';
import { ExportToTexSettings } from '../plugin/settings';
import { VFile } from 'vfile';
import { LabeledNode } from '../transform/labels/label';
import { getLabel } from './getRef';
import { InlineMath, Math } from 'mdast-util-math';
import { displayMath } from './types/math';
import { WikiLink } from 'remark-wiki-link';

const headingNames = [
  'section',
  'subsection',
  'subsubsection',
  'paragraph',
  'subparagraph',
];

export class Visitor {
  private _output: string[];
  private _settings: ExportToTexSettings;
  private _file: VFile;

  constructor(settings: ExportToTexSettings, file: VFile) {
    this._output = [];
    this._settings = settings;
    this._file = file;
  }

  toString(): string {
    return this._output.join('');
  }

  visit(node: Node): void {
    switch (node.type) {
      case 'root':
        this.visitChildren(node as Root);
        break;
      case 'heading':
        this.visitHeading(node as Heading);
        break;
      case 'blockquote':
        this.visitBlockquote(node as Blockquote);
        break;
      case 'paragraph':
        this.visitParagraph(node as Paragraph);
        break;
      case 'inlineMath':
        this.visitInlineMath(node as InlineMath);
        break;
      case 'math':
        this.visitMath(node as Math);
        break;
      case 'wikiLink':
        this.visitWikiLink(node as WikiLink);
        break;
      case 'text':
        this.visitText(node as Text);
        break;
      default:
        this.visitUnknown(node);
    }
  }

  begin(name: string): void {
    this._output.push(`\\begin${name}\n`);
  }

  end(name: string): void {
    this._output.push(`\\end${name}\n`);
  }

  label(node?: LabeledNode): void {
    if (node?.data?.label === undefined) return;
    this._output.push(getLabel(this._settings, node.data.label));
  }

  visitHeading(heading: Heading): void {
    if (heading.depth > 5) {
      return;
    }
    const cmd = headingNames[heading.depth - 1];
    this._output.push(`\\${cmd}{`);
    this.visitChildren(heading);
    this._output.push('}');
    this.label(heading as LabeledNode);
  }

  visitBlockquote(blockquote: Blockquote): void {
    this.begin('blockquote');
    this.visitChildren(blockquote);
    this.end('blockquote');
  }

  visitParagraph(paragraph: Paragraph): void {
    this._output.push('\n\n');
    this.visitChildren(paragraph);
    this._output.push('\n\n');
  }

  visitInlineMath(math: InlineMath): void {
    this._output.push(`$$${math.value}$$`);
  }

  visitMath(math: Math): void {
    this._output.push(displayMath(this._settings, math));
  }

  visitWikiLink(wikiLink: WikiLink): void {
    const { alias } = wikiLink.data;
    const name = alias ?? wikiLink.value;
    this._output.push(name);
    this.label(wikiLink as LabeledNode);
  }

  visitText(text: Text): void {
    this._output.push(text.value);
  }

  visitChildren(node: Parent): void {
    node.children.forEach((node) => this.visit(node));
  }

  visitUnknown(node: Node): void {
    this._file.message(`Encountered unknown node type ${node.type}`, node);
  }
}
