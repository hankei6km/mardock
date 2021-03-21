declare module 'unist-util-find' {
  import { Node } from 'unified';

  type condition = string | { [key: string]: any } | ((Node) => boolean);
  const stream = (Node, condition) => Node;

  export default stream;
}
