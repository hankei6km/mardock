export function pageCountFromTotalCount(
  totalCount: number,
  itemsPerPage: number
): number {
  return totalCount < 0
    ? -1
    : Math.floor((totalCount + (itemsPerPage - 1)) / itemsPerPage);
}

export function paginationIdsFromPageCount(
  pageCount: number,
  pagePath: string[] = []
): string[][] {
  const ret: string[][] = new Array(pageCount);
  for (let i = 0; i < pageCount; i++) {
    ret[i] = [...pagePath, `${i + 1}`];
  }
  return ret;
}
