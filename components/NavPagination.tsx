import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Pagination from '@material-ui/lab/Pagination';
import PaginationItem from '@material-ui/lab/PaginationItem';
//:import SectionContext from '../SectionContext';
import Link from './Link';
import { pruneClasses } from '../utils/classes';

const useStyles = makeStyles(() => ({
  'NavPagination-root': {}
}));
const classNames = ['NavPagination-root'];

export type NavPaginationComponent = {};

type Props = {
  pageNo: number;
  pageCount: number;
  curCategory: string;
  paginationHref: string;
  paginationBaseAs: string;
  paginationPagePath: string[];
  paginationFirstPageHref: string;
  classes?: { [key: string]: string };
};

const NavPagination = ({
  pageNo,
  pageCount,
  curCategory,
  paginationHref,
  paginationBaseAs,
  paginationPagePath,
  paginationFirstPageHref = '',
  classes: inClasses
}: Props) => {
  const classes = useStyles({ classes: pruneClasses(inClasses, classNames) });
  // const { component } = useContext(SectionContext);
  const asRoot = `${paginationBaseAs}${curCategory ? `/${curCategory}` : ''}`;
  const asPagePath = `${
    paginationPagePath.length > 0 ? `/${paginationPagePath.join('/')}` : ''
  }`;

  if (pageCount <= 0) {
    return <></>;
  }

  // Buttons do not have an accessible name になる.
  // next と prev ボタンが問題らしい。
  return (
    <Pagination
      // nv になるもよう
      className={classes['NavPagination-root']}
      page={pageNo}
      count={pageCount}
      renderItem={(item) => (
        <PaginationItem
          component={Link}
          href={
            item.page === 1 && paginationFirstPageHref
              ? paginationFirstPageHref
              : paginationHref
          }
          as={
            item.page === 1 && paginationFirstPageHref
              ? undefined
              : `${asRoot}${
                  item.page === 1 ? '' : `${asPagePath}/${item.page}`
                }`
          }
          //{...item}
          page={item.page}
          disabled={item.disabled}
          selected={item.selected}
          shape={item.shape}
          size={item.size}
          type={item.type}
        />
      )}
    />
  );
};

export default NavPagination;
