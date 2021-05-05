const {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD
} = require('next/constants');
const path = require('path');

// This uses phases as outlined here: https://nextjs.org/docs/#custom-configuration
module.exports = (phase) => {
  // when started in development mode `next dev` or `npm run dev` regardless of the value of STAGING environmental variable
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;
  // when `next build` or `npm run build` is used
  const isProd =
    phase === PHASE_PRODUCTION_BUILD && process.env.STAGING !== '1';
  // when `next build` or `npm run build` is used
  const isStaging =
    phase === PHASE_PRODUCTION_BUILD && process.env.STAGING === '1';

  console.log(`isDev:${isDev}  isProd:${isProd}   isStaging:${isStaging}`);

  const env = {
    USE_MOCK_CLIENT: (() => {
      //  $USE_MOCK_CLIENT_FORCE を定義すると強制的に mock client を使う .
      if (isDev && process.env.DISABLE_MOCK_CLIENT !== 'true') return 'true';
      return '';
    })(),
    USE_FALLBACK: (() => {
      // export されたときには使えないので false ('') にする
      // 今回は GitHub 上で実行されていたら pages に export されるという想定.
      // Pages with `fallback` enabled in `getStaticPaths` can not be exported.
      // See more info here: https://err.sh/next.js/ssg-fallback-true-export
      if (process.env.GITHUB_REPOSITORY) return '';
      return 'true';
    })()
  };

  // https://docs.github.com/ja/actions/reference/environment-variables
  let _assetPrefix = process.env.GITHUB_REPOSITORY
    ? `/${process.env.GITHUB_REPOSITORY.split('/', 2)[1]}`
    : '';
  const assetPrefix =
    isStaging && process.env.STAGING_DIR
      ? path.join(process.env.STAGING_DIR, _assetPrefix)
      : _assetPrefix;
      // lib/meta.ts 内で baseUrl を独自に設定しているので注意
  const basePath = assetPrefix;

  console.log(`assetPrefix:${assetPrefix}`);

  // className がサーバーとブラウザーでずれる対策?
  // https://github.com/Learus/react-material-ui-carousel/issues/2
  const withTM = require('next-transpile-modules')([
    'react-material-ui-carousel'
  ]);
  // next.config.js object
  return {
    assetPrefix,
    basePath,
    ...withTM(),
    env
  };
};
