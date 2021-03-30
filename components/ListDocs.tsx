import React from 'react';
import { makeStyles } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import { pruneClasses } from '../utils/classes';
import { IndexList } from '../types/pageTypes';
import ListDocsItem from './ListDocsItem';

const useStyles = makeStyles((theme) => ({
  'ListDocs-root': {
    margin: 0,
    padding: theme.spacing(0, 1),
    listStyle: 'none',
    '& li::before': {
      content: '\u200B'
    }
  }
}));
const classNames = ['ListDocs-root'];

type Props = {
  itemPath: string;
  items: IndexList;
  cellHeight?: number | 'auto';
  cols?: [number, number];
  imgWidth?: number;
  classes?: { [key: string]: string };
};
const ListDocs = ({ itemPath, items, classes: inClasses }: Props) => {
  const classes = useStyles({ classes: pruneClasses(inClasses, classNames) });
  return (
    <Box component="ul" className={classes['ListDocs-root']}>
      {items.contents.map((item) => (
        <ListDocsItem
          itemId={item.id}
          title={item.title}
          mainVisual={item.mainVisual}
          key={item.id}
          itemPath={itemPath}
          category={item.category}
          classes={classes}
        />
      ))}
    </Box>
  );
};

// サイズを指定しておかないとレイアウトシフトがおきる.
// 一旦保留.
// export default withWidth()(List);
export default ListDocs;
