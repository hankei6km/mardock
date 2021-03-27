import React from 'react';
import { render, fireEvent } from '@testing-library/react';
// https://stackoverflow.com/questions/56547215/react-testing-library-why-is-tobeinthedocument-not-a-function
import '@testing-library/jest-dom';
import { RouterContext } from 'next/dist/next-server/lib/router-context';
import { mockRouter } from '../test/testUtils';
import NavMain from './NavMain';

describe('NavMain', () => {
  test('renders nav main', () => {
    const router = mockRouter();
    const { getAllByRole } = render(
      <RouterContext.Provider value={router}>
        <NavMain />
      </RouterContext.Provider>
    );
    //const navMain = getByText('Home');
    //expect(navMain).toBeInTheDocument();
    const a = getAllByRole('link');
    expect(a.length).toEqual(3);
    // expect(a[0].innerText).toEqual('Home');
    expect(a[0]).toContainHTML('Home');
    expect(a[1]).toContainHTML('Slides');
    expect(a[2]).toContainHTML('About');
    expect(a[0].getAttribute('href')).toEqual('/');
    expect(a[1].getAttribute('href')).toEqual('/deck');
    expect(a[2].getAttribute('href')).toEqual('/about');
  });
  test('renders nav and click', () => {
    const router = mockRouter();
    const { getAllByRole } = render(
      <RouterContext.Provider value={router}>
        <NavMain />
      </RouterContext.Provider>
    );
    const a = getAllByRole('link');
    fireEvent.click(a[1]);
    expect(router.push).toHaveBeenCalledWith('/deck', '/deck', {
      locale: undefined,
      scroll: true,
      shallow: undefined
    });
  });
});
