import { TextlintKernelRule, TextlintKernelFilterRule } from '@textlint/kernel';
import { TextlintKernelOptions } from '@textlint/kernel/lib/textlint-kernel-interface';

export type Presets = {
  // preset のモジュール名から prefix を取り除いたもの.
  // ie: 'textlint-rule-preset-ja-technical-writing' -> 'ja-technical-writing'
  // ただし全く異なる値を設定してもエラーとはならないので注意.
  presetId: string;
  // モジュールを require で取り込んだもの. 必ず **バンドルされるよう**に定義すること.
  preset: any;
}[];
// Preset の rule には 'presetId/ruleId' となるように指定する.
export type RuleOptions = { [key: string]: TextlintKernelRule['options'] };

export type DraftLintLintOptions = {
  ext?: string;
  presets?: Presets;
  rules?: TextlintKernelRule;
  ruleOptions?: RuleOptions;
  filterRules?: TextlintKernelFilterRule[];
};

// https://github.com/mobilusoss/textlint-browser-runner/tree/master/packages/textlint-bundler
export function getTextlintKernelOptions(
  draftLintLintOptions?: DraftLintLintOptions
): TextlintKernelOptions {
  const {
    ext = '.html',
    presets = undefined,
    rules = undefined,
    ruleOptions = undefined,
    filterRules = undefined
  }: DraftLintLintOptions = draftLintLintOptions || {};
  // preset の ruleId の扱い.
  // `${presetRuleNameWithoutPrefix}/${ruleId}`
  // '/' については RuleSeparator で定義されているが export されてない.
  // というか使ってはダメなのか?
  // >  * Main purpose hide the RuleSeparator "/".
  // https://github.com/textlint/textlint/blob/be0b48c1a83713ee7b649447d7580c42ffca9ace/packages/textlint/src/engine/textlint-module-loader.ts#L135
  // https://github.com/textlint/textlint/blob/be0b48c1a83713ee7b649447d7580c42ffca9ace/packages/textlint/src/engine/textlint-module-mapper.ts#L20
  // https://github.com/textlint/textlint/issues/299
  // preset を複数扱う場合にはどこからエラーが発生したのか識別できるように
  // ruleId は上記に則って付与する。ただし手動とする。
  const _presets = presets || [
    // {
    //   presetId: 'japanese',
    //   preset: require('textlint-rule-preset-japanese')
    // },
    {
      presetId: 'ja-technical-writing',
      preset: require('textlint-rule-preset-ja-technical-writing')
    },
    // {
    //   presetId: 'ja-spacing',
    //   preset: require('textlint-rule-preset-ja-spacing')
    // },
    {
      presetId: 'jtf-style',
      preset: require('textlint-rule-preset-jtf-style')
    }
  ];
  const _rules = rules || [
    {
      ruleId: 'ja-space-between-half-and-full-width',
      rule: require('textlint-rule-ja-space-between-half-and-full-width'),
      options: {
        space: 'always'
      }
    },
    // {
    //   // 'jtf-style/2.1.2.漢字': true,
    //   ruleId: 'jtf-style-2.1.2',
    //   rule: require('textlint-rule-preset-jtf-style/lib/2.1.2')
    // },
    // {
    //   // 'jtf-style/2.1.6.カタカナの長音': true
    //   ruleId: 'jtf-style-2.1.6',
    //   rule: require('textlint-rule-preset-jtf-style/lib/2.1.6')
    // },
    // {
    //   //'jtf-style/2.2.1.ひらがなと漢字の使い分け': true
    //   ruleId: 'jtf-style-2.2.1',
    //   rule: require('textlint-rule-preset-jtf-style/lib/2.2.1')
    // },
    // {
    //   //'jtf-style/2.1.8.算用数字': true
    //   ruleId: 'jtf-style-2.1.8',
    //   rule: require('textlint-rule-preset-jtf-style/lib/2.1.8')
    // },
    // {
    //   //'jtf-style/3.3.かっこ類と隣接する文字の間のスペース': true
    //   ruleId: 'jtf-style-3.3',
    //   rule: require('textlint-rule-preset-jtf-style/lib/3.3')
    // }
    {
      ruleId: 'no-synonyms',
      rule: require('@textlint-ja/textlint-rule-no-synonyms').default
    },
    {
      ruleId: 'en-spell',
      rule: require('textlint-rule-en-spell').default
    }
  ];
  // ruleOptions の  key は preset の rule に対して option を指定する場合は
  // 'japanese-???/rurleId' のように指定する.
  // (オブジェクトの階層ではなく '/' で区切る)
  const _ruleOptions = ruleOptions || {
    'ja-technical-writing/no-exclamation-question-mark': false,
    // 'ja-spacing/ja-space-between-half-and-full-width': {
    //   space: 'always'
    // },
    'jtf-style/3.1.1.全角文字と半角文字の間': false,
    'jtf-style/4.2.7.コロン(：)': false,
    'jtf-style/4.3.1.丸かっこ（）': false,
    'jtf-style/2.1.2.漢字': true,
    'jtf-style/2.1.5.カタカナ': false, // 'textlint-rule-preset-ja-technical-writing' に同様のルール.
    'jtf-style/2.1.6.カタカナの長音': true,
    'jtf-style/2.2.1.ひらがなと漢字の使い分け': true
  };
  const _filterRules = filterRules || [
    {
      ruleId: 'allowlist',
      rule: require('textlint-filter-rule-allowlist'),
      options: {
        // ここに設定した単語はソースコード参照時に見えてしまうので、
        // 登録内容には注意してください。
        allow: [
          'aspid',
          'html',
          'microCMS',
          'textlint',
          'Vercel',
          'VSCode',
          'webpack',
          'あるある',
          'リッチエディタ'
        ]
      }
    },
    {
      ruleId: 'node-types',
      rule: require('textlint-filter-rule-node-types'),
      options: {
        nodeTypes: ['CodeBlock']
      }
    }
  ];

  const options = {
    // filePath: '/path/to/file.md',
    ext: ext,
    plugins: [
      // todo: plugin  もオプションで指定させる.
      ext === '.html'
        ? {
            pluginId: 'html',
            plugin: require('textlint-plugin-html')
          }
        : {
            pluginId: 'markdown',
            plugin: require('@textlint/textlint-plugin-markdown').default
          }
    ],
    rules: _presets
      .map((p) =>
        Object.entries(p.preset.rules).map<TextlintKernelRule>(([k, v]) => {
          const ruleId = `${p.presetId}/${k}`;
          return {
            ruleId: ruleId,
            rule: v as TextlintKernelRule['rule'],
            options:
              _ruleOptions[ruleId] !== undefined
                ? _ruleOptions[ruleId]
                : p.preset.rulesConfig[k] !== undefined
                ? p.preset.rulesConfig[k]
                : {}
          };
        })
      )
      .reduce((a, v) => a.concat(v), [])
      .concat(_rules),
    filterRules: _filterRules
  };

  return options;
}
