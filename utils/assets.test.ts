import { buildAssets } from './assets';

describe('buildAssets()', () => {
  it('should return boolean in "static" mode', () => {
    expect(buildAssets('', '', false)).toEqual(false);
    expect(buildAssets('', 'true', false)).toEqual(true);
    expect(buildAssets('', '', true)).toEqual(false);
    expect(buildAssets('', 'true', true)).toEqual(false);
    expect(buildAssets('static', '', false)).toEqual(false);
    expect(buildAssets('static', 'true', false)).toEqual(true);
    expect(buildAssets('static', '', true)).toEqual(false);
    expect(buildAssets('static', 'true', true)).toEqual(false);
  });
  it('should return boolean in "dynamic" mode', () => {
    expect(buildAssets('dynamic', '', false)).toEqual(true);
    expect(buildAssets('dynamic', 'true', false)).toEqual(true);
    expect(buildAssets('dynamic', '', true)).toEqual(false);
    expect(buildAssets('dynamic', 'true', true)).toEqual(false);
  });
  it('should return boolean in "always" mode', () => {
    expect(buildAssets('always', '', false)).toEqual(true);
    expect(buildAssets('always', 'true', false)).toEqual(true);
    expect(buildAssets('always', '', true)).toEqual(true);
    expect(buildAssets('always', 'true', true)).toEqual(true);
  });
  it('should return boolean in invalid mode', () => {
    expect(buildAssets('invalid', '', false)).toEqual(false);
    expect(buildAssets('invalid', 'true', false)).toEqual(false);
    expect(buildAssets('invalid', '', true)).toEqual(false);
    expect(buildAssets('invalid', 'true', true)).toEqual(false);
  });
});
