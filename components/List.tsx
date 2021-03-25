import React from 'react';
import { makeStyles } from '@material-ui/core';
import GridList from '@material-ui/core/GridList';
import { pruneClasses } from '../utils/classes';
import { IndexList } from '../types/pageTypes';
import ListItem from './ListItem';

const useStyles = makeStyles((theme) => ({
  'List-root': {
    justifyContent: 'space-between',
    gridRowGap: theme.spacing(1)
  },
  'List-thumb-outer': {
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '49%'
    },
    [theme.breakpoints.up('md')]: {
      width: '32%'
    }
    // aspectRatio: '16 / 9' // Props で指定させる?
  }
}));
const classNames = ['List-root'];

type Props = {
  itemPath: string;
  items: IndexList;
  cellHeight?: number | 'auto';
  cols?: [number, number];
  imgWidth?: number;
  classes?: { [key: string]: string };
};
const List = ({
  itemPath,
  items,
  cellHeight = 'auto',
  cols = [2, 1],
  classes: inClasses
}: Props) => {
  const classes = useStyles({ classes: pruneClasses(inClasses, classNames) });
  return (
    <GridList
      cellHeight={cellHeight}
      // isWidthUp はスクリプトが幅を認識できるまで待っていない?
      // 切り替えはやめる?
      // style で display none で切り替える?
      // cols={isWidthUp('sm', width) ? cols[0] : cols[1]}
      cols={cols[0]}
      className={classes['List-root']}
    >
      {items.contents.map((item) => {
        // if (item.mainVisual) {
        //   src = `${item.mainVisual.url}?${q.toString()}`;
        // }
        return (
          <ListItem
            itemId={item.id}
            title={item.title}
            key={item.id}
            itemPath={itemPath}
            category={item.category}
            deck={item.deck}
            classes={classes}
          />
        );
      })}
    </GridList>
  );
};

// サイズを指定しておかないとレイアウトシフトがおきる.
// 一旦保留.
// export default withWidth()(List);
export default List;
