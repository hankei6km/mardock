import cheerio from 'cheerio';
import { TextlintKernel } from '@textlint/kernel';
import { TextlintKernelOptions } from '@textlint/kernel/lib/textlint-kernel-interface';
import { getTextlintKernelOptions } from '../utils/textlint';
import traverse from 'traverse';
const parseHtml = require('textlint-plugin-html/lib/html-to-ast').parse;

type MappedMessage = {
  ruleId: string;
  message: string;
  id: string;
  severity: number;
}[];
type MappedMessages = MappedMessage;

type InsInfo = {
  message: string;
  ruleId: string;
  severity: number;
  index: number;
  insIndex: number;
  range: [number, number];
};
type InsInfos = InsInfo[];

type TextLintInHtmlResult = {
  html: string;
  messages: MappedMessages;
  list: string;
};

export function getInsInfos(html: string, messages: any[]): InsInfos {
  const ret: InsInfos = [];
  const nodes = traverse(parseHtml(html)).nodes();
  messages.forEach((m) => {
    let hit = -1;
    const index = m.index;
    nodes.forEach((node, ii) => {
      if (
        node.type &&
        node.range &&
        node.range[0] <= index &&
        index <= node.range[1]
      ) {
        hit = ii;
      }
    });
    if (hit >= 0) {
      const node = nodes[hit];
      const end = m.index - node.range[0];
      // console.log(end, node.value.slice(0, end), node.raw.slice(0, end));
      ret.push({
        message: m.message,
        ruleId: m.ruleId,
        severity: m.severity,
        index: m.index,
        // 末尾 ';' だと欠ける? よって先頭を使う
        // TODO: 末尾の扱いチェック(どこで欠ける?).
        insIndex:
          node.value &&
          node.raw &&
          node.value.slice(0, end) === node.raw.slice(0, end)
            ? m.index
            : node.range[0] - 1,
        range: [node.range[0] as number, node.range[1] as number]
      });
    }
  });
  ret.sort((a, b) => a.insIndex - b.insIndex);
  return ret;
}

export async function textLintInHtml(
  html: string,
  options?: TextlintKernelOptions,
  messageStyle: { [key: string]: string } = { color: 'red' },
  idPrefix: string = ''
): Promise<TextLintInHtmlResult> {
  let ret: TextLintInHtmlResult = { html: '', messages: [], list: '' };

  // https://github.com/mobilusoss/textlint-browser-runner/tree/master/packages/textlint-bundler
  const kernel = new TextlintKernel();

  const results = [
    await kernel.lintText(
      html,
      // todo: options(presets など)は SiteServerSideConfig で定義できるようにする.
      options || getTextlintKernelOptions()
    )
  ];
  if (results && results.length > 0 && results[0].messages.length > 0) {
    const insInfos = getInsInfos(html, results[0].messages);
    const $wrapper = cheerio.load('<span/>')('span');
    Object.entries(messageStyle).forEach(([k, v]) => {
      $wrapper.css(k, v);
    });
    let pos = 0;
    insInfos.forEach((m, i) => {
      const id = `${idPrefix}:textLintMessage:${i}`;
      $wrapper.attr('id', id);
      const insertHtml = $wrapper.html(m.message).parent().html();
      if (m.message && insertHtml) {
        const index = insInfos[i].insIndex + 1;
        ret.html = `${ret.html}${html.slice(pos, index)}${insertHtml}`;
        pos = index;
        ret.messages.push({
          ruleId: m.ruleId,
          message: m.message,
          id,
          severity: m.severity
        });
      }
    });
    ret.html = `${ret.html}${html.slice(pos)}`;
    const $dl = cheerio.load('<dl/>')('dl');
    ret.messages.forEach((m) => {
      const $d = cheerio.load('<dt></dt><dd><a/></dd>');
      // https://github.com/textlint/textlint/blob/master/packages/%40textlint/kernel/src/shared/rule-severity.ts
      // https://github.com/textlint/textlint/blob/master/packages/%40textlint/kernel/src/context/TextlintRuleSeverityLevelKeys.ts
      $d('dt').text(
        m.severity === 0 ? 'info' : m.severity === 1 ? 'warning' : 'error'
      );
      const $a = $d('a');
      $a.attr('href', `#${m.id}`);
      $a.text(`${m.message}(${m.ruleId})`);
      $dl.append($d('body').children());
    });
    ret.list = $dl.parent().html() || '';
  }
  return ret;
}
