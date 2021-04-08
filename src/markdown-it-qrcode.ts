import Md from 'markdown-it';
import QRCode from 'qrcode';
const svgTag = require('qrcode/lib/renderer/svg-tag');

export default function qrcodePlugin(md: Md) {
  const defaultRender =
    md.renderer.rules.image ||
    function (tokens, idx, options, _env, self) {
      return self.renderToken(tokens, idx, options);
    };

  md.renderer.rules.image = (tokens, idx, options, env, self) => {
    const attrs = tokens[idx].attrs;
    const sIndex = tokens[idx].attrIndex('src');
    if (sIndex >= 0 && attrs !== null) {
      const src = attrs[sIndex][1];
      if (src && src.startsWith('qrcode:')) {
        const text = src.slice(7); // 'qrcode:'.length = 7
        const qd = QRCode.create(text, {});
        const q = svgTag.render(qd);
        attrs[sIndex][1] = `data:image/svg+xml;base64,${Buffer.from(q).toString(
          'base64'
        )}`;
      }
    }
    return defaultRender(tokens, idx, options, env, self);
  };
}
