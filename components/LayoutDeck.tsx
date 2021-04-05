import React, { useEffect } from 'react';
import Layout, { Props } from './Layout';

const LayoutDeck = ({ children, ...others }: Props) => {
  useEffect(() => {
    if (others.deck && others.deck.script) {
      others.deck.script.forEach((b) => {
        const e = document.createElement('script');
        e.innerHTML = b;
        e.dataset.mardockAppended = 'true';
        document.body.appendChild(e);
      });
    }
    return () => {
      const appended = document.querySelectorAll('[data-mardock-appended]');
      // script タグを rmove するだけだとコードの内容によってはリークする?
      appended.forEach((a) => {
        a.remove();
      });
    };
  }, [others.deck]);
  return <Layout {...others}>{children}</Layout>;
};
export default LayoutDeck;
