import React from 'react';
import { render, act } from '@testing-library/react';
// https://stackoverflow.com/questions/56547215/react-testing-library-why-is-tobeinthedocument-not-a-function
import '@testing-library/jest-dom';
import { RouterContext } from 'next/dist/next-server/lib/router-context';
import { ThemeProvider } from '@material-ui/core/styles';
import theme from '../src/theme';
import { mockRouter } from '../test/testUtils';
import siteConfig from '../src/site.config';
import SiteContext from './SiteContext';
import NavHtmlToc from './NavHtmlToc';

describe('NavHtmlToc', () => {
  test('renders nav table of contents', async () => {
    const config = siteConfig;
    const router = mockRouter();
    // const scrollWatcher = new Promise((resolve) => {
    //   window.addEventListener('scroll', () => {
    //     console.log('---scr');
    //     resolve();
    //   });
    // });
    // 本来なら元の関数を実行すべきだが今回は省略
    const mockAddEventListener = jest.fn();
    global.addEventListener = mockAddEventListener;
    const trigger = jest.fn();
    const mock = new Promise((resolve) => {
      trigger.mockImplementation(() => {
        resolve('mm');
      });
    });
    const mockRemoveEventListener = jest.fn((e: string) => {
      if (e === 'scroll') {
        trigger();
      }
    });
    global.removeEventListener = mockRemoveEventListener;
    const htmlToc = {
      items: [
        { label: 'item-1', items: [], id: 'item-1', depth: 0 },
        {
          label: 'item-2',
          items: [
            {
              label: 'item-2-1',
              items: [],
              id: 'item-2-1',
              depth: 1
            }
          ],
          id: 'item-2',
          depth: 0
        },
        { label: 'item-3', items: [], id: 'item-3', depth: 0 }
      ]
    };
    await act(async () => {
      const { unmount, getByRole, getByText } = render(
        <ThemeProvider theme={theme}>
          <RouterContext.Provider value={router}>
            <SiteContext.Provider value={config}>
              <NavHtmlToc htmlToc={htmlToc} />
              <div id="item-1" />
              <div style={{ minHeight: 500 }} />
              <div id="item-2" />
              <div style={{ minHeight: 500 }} />
              <div id="item-2-1" />
              <div style={{ minHeight: 500 }} />
              <div id="item-3" />
              <div style={{ minHeight: 500 }} />
              <div id="item-none" />
            </SiteContext.Provider>
          </RouterContext.Provider>
        </ThemeProvider>
      );
      const rootNav = getByRole('navigation');
      expect(rootNav).toBeInTheDocument();
      const label = getByText('目次');
      expect(label).toBeInTheDocument();
      const active = getByText('item-1');
      expect(active).toBeInTheDocument();
      expect(
        active.parentElement?.parentElement?.children[0]?.className
      ).toContain('active'); // とりあえず初期化直後の状態だけチェック
      ['item-1', 'item-2', 'item-3', 'item-2-1'].forEach((v) => {
        const label = getByText(v);
        expect(label).toBeInTheDocument();
        // fireEvent.click(label);
      });
      // スクロールのテスト方法が不明だったので、
      // handler がリークしていないことのみチェック
      unmount();
      await mock;
      const scrollAdded = mockAddEventListener.mock.calls.filter(
        ([e]) => e === 'scroll'
      );
      const scrollRemoved = mockRemoveEventListener.mock.calls.filter(
        ([e]) => e === 'scroll'
      );
      expect(scrollAdded).toEqual(scrollRemoved);
    });
  });
});
