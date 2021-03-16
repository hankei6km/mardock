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
import { PagesList } from '../types/client/contentTypes';
import { pruneClasses } from '../utils/classes';

const useStyles = makeStyles(() => ({
  'List-root': {},
  'List-thumb-outer': {
    width: '100%',
    height: 180
  },
  'List-thumb': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity: 1,
    transition: 'opacity .3s',
    '&:hover': {
      opacity: 0.8
    }
  }
}));
const classNames = ['List-thumb'];

type Props = {
  itemPath: string;
  items: PagesList;
  cellHeight?: number;
  cols?: [number, number];
  imgWidth?: number;
  classes?: { [key: string]: string };
};
// } & { width: Breakpoint };

const List = ({
  itemPath,
  items,
  cellHeight = 180,
  cols = [2, 1],
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
      {items.contents.map((item, idx) => {
        let src = '';
        if (item.mainVisual) {
          src = `${item.mainVisual.url}?${q.toString()}`;
        }
        return (
          <GridListTile
            key={item.id}
            cols={cols[0] === 2 && idx === 0 ? 2 : 1}
            className={classes['List-thumb-outer']}
          >
            <Link href={href} as={join(itemPath, item.id)}>
              {src !== '' ? (
                <img
                  src={src}
                  className={classes['List-thumb']}
                  width={imgWidth}
                  height={imgHeight}
                  alt={`thumb for ${item.title}`}
                />
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
