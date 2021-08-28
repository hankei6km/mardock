import { FetchMock } from 'jest-fetch-mock/types';
import {
  mockNextApiRequest,
  mockNextApiResponse,
  queryParams
} from '../test/testUtils';
import handlerEnter from '../pages/api/enter-preview/[apiName]';
import handlerExit from '../pages/api/exit-preview';
import { previewSetupHandler } from './preview';

// https://github.com/jefflau/jest-fetch-mock/issues/83
const fetchMock = fetch as FetchMock;
beforeEach(() => {
  fetchMock.resetMocks();
});

// ./preview.ts のテストの他に以下のテストも兼ねている.
// - preview 用の api route のテスト.

describe('previewSetupHandler()', () => {
  const previewSecret = 'test-secret';
  // https://stackoverflow.com/questions/48033841/test-process-env-with-jest
  const OLD_ENV = process.env;
  beforeEach(() => {
    process.env = { ...OLD_ENV, PREVIEW_SECRET: previewSecret };
  });
  afterAll(() => {
    process.env = OLD_ENV;
  });
  it('should enter preview mode', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({ id: 'abcdefg-123', draftKey: 'qqqqqq-56' })
    );
    const reqQuery = {
      previewSecret,
      apiName: 'deck',
      slug: 'abcdefg-123',
      draftKey: 'qqqqqq-56'
    };
    const fn = jest.fn();
    const req = mockNextApiRequest(reqQuery);
    const res = mockNextApiResponse();
    await previewSetupHandler(fn)(req, res);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain('/deck/abcdefg-123?');
    expect(queryParams(String(fetchMock.mock.calls[0][0]))).toStrictEqual({
      fields: 'id',
      draftKey: 'qqqqqq-56'
    });
    expect(res.setPreviewData).toHaveBeenCalledTimes(1);
    expect(res.setPreviewData.mock.calls[0][0]).toStrictEqual({
      apiName: 'deck',
      slug: 'abcdefg-123',
      draftKey: 'qqqqqq-56'
    });
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn.mock.calls[0][0]._mockName).toStrictEqual('mockNextApiRequest');
    expect(fn.mock.calls[0][1]._mockName).toStrictEqual('mockNextApiResponse');
    expect(fn.mock.calls[0][2]).toStrictEqual('abcdefg-123');
  });
  it('should entering has been failed by invalid previewSecret', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({ id: 'abcdefg-123', draftKey: 'qqqqqq-56' })
    );
    const reqQuery = {
      previewSecret: 'invalid',
      apiName: 'deck',
      slug: 'abcdefg-123',
      draftKey: 'qqqqqq-56'
    };
    const fn = jest.fn();
    const req = mockNextApiRequest(reqQuery);
    const res = mockNextApiResponse();
    await previewSetupHandler(fn)(req, res);
    expect(fetchMock).toHaveBeenCalledTimes(0);
    expect(res.setPreviewData).toHaveBeenCalledTimes(0);
    expect(fn).toHaveBeenCalledTimes(0);
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status.mock.calls[0][0]).toStrictEqual(404);
    expect(res.end).toHaveBeenCalledTimes(1);
    expect(res.end.mock.calls[0][0]).toBeUndefined();
  });
  it('should entering has been failed by invalid apiName', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({ id: 'abcdefg-123', draftKey: 'qqqqqq-56' })
    );
    const reqQuery = {
      previewSecret,
      apiName: 'invalid',
      slug: 'abcdefg-123',
      draftKey: 'qqqqqq-56'
    };
    const fn = jest.fn();
    const req = mockNextApiRequest(reqQuery);
    const res = mockNextApiResponse();
    await previewSetupHandler(fn)(req, res);
    expect(fetchMock).toHaveBeenCalledTimes(0);
    expect(res.setPreviewData).toHaveBeenCalledTimes(0);
    expect(fn).toHaveBeenCalledTimes(0);
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status.mock.calls[0][0]).toStrictEqual(404);
    expect(res.end).toHaveBeenCalledTimes(1);
    expect(res.end.mock.calls[0][0]).toBeUndefined();
  });
  it('should entering has been failed by error from fetch', async () => {
    // get api で slug / draftKey の指定ミスをした場合は  HTTP/2 404
    fetchMock.mockResponses([JSON.stringify({}), { status: 404 }]);
    const reqQuery = {
      previewSecret,
      apiName: 'deck',
      slug: 'abcdefg-123',
      draftKey: 'qqqqqq-56'
    };
    const fn = jest.fn();
    const req = mockNextApiRequest(reqQuery);
    const res = mockNextApiResponse();
    await previewSetupHandler(fn)(req, res);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(res.setPreviewData).toHaveBeenCalledTimes(0);
    expect(fn).toHaveBeenCalledTimes(0);
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status.mock.calls[0][0]).toStrictEqual(401);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json.mock.calls[0][0]).toStrictEqual({
      message: 'Invalid slug / draftKey'
    });
  });
});

describe('apienter-.preview[apiName].handler()', () => {
  const previewSecret = 'test-secret';
  // https://stackoverflow.com/questions/48033841/test-process-env-with-jest
  const OLD_ENV = process.env;
  beforeEach(() => {
    process.env = { ...OLD_ENV, PREVIEW_SECRET: previewSecret };
  });
  afterEach(() => {
    process.env = OLD_ENV;
  });

  it('should enter preview mode', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({ id: 'abcdefg-123', draftKey: 'qqqqqq-56' })
    );
    const reqQuery = {
      previewSecret,
      apiName: 'deck',
      slug: 'abcdefg-123',
      draftKey: 'qqqqqq-56'
    };
    const req = mockNextApiRequest(reqQuery);
    const res = mockNextApiResponse();
    await handlerEnter(req, res);

    // redirect で振られるところだけチェック:
    expect(res.writeHead).toHaveBeenCalledTimes(1);
    expect(res.writeHead.mock.calls[0][0]).toStrictEqual(307);
    expect(res.writeHead.mock.calls[0][1]).toStrictEqual({
      Location: '/deck/abcdefg-123'
    });
    expect(res.end).toHaveBeenCalledTimes(1);
    expect(res.end.mock.calls[0][0]).toStrictEqual('Preview mode enabled');
  });

  it('should enter preview mode with asset prefix', async () => {
    process.env.API_REDIRECT_ASSET_PREFIX = '/path/to';
    fetchMock.mockResponseOnce(
      JSON.stringify({ id: 'abcdefg-123', draftKey: 'qqqqqq-56' })
    );
    const reqQuery = {
      previewSecret,
      apiName: 'deck',
      slug: 'abcdefg-123',
      draftKey: 'qqqqqq-56'
    };
    const req = mockNextApiRequest(reqQuery);
    const res = mockNextApiResponse();
    await handlerEnter(req, res);

    // redirect で振られるところだけチェック:
    expect(res.writeHead).toHaveBeenCalledTimes(1);
    expect(res.writeHead.mock.calls[0][0]).toStrictEqual(307);
    expect(res.writeHead.mock.calls[0][1]).toStrictEqual({
      Location: '/path/to/deck/abcdefg-123'
    });
    expect(res.end).toHaveBeenCalledTimes(1);
    expect(res.end.mock.calls[0][0]).toStrictEqual('Preview mode enabled');
  });
});

describe('api.exit-previee.handler()', () => {
  it('should exit preview mode', async () => {
    const req = mockNextApiRequest({});
    const res = mockNextApiResponse();
    await handlerExit(req, res);

    // preview context がクリアされる
    expect(res.clearPreviewData).toHaveBeenCalledTimes(1);
    // redirect で '/' に振られる
    expect(res.writeHead).toHaveBeenCalledTimes(1);
    expect(res.writeHead.mock.calls[0][0]).toStrictEqual(307);
    expect(res.writeHead.mock.calls[0][1]).toStrictEqual({
      Location: '/'
    });
    expect(res.end).toHaveBeenCalledTimes(1);
    expect(res.end.mock.calls[0][0]).toBeUndefined();
  });
});
