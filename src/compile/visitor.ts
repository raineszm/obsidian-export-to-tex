import { Node, Parent } from 'unist';
import {
  Blockquote,
  Emphasis,
  Heading,
  Image,
  Link,
  Paragraph,
  Root,
  Strong,
  Table,
  TableRow,
  Text,
} from 'mdast';
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
  private readonly _settings: ExportToTexSettings;
  private readonly _file: VFile;

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
      case 'image':
        this.visitImage(node as Image);
        break;
      case 'table':
        this.visitTable(node as Table);
        break;
      case 'inlineMath':
        this.emit(`$$${(node as InlineMath).value}$$`);
        break;
      case 'math':
        this.visitMath(node as Math);
        break;
      case 'wikiLink':
        this.visitWikiLink(node as WikiLink);
        break;
      case 'link':
        this.visitLink(node as Link);
        break;
      case 'emphasis':
        this.commandChildren('emph', node as Emphasis);
        break;
      case 'strong':
        this.commandChildren('textbf', node as Strong);
        break;
      case 'text':
        this.visitText(node as Text);
        break;
      case 'break':
        this.emit('\\\\\n');
        break;
      default:
        this.visitUnknown(node);
    }
  }

  visitHeading(heading: Heading): void {
    if (heading.depth > 5) {
      return;
    }
    const cmd = headingNames[heading.depth - 1];
    this.commandChildren(cmd, heading);
    this.label(heading as LabeledNode);
  }

  visitBlockquote(blockquote: Blockquote): void {
    this.begin('blockquote');
    this.visitChildren(blockquote);
    this.end('blockquote');
  }

  visitParagraph(paragraph: Paragraph): void {
    this.emit('\n\n');
    this.visitChildren(paragraph);
    this.emit('\n\n');
  }

  visitImage(image: Image): void {
    this.begin('figure');
    this.emit('\\includegraphics{');
    this.emit(image.url);
    this.emit('}\n');
    this.emit(`'\\caption{${image.title} ${image.alt}`);
    this.label(image as LabeledNode);
    this.emit('}');
    this.end('figure');
  }

  visitTable(table: Table): void {
    const columns = table.children[0].children.length;
    const rows = table.children.length;

    this.begin('table');
    this.emit(`\\begin{tabular}{${Array(columns).fill('c').join('|')}}\n`);
    table.children.forEach((row, index) => {
      this.visitTableRow(row);
      if (index < rows - 1) this.emit('\\\\\n');
    });
    this.end('tabular');
    this.label(table as LabeledNode);
    this.end('table');
  }

  visitTableRow(row: TableRow): void {
    const cells = row.children.length;
    row.children.forEach((cell, index) => {
      this.visit(cell);
      if (index < cells - 1) this.emit('&');
    });
  }
  visitMath(math: Math): void {
    this.emit(displayMath(this._settings, math));
  }

  visitWikiLink(wikiLink: WikiLink): void {
    const { alias } = wikiLink.data;
    const name = alias ?? wikiLink.value;
    this.emit(name);
    this.label(wikiLink as LabeledNode);
  }

  visitLink(link: Link): void {
    this.emit(`\\href{${link.url}{`);
    this.visitChildren(link);
    this.emit('}');
  }
  visitText(text: Text): void {
    this.emit(text.value);
  }

  visitChildren(node: Parent): void {
    node.children.forEach((node) => this.visit(node));
  }

  visitUnknown(node: Node): void {
    this._file.message(`Encountered unknown node type ${node.type}`, node);
  }

  emit(content: string): void {
    this._output.push(content);
  }

  command(cmd: string, callback: Function): void {
    this.emit('\\${cmd}{');
    callback();
    this.emit('}');
  }

  commandChildren(cmd: string, node: Parent): void {
    this.command(cmd, () => this.visitChildren(node));
  }

  begin(name: string): void {
    this.emit(`\\begin${name}\n`);
  }

  end(name: string): void {
    this.emit(`\\end${name}\n`);
  }

  label(node?: LabeledNode): void {
    if (node?.data?.label === undefined) return;
    this.emit(getLabel(this._settings, node.data.label));
  }
}
