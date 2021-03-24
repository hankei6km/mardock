import React from 'react';
import { makeStyles, Typography } from '@material-ui/core';
// import { Breakpoint } from '@material-ui/core/styles/createBreakpoints';
// import withWidth, { isWidthUp } from '@material-ui/core/withWidth';
import Box from '@material-ui/core/Box';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import Link from '../components/Link';
import { join } from 'path';
import { pruneClasses } from '../utils/classes';
import { IndexList } from '../types/pageTypes';

const useStyles = makeStyles(() => ({
  'List-root': {},
  'List-thumb-outer': {
    width: '100%',
    // height: '100%',
    aspectRatio: '16 / 9' // Props で指定させる?
  },
  'List-thumb': {
    '& .slide': {
      objectFit: 'cover',
      objectPosition: '50% 50%',
      opacity: 1,
      transition: 'opacity .3s',
      '&:hover': {
        opacity: 0.8
      }
    }
  }
}));
const classNames = ['List-thumb'];

type Props = {
  itemPath: string;
  items: IndexList;
  cellHeight?: number | 'auto';
  cols?: [number, number];
  imgWidth?: number;
  classes?: { [key: string]: string };
};
// } & { width: Breakpoint };

const List = ({
  itemPath,
  items,
  cellHeight = 'auto',
  cols = [1, 1],
  imgWidth = 380,
  classes: inClasses
}: Props) => {
  const classes = useStyles({ classes: pruneClasses(inClasses, classNames) });
  const href = join(itemPath, '[id]');
  const imgHeight = imgWidth / 1.6;
  const q = new URLSearchParams('');
  q.append('w', `${imgWidth}`);
  q.append('h', `${imgHeight}`);
  q.append('fit', 'crop');
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
          <GridListTile
            key={item.id}
            cols={1}
            className={classes['List-thumb-outer']}
          >
            <Link href={href} as={join(itemPath, item.id)}>
              {item.deck.items[0] ? (
                <>
                  <style
                    dangerouslySetInnerHTML={{
                      __html: item.deck.css
                    }}
                  />
                  <article id={item.deck.id} className={classes['List-thumb']}>
                    <div className="slides">
                      <div
                        className="slide"
                        dangerouslySetInnerHTML={{
                          __html: item.deck.items[0].html
                        }}
                      />
                    </div>
                  </article>
                </>
              ) : (
                <Box style={{ height: 180 }}>
                  <Typography variant="body1">NO IMAGE</Typography>
                </Box>
              )}
              <GridListTileBar title={item.title} titlePosition="bottom" />
            </Link>
          </GridListTile>
        );
      })}
    </GridList>
  );
};

// サイズを指定しておかないとレイアウトシフトがおきる.
// 一旦保留.
// export default withWidth()(List);
export default List;
