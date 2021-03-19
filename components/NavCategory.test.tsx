import React from 'react';
import { render, fireEvent } from '@testing-library/react';
// https://stackoverflow.com/questions/56547215/react-testing-library-why-is-tobeinthedocument-not-a-function
import '@testing-library/jest-dom';
import { RouterContext } from 'next/dist/next-server/lib/router-context';
import { mockRouter } from '../test/testUtils';
import NavCategory from './NavCategory';

describe('NavCategory', () => {
  const allCategory = [
    { id: 'cat1', title: 'category1' },
    { id: 'cat2', title: 'category2' },
    { id: 'cat3', title: 'category3' }
  ];
  const category = [
    { id: 'cat1', title: 'category1' },
    { id: 'cat3', title: 'category3' }
  ];
  test('renders nav category', () => {
    const router = mockRouter();
    const { baseElement, getByText, getAllByRole } = render(
      <RouterContext.Provider value={router}>
        <NavCategory
          categoryPath="/posts/category"
          allCategory={allCategory}
          category={category}
        />
      </RouterContext.Provider>
    );
    const rootNav = baseElement.querySelector('body > div > nav');
    expect(rootNav).toBeInTheDocument();
    const rootDiv = baseElement.querySelector('body > div > div');
    expect(rootDiv).not.toBeInTheDocument();
    const category1Title = getByText('category1');
    expect(category1Title).toBeInTheDocument();
    const category3Title = getByText('category3');
    expect(category3Title).toBeInTheDocument();
    const a = getAllByRole('link');
    expect(a.length).toEqual(2);
    expect(a[0].getAttribute('href')).toEqual('/posts/category/cat1');
    expect(a[1].getAttribute('href')).toEqual('/posts/category/cat3');
    fireEvent.click(a[0]);
    expect(router.push).toHaveBeenCalledWith(
      '/posts/category/[...id]',
      '/posts/category/cat1',
      {
        scroll: true,
        locale: undefined,
        shallow: undefined
      }
    );
  });
  test('renders nav all category', () => {
    const router = mockRouter();
    const { baseElement, getByText, getAllByRole } = render(
      <RouterContext.Provider value={router}>
        <NavCategory
          all
          categoryPath="/posts/category"
          allCategory={allCategory}
          category={category}
        />
      </RouterContext.Provider>
    );
    const rootNav = baseElement.querySelector('body > div > nav');
    expect(rootNav).toBeInTheDocument();
    const rootDiv = baseElement.querySelector('body > div > div');
    expect(rootDiv).not.toBeInTheDocument();
    const category1Title = getByText('category1');
    expect(category1Title).toBeInTheDocument();
    const category2Title = getByText('category2');
    expect(category2Title).toBeInTheDocument();
    const category3Title = getByText('category3');
    expect(category3Title).toBeInTheDocument();
    const a = getAllByRole('link');
    expect(a.length).toEqual(3);
    expect(a[0].getAttribute('href')).toEqual('/posts/category/cat1');
    expect(a[1].getAttribute('href')).toEqual('/posts/category/cat2');
    expect(a[2].getAttribute('href')).toEqual('/posts/category/cat3');
    fireEvent.click(a[0]);
    expect(router.push).toHaveBeenCalledWith(
      '/posts/category/[...id]',
      '/posts/category/cat1',
      {
        scroll: true,
        locale: undefined,
        shallow: undefined
      }
    );
  });
});
