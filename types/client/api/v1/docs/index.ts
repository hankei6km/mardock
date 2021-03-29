import { PagesContents, PagesList, PagesIds } from '../../../contentTypes';
import { GetFieldsIdQuery, GetPagesItemQuery } from '../../../queryTypes';

export type Methods = {
  get: {
    resBody: PagesContents;
    polymorph: [
      {
        query: GetFieldsIdQuery;
        resBody: PagesIds;
      },
      {
        query: GetPagesItemQuery;
        resBody: PagesList;
      }
    ];
  };
};
