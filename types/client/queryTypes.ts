export type GetQuery = {
  draftKey?: string;
  limit?: number;
  offset?: number;
  orders?: string;
  q?: string;
  ids?: string;
  filters?: string;
  // 以下の 2 パラメーターはレスポンスの型が変わるので、
  // リテラル型である程度縛りをかけて定義(GetIdsQuery のような感じ).
  // レスポンスの型もそれにあわせて `Pick` `Omit` 等する.
  // fields?: string; //  ('id'|'title'|...)[] のようにしてパラメーターのシリアライズを手動とかでないと正しくないフィールド名を弾けない、かな?
  // depth?: number;
};

export type GetContentQuery = {
  draftKey?: string;
  fields:
    | 'id,createdAt,updatedAt,publishedAt,revisedAt,title,html,source,category,mainVisual,description'
    | 'id,createdAt,updatedAt,publishedAt,revisedAt,title,source,category,mainVisual,description';
  // fields?: string;
  // depth?: number;
};

export type GetFieldsIdQuery = {
  fields: 'id';
} & Omit<GetQuery, 'ids'>;

export type GetPagesItemQuery = {
  // 今回はリストもすべて受信
  fields: 'id,createdAt,updatedAt,publishedAt,revisedAt,title,html,source,category,mainVisual';
} & GetQuery;
