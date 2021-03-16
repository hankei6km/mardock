import {
  pageCountFromTotalCount,
  paginationIdsFromPageCount
} from './pagination';

describe('pageCountFromTotalCount()', () => {
  it('should returns pageCount from totalCount', () => {
    expect(pageCountFromTotalCount(50, 10)).toEqual(5);
    expect(pageCountFromTotalCount(51, 10)).toEqual(6);
    expect(pageCountFromTotalCount(59, 10)).toEqual(6);
    expect(pageCountFromTotalCount(60, 10)).toEqual(6);
    expect(pageCountFromTotalCount(10, 10)).toEqual(1);
    expect(pageCountFromTotalCount(1, 10)).toEqual(1);
    expect(pageCountFromTotalCount(0, 10)).toEqual(0);
    expect(pageCountFromTotalCount(60, 15)).toEqual(4);
    expect(pageCountFromTotalCount(61, 15)).toEqual(5);
    expect(pageCountFromTotalCount(75, 15)).toEqual(5);
    expect(pageCountFromTotalCount(76, 15)).toEqual(6);
    expect(pageCountFromTotalCount(-1, 10)).toEqual(-1);
    expect(pageCountFromTotalCount(-10, 10)).toEqual(-1);
  });
});

describe('paginationIdsFromPageCount()', () => {
  it('should returns ids array from pageCount', () => {
    expect(paginationIdsFromPageCount(3)).toEqual([['1'], ['2'], ['3']]);
    expect(paginationIdsFromPageCount(3, ['page'])).toEqual([
      ['page', '1'],
      ['page', '2'],
      ['page', '3']
    ]);
  });
});
