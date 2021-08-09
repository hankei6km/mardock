const { Marp } = require('@marp-team/marp-core');
const themes = require('./src/marp-theme');
const externalLinkPlugin = require('./src/markdown-it-external-link');

module.exports = {
  engine: (opts) => {
    // const marp = new Marp({ ...opts, script: false });
    // 一括で helper をオフにすると PDF で正常に表示されない.
    const marp = new Marp(opts);
    marp.use(externalLinkPlugin);
    themes.forEach((theme) => marp.themeSet.add(theme));
    return marp;
  }
};
