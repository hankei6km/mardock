const { Marp } = require('@marp-team/marp-core');
const themes = require('./src/marp-theme');

module.exports = {
  engine: (opts) => {
    const marp = new Marp(opts);
    themes.forEach((theme) => marp.themeSet.add(theme));
    return marp;
  }
};
