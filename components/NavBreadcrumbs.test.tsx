import React from 'react';
import { render, fireEvent } from '@testing-library/react';
// https://stackoverflow.com/questions/56547215/react-testing-library-why-is-tobeinthedocument-not-a-function
import '@testing-library/jest-dom';
import { RouterContext } from 'next/dist/next-server/lib/router-context';
import { mockRouter } from '../test/testUtils';
import NavBreadcrumbs from './NavBreadcrumbs';

describe('NavBreadcrumbs', () => {
  test('renders nav breadcrumbs in blog', () => {
    const router = mockRouter();
    router.pathname = '/deck';
    router.route = '/deck';
    router.asPath = '/deck';
    const { baseElement, getByText, getAllByRole } = render(
      <RouterContext.Provider value={router}>
        <NavBreadcrumbs />
      </RouterContext.Provider>
    );
    const rootNav = baseElement.querySelector('body > div > nav');
    expect(rootNav).toBeInTheDocument();
    const ol = baseElement.querySelector('body > div > nav > ol');
    expect(ol).toBeInTheDocument();
    const home = getByText('Home');
    expect(home).toBeInTheDocument();
    const blog = getByText('Slides');
    expect(blog).toBeInTheDocument();
    const a = getAllByRole('link');
    expect(a.length).toEqual(1);
    expect(a[0].getAttribute('href')).toEqual('/');
    fireEvent.click(a[0]);
    expect(router.push).toHaveBeenCalledWith('/', '/', {
      locale: undefined,
      scroll: true,
      shallow: undefined
    });
  });
  test('renders nav breadcrumbs with lastBreadcrumb', () => {
    const router = mockRouter();
    router.pathname = '/deck';
    router.route = '/deck';
    router.asPath = '/deck';
    const { baseElement, getByText, getAllByRole } = render(
      <RouterContext.Provider value={router}>
        <NavBreadcrumbs lastBreadcrumb={'test-last'} />
      </RouterContext.Provider>
    );
    const rootNav = baseElement.querySelector('body > div > nav');
    expect(rootNav).toBeInTheDocument();
    const ol = baseElement.querySelector('body > div > nav > ol');
    expect(ol).toBeInTheDocument();
    const home = getByText('Home');
    expect(home).toBeInTheDocument();
    const blog = getByText('Slides');
    expect(blog).toBeInTheDocument();
    const last = getByText('test-last');
    expect(last).toBeInTheDocument();
    const a = getAllByRole('link');
    expect(a.length).toEqual(2);
    expect(a[0].getAttribute('href')).toEqual('/');
    expect(a[1].getAttribute('href')).toEqual('/deck');
    fireEvent.click(a[1]);
    expect(router.push).toHaveBeenCalledWith('/deck', '/deck', {
      locale: undefined,
      scroll: true,
      shallow: undefined
    });
    fireEvent.click(a[0]);
    expect(router.push).toHaveBeenCalledWith('/', '/', {
      locale: undefined,
      scroll: true,
      shallow: undefined
    });
  });
});
