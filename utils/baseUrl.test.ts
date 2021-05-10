import { getBaseUrl } from './baseUrl';

const saveEnv = process.env;
beforeEach(() => {
  process.env = {
    ...saveEnv
  };
  process.env.BASE_URL = '';
  process.env.GITHUB_REPOSITORY = '';
});
afterEach(() => {
  process.env = saveEnv;
});
describe('getBaseUrl()', () => {
  it('should return baseUrl', () => {
    expect(getBaseUrl()).toEqual(''); // 現状ではブランクとなる.
  });
  it('should return baseUrl by $BASE_URL', () => {
    process.env.BASE_URL = 'https://hankei6km.github.io/mardock/develop';
    expect(getBaseUrl()).toEqual('https://hankei6km.github.io/mardock/develop');
  });
  it('should return baseUrl by $BASE_URL', () => {
    process.env.GITHUB_REPOSITORY = 'hankei6km/mardock';
    expect(getBaseUrl()).toEqual('https://hankei6km.github.io/mardock');
  });
});
