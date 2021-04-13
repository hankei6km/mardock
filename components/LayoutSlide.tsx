import React, { ReactNode, useEffect } from 'react';
import Head from 'next/head';
import { browser as marpCoreBrowserScript } from '@marp-team/marp-core/browser';
import Notification from './Notification';
import { SlideData } from '../types/pageTypes';

type Props = {
  children?: ReactNode;
} & SlideData;

const Layout = ({ notification, head, body }: Props) => {
  useEffect(() => {
    body.forEach((b) => {
      const e = document.createElement(b.tagName);
      e.innerHTML = b.html;
      Object.entries(b.attribs).forEach(([k, v]) => {
        e.setAttribute(k, v);
      });
      e.dataset.mardockAppended = 'true';
      document.body.appendChild(e);
    });
    return () => {
      const appended = document.querySelectorAll('[data-mardock-appended]');
      // script タグを rmove するだけだとコードの内容によってはリークする?
      appended.forEach((a) => {
        a.remove();
      });
    };
  }, [body]);
  useEffect(() => {
    // 上記のプレゼンテーション用とは別の helper script.
    // Layout.tsx とやっていることは同じ.
    const cleanup = marpCoreBrowserScript();
    return () => cleanup();
  }, []);
  return (
    <>
      <Head>
        {head.map((childItem, i) =>
          React.createElement(childItem.tagName, {
            ...childItem.attribs,
            key: `${childItem.tagName}-${i}`,
            dangerouslySetInnerHTML: childItem.html
              ? { __html: childItem.html }
              : undefined
          })
        )}
      </Head>
      {notification && notification.title && (
        <Notification
          title={notification.title}
          messageHtml={notification.messageHtml}
          serverity={notification.serverity}
        />
      )}
    </>
  );
};

export default Layout;
