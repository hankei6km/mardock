import React from 'react';
import { render, fireEvent } from '@testing-library/react';
// https://stackoverflow.com/questions/56547215/react-testing-library-why-is-tobeinthedocument-not-a-function
import '@testing-library/jest-dom';
import { RouterContext } from 'next/dist/next-server/lib/router-context';
import { mockRouter } from '../test/testUtils';
import NavPagination from './NavPagination';

describe('NavPagination', () => {
  test('renders nav pagination', () => {
    const router = mockRouter();
    const { getByRole, getByText } = render(
      <RouterContext.Provider value={router}>
        <NavPagination
          pageNo={7}
          pageCount={10}
          curCategory={'cat1'}
          paginationHref="/deck/category/[...id]"
          paginationBaseAs="/deck/category"
          paginationPagePath={['page']}
          paginationFirstPageHref={''}
        />
      </RouterContext.Provider>
    );
    const rootNav = getByRole('navigation');
    expect(rootNav).toBeInTheDocument();
    const rootUl = getByRole('list');
    expect(rootUl).toBeInTheDocument();

    const btn1 = getByText(/^1$/);
    expect(btn1).toBeInTheDocument();
    expect(btn1.getAttribute('href')).toEqual('/deck/category/cat1');
    const btn10 = getByText(/^10$/);
    expect(btn10).toBeInTheDocument();
    expect(btn10.getAttribute('href')).toEqual('/deck/category/cat1/page/10');

    const btnSelected = getByText(/^7$/);
    expect(btnSelected).toBeInTheDocument();

    fireEvent.click(btn10);
    expect(router.push).toHaveBeenCalledWith(
      '/deck/category/[...id]',
      '/deck/category/cat1/page/10',
      {
        scroll: true,
        locale: undefined,
        shallow: undefined
      }
    );
  });
  test('renders nav pagination with href of first page', () => {
    const router = mockRouter();
    const { getByRole, getByText } = render(
      <RouterContext.Provider value={router}>
        <NavPagination
          pageNo={7}
          pageCount={10}
          curCategory={''}
          paginationHref="/deck/page/[..id]"
          paginationBaseAs="/deck/page"
          paginationPagePath={[]}
          paginationFirstPageHref={'/deck'}
        />
      </RouterContext.Provider>
    );
    const rootNav = getByRole('navigation');
    expect(rootNav).toBeInTheDocument();
    const rootUl = getByRole('list');
    expect(rootUl).toBeInTheDocument();

    const btn1 = getByText(/^1$/);
    expect(btn1).toBeInTheDocument();
    expect(btn1.getAttribute('href')).toEqual('/deck');
    const btn10 = getByText(/^10$/);
    expect(btn10).toBeInTheDocument();
    expect(btn10.getAttribute('href')).toEqual('/deck/page/10');

    const btnSelected = getByText(/^7$/);
    expect(btnSelected).toBeInTheDocument();

    fireEvent.click(btn1);
    expect(router.push).toHaveBeenCalledWith('/deck', '/deck', {
      scroll: true,
      locale: undefined,
      shallow: undefined
    });
  });
  test('renders nav pagination without curCategory', () => {
    const router = mockRouter();
    const { getByRole, getByText } = render(
      <RouterContext.Provider value={router}>
        <NavPagination
          pageNo={7}
          pageCount={10}
          curCategory={''}
          paginationHref="/deck/category/[...id]"
          paginationBaseAs="/deck/category"
          paginationPagePath={['page']}
          paginationFirstPageHref={''}
        />
      </RouterContext.Provider>
    );
    const rootNav = getByRole('navigation');
    expect(rootNav).toBeInTheDocument();
    const rootUl = getByRole('list');
    expect(rootUl).toBeInTheDocument();

    const btn1 = getByText(/^1$/);
    expect(btn1).toBeInTheDocument();
    expect(btn1.getAttribute('href')).toEqual('/deck/category');
    const btn10 = getByText(/^10$/);
    expect(btn10).toBeInTheDocument();
    expect(btn10.getAttribute('href')).toEqual('/deck/category/page/10');

    const btnSelected = getByText(/^7$/);
    expect(btnSelected).toBeInTheDocument();

    fireEvent.click(btn10);
    expect(router.push).toHaveBeenCalledWith(
      '/deck/category/[...id]',
      '/deck/category/page/10',
      {
        scroll: true,
        locale: undefined,
        shallow: undefined
      }
    );
  });
  test('renders no elements if pagCount===0 ', () => {
    const router = mockRouter();
    const { queryByRole, queryByText } = render(
      <RouterContext.Provider value={router}>
        <NavPagination
          pageNo={0}
          pageCount={0}
          curCategory={''}
          paginationHref="/deck/category/[...id]"
          paginationBaseAs="/deck/category"
          paginationPagePath={['page']}
          paginationFirstPageHref={''}
        />
      </RouterContext.Provider>
    );
    const rootNav = queryByRole('navigation');
    expect(rootNav).not.toBeInTheDocument();
    const btn1 = queryByText(/^1$/);
    expect(btn1).not.toBeInTheDocument();
  });
  test('renders no elements if pagCount==-1 ', () => {
    const router = mockRouter();
    const { queryByRole, queryByText } = render(
      <RouterContext.Provider value={router}>
        <NavPagination
          pageNo={0}
          pageCount={-1}
          curCategory={''}
          paginationHref="/deck/category/[...id]"
          paginationBaseAs="/deck/category"
          paginationPagePath={['page']}
          paginationFirstPageHref={''}
        />
      </RouterContext.Provider>
    );
    const rootNav = queryByRole('navigation');
    expect(rootNav).not.toBeInTheDocument();
    const btn1 = queryByText(/^1$/);
    expect(btn1).not.toBeInTheDocument();
  });
});
