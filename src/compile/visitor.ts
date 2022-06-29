import { Node, Parent } from 'unist';
import {
  Blockquote,
  Code,
  Emphasis,
  Heading,
  Image,
  InlineCode,
  Link,
  List,
  ListItem,
  Paragraph,
  Root,
  Strong,
  Table,
  TableCell,
  TableRow,
  Text,
} from 'mdast';
import { ExportToTexSettings } from '../plugin/settings';
import { VFile } from 'vfile';
import { LabeledNode } from '../transform/labels/label';
import { getLabel, getRef } from './getRef';
import { InlineMath, Math } from 'mdast-util-math';
import { displayMath } from './types/math';
import { WikiLink } from 'remark-wiki-link';
import { Literal } from 'hast';
import { is } from 'unist-util-is';
import { isParent } from '../nodeTypeHelpers';

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
  private _commenting: boolean = false;

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
      case 'tableCell':
        this.visitChildren(node as TableCell);
        break;
      case 'inlineMath':
        this.emit(`$${(node as InlineMath).value}$`);
        break;
      case 'math':
        this.visitMath(node as Math);
        break;
      case 'inlineCode':
        this.emit(`\\verb{${(node as InlineCode).value}}`);
        break;
      case 'code':
        this.visitCode(node as Code);
        break;
      case 'list':
        this.visitList(node as List);
        break;
      case 'listItem':
        this.visitListItem(node as ListItem);
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
      case 'thematicBreak':
        this.emit('\n\\hrulefill\n');
        break;
      case 'yaml':
        break;
      default:
        this.visitUnknown(node);
    }
  }

  visitHeading(heading: Heading): void {
    if (heading.depth > 5) {
      return;
    }
    const cmd =
      headingNames[heading.depth - 1] +
      (this._settings.numberedSections ? '' : '*');
    this.commandChildren(cmd, heading);
    this.label(heading as LabeledNode);
  }

  visitBlockquote(blockquote: Blockquote): void {
    this.begin('blockquote');
    this.visitChildren(blockquote);
    this.end('blockquote');
  }

  visitParagraph(paragraph: Paragraph): void {
    this.emit('\n');
    this.visitChildren(paragraph);
    this.emit('\n');
  }

  visitImage(image: Image): void {
    this.begin('figure');
    this.emit('\\includegraphics{');
    this.emit(image.url);
    this.emit('}\n');
    this.emit(`\\caption{${image.title} ${image.alt}`);
    this.label(image as LabeledNode);
    this.emit('}\\n');
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
    this.emit('\n');
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

  visitCode(code: Code): void {
    this.emit(`% ${code.lang} ${code.meta}\n`);
    this.begin('verbatim');
    this.emit(code.value);
    this.emit('\n');
    this.end('verbatim');
  }

  visitList(list: List): void {
    const listEnvironment = list.ordered ? 'enumerate' : 'itemize';
    this.begin(listEnvironment);
    this.visitChildren(list);
    this.end(listEnvironment);
  }

  visitListItem(listItem: ListItem): void {
    this.emit('\\item ');
    this.visitChildren(listItem);
  }

  visitWikiLink(wikiLink: WikiLink): void {
    const { alias } = wikiLink.data;
    const label = (wikiLink as LabeledNode).data.label;
    const fallbackText =
      !wikiLink.value.contains('#') || label === undefined
        ? wikiLink.value
        : '';
    this.emit((alias ?? fallbackText).replaceAll('#', ''));
    this.reference(wikiLink as LabeledNode);
  }

  visitLink(link: Link): void {
    this.emit(`\\href{${link.url}}{`);
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
    this.comment(() => {
      this.emit(`Unknown Node :: ${node.type}\n`);
      if (is<Literal>(node, (x): x is Literal => 'value' in x)) {
        this.emit(node.value);
      } else if (isParent(node)) {
        this.visitChildren(node);
      }
    });
  }

  emit(content: string): void {
    if (
      this._commenting &&
      this._output[this._output.length - 1].endsWith('\n')
    )
      this._output.push('%');
    this._output.push(content);
  }

  comment(callback: Function): void {
    const previous = this._commenting;
    this._commenting = true;
    callback();
    this._commenting = previous;
  }
  command(cmd: string, callback: Function): void {
    this.emit(`\\${cmd}{`);
    callback();
    this.emit('}');
  }

  commandChildren(cmd: string, node: Parent): void {
    this.command(cmd, () => this.visitChildren(node));
  }

  begin(name: string): void {
    this.emit(`\\begin{${name}}\n`);
  }

  end(name: string): void {
    this.emit(`\\end{${name}}\n`);
  }

  label(node?: LabeledNode): void {
    if (node?.data?.label === undefined) return;
    this.emit(getLabel(this._settings, node.data.label));
  }

  reference(node: LabeledNode): void {
    if (node.data?.label === undefined) return;
    this.emit(getRef(this._settings, node.data.label));
  }
}
