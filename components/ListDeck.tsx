import React from 'react';
import { makeStyles } from '@material-ui/core';
import GridList from '@material-ui/core/GridList';
import { pruneClasses } from '../utils/classes';
import { IndexList } from '../types/pageTypes';
import ListDeckItem from './ListDeckItem';

const useStyles = makeStyles((theme) => ({
  'ListDeck-root': {
    width: '100%',
    gridGap: theme.spacing(1),
    justifyContent: 'space-around'
  }
}));
const classNames = ['ListDeck-root'];

type Props = {
  itemPath: string;
  items: IndexList;
  cellHeight?: number | 'auto';
  imgWidth?: number;
  variant?: 'cover' | 'thin';
  classes?: { [key: string]: string };
};
const ListDeck = (props: Props) => {
  const {
    itemPath,
    items,
    cellHeight = 'auto',
    variant,
    classes: inClasses
  } = props;
  const classes = useStyles({
    classes: pruneClasses(inClasses, classNames)
  });
  return (
    <GridList
      cellHeight={cellHeight}
      // isWidthUp はスクリプトが幅を認識できるまで待っていない?
      // 切り替えはやめる?
      // style で display none で切り替える?
      // cols={isWidthUp('sm', width) ? cols[0] : cols[1]}
      className={classes['ListDeck-root']}
    >
      {items.contents.map((item) => (
        // if (item.mainVisual) {
        //   src = `${item.mainVisual.url}?${q.toString()}`;
        // }
        <ListDeckItem
          itemId={item.id}
          title={item.title}
          key={item.id}
          itemPath={itemPath}
          category={item.category}
          deck={item.deck}
          variant={variant}
          classes={inClasses}
        />
      ))}
    </GridList>
  );
};

// サイズを指定しておかないとレイアウトシフトがおきる.
// 一旦保留.
// export default withWidth()(List);
export default ListDeck;
