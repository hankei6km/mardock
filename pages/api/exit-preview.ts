import { NextApiRequest, NextApiResponse } from 'next';
import { join } from 'path';

// enter のように apiName で分ける?
export default (_: NextApiRequest, res: NextApiResponse) => {
  // https://microcms.io/blog/nextjs-preview-mode
  res.clearPreviewData();

  // https://github.com/vercel/next.js/blob/b41f9baaa413d5dac29faf107663214c0923c8bd/examples/cms-contentful/pages/api/exit-preview.js
  // Redirect the user back to the index page.
  // どこにリダイレクトするのが良い?
  let location = '/';
  if (
    process.env.PREVIEW_REDIRECT_BASE_PATH &&
    process.env.PREVIEW_REDIRECT_BASE_PATH.startsWith('/')
  ) {
    location = join(process.env.PREVIEW_REDIRECT_BASE_PATH, location);
  }
  res.writeHead(307, { Location: location });
  res.end();
};
