import { Parent } from 'mdast';

export interface TextDirective extends Parent {
  type: 'textDirective';
  name: string;
  attributes?: unknown;
}

export interface LabelDirective extends TextDirective {
  name: 'label';
  attributes: {
    text: string;
  };
}

export interface EmbedDirective extends TextDirective {
  name: 'embed';
  attributes: {
    target: string;
  };
}
