import { NextApiRequest, NextApiResponse } from 'next';
import { join } from 'path';
import { previewSetupHandler } from '../../../lib/preview';

// apiName によって、どの API のプレビューか決定する..
// apiName で動的に扱うにはリダイレクト先をどこかで決める必要がある。
// と、思ったのだが、やはり分ける?

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse,
  id: string
) => {
  let location = '';
  switch (req.query.apiName) {
    case 'pages':
      // pages では slug は実質的には使わない(問題出るか?)
      // slug が指す id が含まれる location へリダイレクトさせる
      switch (id) {
        case 'home':
          location = `/`;
          break;
        case 'deck':
          location = `/deck`;
          break;
        case 'docs':
          location = `/docs`;
          break;
        case 'about':
          location = `/about`;
          break;
      }
      break;
    case 'deck':
      location = `/${req.query.apiName}/${id}`;
      break;
    case 'docs':
      location = `/${req.query.apiName}/${id}`;
      break;
  }
  if (location) {
    if (process.env.API_REDIRECT_ASSET_PREFIX) {
      location = join(process.env.API_REDIRECT_ASSET_PREFIX, location);
    }
    res.writeHead(307, { Location: location });
    return res.end('Preview mode enabled');
  }

  return res.status(404).end();
};

export default previewSetupHandler(handler);
