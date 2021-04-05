import { Element } from 'hast';
const preHandler = require('hast-util-to-mdast/lib/handlers').pre;
var toHtml = require('hast-util-to-html');

export const CodeDockKindValues = ['markdown', 'comment'] as const;
export type CodeDockKind = typeof CodeDockKindValues[number];
export const CodeDockKindAliasMap: { [key: string]: CodeDockKind } = {
  markdown: 'markdown',
  // comment: 'comment',  // comment は内部的な表現として扱う
  md: 'markdown',
  note: 'comment',
  directives: 'comment'
};
export const CodeDockKindAllValues = Object.keys(CodeDockKindAliasMap);

const codeDockRegExp = new RegExp(
  `^===+(${CodeDockKindAllValues.join('|')})\n`
);

function isCodeDock(node: Element): boolean {
  return (
    Array.isArray(node.children) &&
    node.children.length === 1 &&
    node.children[0].type === 'element' &&
    node.children[0].tagName === 'code' &&
    Array.isArray(node.children[0].children) &&
    node.children[0].children.length === 1 &&
    node.children[0].children[0].type === 'text' &&
    node.children[0].children[0].value.match(codeDockRegExp) !== null
  );
}

export function codeDockKind(value: string): CodeDockKind | undefined {
  const m = value.match(codeDockRegExp);
  if (m) {
    const kind = CodeDockKindAliasMap[m[1]];
    if (kind) {
      return kind;
    }
  }
  return;
}

export function codeDockHandler(
  h: (
    // エラーにならない程度に定義する.
    node: Element,
    type?: string,
    props?: string,
    children?: Element[]
  ) => Element,
  node: Element
): Element {
  // コマンドやデータを埋め込みたくなるはず、
  // だが、そういった構造になってはいない
  if (isCodeDock(node)) {
    const b = (node.children[0] as Element).children[0] as Element;
    const kind = codeDockKind(b.value as string);
    const value = (b.value as string).replace(codeDockRegExp, '');
    switch (kind) {
      case 'markdown':
        return h(node, 'html', `${value}\n`);
      case 'comment':
        return h(node, 'html', toHtml({ type: 'comment', value }));
    }
  }
  return preHandler(h, node);
}
