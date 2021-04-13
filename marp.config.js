const { Marp } = require('@marp-team/marp-core');
const themes = require('./src/marp-theme');

module.exports = {
  engine: (opts) => {
    // const marp = new Marp({ ...opts, script: false });
    // 一括で helper をオフにすると PDF 等で不都合がある?
    // TODO: 画像、 PDF で helper の挙動確認.
    const marp = new Marp(opts);
    themes.forEach((theme) => marp.themeSet.add(theme));
    return marp;
  }
};
