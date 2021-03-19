import { PagesContent } from '../../../../contentTypes';
import { GetContentQuery } from '../../../../queryTypes';
export type Methods = {
  get: {
    query?: GetContentQuery;
    resBody: PagesContent;
  };
};
