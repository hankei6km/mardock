function externalLinkPlugin(md) {
  const defaultRender =
    md.renderer.rules.link_open ||
    function (tokens, idx, options, _env, self) {
      return self.renderToken(tokens, idx, options);
    };

  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    if (tokens[idx].tag === 'a') {
      const attrs = tokens[idx].attrs;
      const sIndex = tokens[idx].attrIndex('target');
      // TODO: target が存在する場合のテストを作成.
      // といってもどうやる?
      // markdown 内に html で記述した場合は link_opne にはならない.
      // plugin を作って追加させる?
      if (attrs !== null && (sIndex < 0 || attrs[sIndex][1] === 'target')) {
        attrs.push(['target', '_blank']);
        attrs.push(['rel', 'noopener noreferrer']);
      }
    }
    return defaultRender(tokens, idx, options, env, self);
  };
}

module.exports = externalLinkPlugin;
