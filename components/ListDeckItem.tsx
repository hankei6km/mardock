import React from 'react';
import { makeStyles } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import Card from '@material-ui/core/Card';
// import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import GridListTile from '@material-ui/core/GridListTile';
import Typography from '@material-ui/core/Typography';
import Link from './Link';
import { join } from 'path';
import { pruneClasses } from '../utils/classes';
import { PagesCategory } from '../types/client/contentTypes';
import { DeckData } from '../types/pageTypes';
import Carousel from 'react-material-ui-carousel';

const useStyles = makeStyles((theme) => ({
  'ListDeckItem-thumb-outer': (props: Props) =>
    props.variant === 'thin'
      ? {
          width: '100%'
        }
      : {
          width: '100%',
          [theme.breakpoints.up('sm')]: {
            width: '49%'
          },
          [theme.breakpoints.up('md')]: {
            width: '32%'
          }
          // aspectRatio: '16 / 9' // Props で指定させる?
        },
  'ListDeckItem-card-root': {
    marginBottom: theme.spacing(1),
    '& .MuiCardContent-root ': {
      padding: theme.spacing(0.5, 1)
    },
    '& .MuiCardActions-root': {
      minHeight: 40,
      padding: theme.spacing(0.5, 1),
      marginBottom: theme.spacing(0.5)
    },
    '& .MuiChip-root': {
      // padding: theme.spacing(0.5, 1),
      marginRight: theme.spacing(1)
    }
  },
  'ListDeckItem-thumb': {
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
const classNames = [
  'ListDeckItem-thumb-outer',
  'ListDeckItem-card-root',
  'ListDeckItem-thumb'
];

type Props = {
  itemId: string;
  title: string;
  itemPath: string;
  category: PagesCategory[];
  deck: DeckData;
  variant?: 'thin';
  classes?: { [key: string]: string };
};
// } & { width: Breakpoint };
const ListDeckItem = (props: Props) => {
  const { itemId, title, itemPath, category, deck, classes: inClasses } = props;
  const classes = useStyles({
    ...props,
    classes: pruneClasses(inClasses, classNames)
  });
  return (
    // GridList と同一の関数でないと(どういう表現が適切?)、cols 関連の設定が無視される.
    // その代わりに GridListTile の幅にあわせて row が break する.
    // この方が使いやすいのだが、バグではないよね
    <GridListTile cols={1} className={classes['ListDeckItem-thumb-outer']}>
      <Card className={classes['ListDeckItem-card-root']} raised>
        <CardMedia>
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
                  <Link
                    key={itemId}
                    href={join(itemPath, '[id]')}
                    as={join(itemPath, itemId)}
                    // article を link でラップはあり?
                  >
                    <article
                      key={deck.id}
                      id={deck.id}
                      className={classes['ListDeckItem-thumb']}
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
                  </Link>
                ))}
              </Carousel>
            </>
          ) : (
            <Box style={{ height: 180 }}>
              <Typography variant="body1">NO IMAGE</Typography>
            </Box>
          )}
        </CardMedia>
        <CardContent>
          <Typography
            component={Link}
            href={join(itemPath, '[id]')}
            as={join(itemPath, itemId)}
            variant="body2"
          >
            {title}
          </Typography>
        </CardContent>
        <CardActions disableSpacing={true}>
          {category.map((c) => (
            <Chip
              key={c.id}
              label={c.title}
              size="small"
              color={'primary'}
              // variant="outlined"
              // variant="contained"
              component={Link}
              // className={'MuiChip-outlined'}
              href={join(itemPath, 'category', '[id]')}
              as={join(itemPath, 'category', c.id)}
            />
          ))}
        </CardActions>
      </Card>
    </GridListTile>
  );
};

export default ListDeckItem;
