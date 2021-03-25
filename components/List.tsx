import React from 'react';
import { makeStyles, Typography } from '@material-ui/core';
// import { Breakpoint } from '@material-ui/core/styles/createBreakpoints';
// import withWidth, { isWidthUp } from '@material-ui/core/withWidth';
import Box from '@material-ui/core/Box';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
// import GridListTileBar from '@material-ui/core/GridListTileBar';
import Link from '../components/Link';
import { join } from 'path';
import { pruneClasses } from '../utils/classes';
import { IndexList, DeckData } from '../types/pageTypes';
import Carousel from 'react-material-ui-carousel';

const useStyles = makeStyles((theme) => ({
  'List-root': {
    justifyContent: 'space-between',
    gridRowGap: theme.spacing(1)
  },
  'List-thumb-outer': {
    width: '49%'
    // height: '100%',
    // aspectRatio: '16 / 9' // Props で指定させる?
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
const ListItem = ({
  itemId,
  title,
  itemPath,
  deck,
  classes: inClasses
}: {
  itemId: string;
  title: string;
  itemPath: string;
  deck: DeckData;
  classes?: { [key: string]: string };
}) => {
  const classes = useStyles({ classes: pruneClasses(inClasses, classNames) });
  const href = join(itemPath, '[id]');
  return (
    <GridListTile cols={1} className={classes['List-thumb-outer']}>
      <Link href={href} as={join(itemPath, itemId)}>
        {deck.items[0] ? (
          <>
            <style
              dangerouslySetInnerHTML={{
                __html: deck.css
              }}
            />
            <Carousel
              autoPlay={false}
              indicators={false}
              animation={'slide'}
              // 2.2.x だと NavButton が常に表示か非表示にしかできない?
            >
              {deck.items.map(({ html }) => (
                <article
                  key={deck.id}
                  id={deck.id}
                  className={classes['List-thumb']}
                >
                  <div className="slides">
                    <div
                      className="slide"
                      dangerouslySetInnerHTML={{
                        __html: html
                      }}
                    />
                  </div>
                </article>
              ))}
            </Carousel>
          </>
        ) : (
          <Box style={{ height: 180 }}>
            <Typography variant="body1">NO IMAGE</Typography>
          </Box>
        )}
      </Link>
      <Box height="50px" zIndex={2000}>
        {title}
      </Box>
    </GridListTile>
  );
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
