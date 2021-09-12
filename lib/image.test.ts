import { FetchMock } from 'jest-fetch-mock';
import { editImageQuery, imageInfo, imageQueryParamsFromAlt } from './image';
import { queryParams } from '../test/testUtils';
// https://github.com/jefflau/jest-fetch-mock/issues/83
const fetchMock = fetch as FetchMock;
beforeEach(() => {
  fetchMock.resetMocks();
});

describe('getSortedPagesData()', () => {
  it('should returns image info', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        PixelWidth: 1000,
        PixelHeight: 500
      })
    );
    const res = await imageInfo('test');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toEqual('test?fm=json');
    expect(queryParams(String(fetchMock.mock.calls[0][0]))).toStrictEqual({
      fm: 'json'
    });
    expect(res).toStrictEqual({ url: 'test', width: 1000, height: 500 });
  });
  it('should adjust rotation', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        TIFF: {},
        Orientation: 6,
        PixelWidth: 1000,
        PixelHeight: 500
      })
    );
    const res = await imageInfo('test');
    expect(res).toStrictEqual({ url: 'test', width: 500, height: 1000 });
  });
});

describe('imageQueryParamsFromAlt()', () => {
  it('should extract query params from alt', () => {
    expect(imageQueryParamsFromAlt('test:q:auto=compress')).toEqual({
      cmd: 'q',
      alt: 'test',
      params: 'auto=compress'
    });
    expect(imageQueryParamsFromAlt('abc:q:auto=compress:123')).toEqual({
      cmd: 'q',
      alt: 'abc123',
      params: 'auto=compress'
    });
    expect(imageQueryParamsFromAlt('q:auto=compress')).toEqual({
      cmd: 'q',
      alt: '',
      params: 'auto=compress'
    });
    expect(imageQueryParamsFromAlt('test:Q:auto=compress')).toEqual({
      cmd: 'Q',
      alt: 'test',
      params: 'auto=compress'
    });
  });
});

describe('editImageQuery()', () => {
  it('should edit query params', () => {
    expect(
      editImageQuery(
        'https://test',
        'https://test/i?w=100&h=100',
        'auto=compress&fit=crop'
      )
    ).toEqual('https://test/i?w=100&h=100&auto=compress&fit=crop');
  });
  it('should edit query params', () => {
    expect(
      editImageQuery(
        'https://test',
        'https://test/i?w=100&h=100',
        'auto=compress&fit=crop',
        true
      )
    ).toEqual('https://test/i?auto=compress&fit=crop');
  });
});
