import { Processor } from 'unified';
import { Visitor } from './visitor';
import { TexContext } from '../data';

export function texCompiler(this: Processor): void {
  this.Compiler = (tree, file) => {
    const settings = this.data('settings') as TexContext;
    const visitor = new Visitor(settings.exportToTex, file);
    visitor.visit(tree);
    return visitor.toString();
  };
}
