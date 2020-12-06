declare module 'unist-util-flatmap' {
  import { Node } from 'unist';
  function flatMap(tree: Node, fn: (node: Node) => Node[]): Node;
  export = flatMap;
}
