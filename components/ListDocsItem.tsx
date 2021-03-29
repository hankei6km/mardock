import React from 'react';
import { makeStyles } from '@material-ui/core';
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

const useStyles = makeStyles((theme) => ({
  'ListDocsItem-thumb-outer': {
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '49%'
    },
    [theme.breakpoints.up('md')]: {
      width: '32%'
    }
    // aspectRatio: '16 / 9' // Props で指定させる?
  },
  'ListDocsItem-card-root': {
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
  'ListDocsItem-thumb': {
    width: '100%',
    //aspectRatio: '16 / 9', // Props で指定させる?
    '& img': {
      width: '100%',
      height: '100%',
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
  'ListDocsItem-thumb-outer',
  'ListDocsItem-card-root',
  'ListDocsItem-thumb'
];

type Props = {
  itemId: string;
  title: string;
  mainVisual: {
    url: string;
    width: number;
    height: number;
  };
  itemPath: string;
  category: PagesCategory[];
  classes?: { [key: string]: string };
};
// } & { width: Breakpoint };
const ListDocsItem = ({
  itemId,
  title,
  mainVisual,
  itemPath,
  category,
  classes: inClasses
}: Props) => {
  const classes = useStyles({ classes: pruneClasses(inClasses, classNames) });
  return (
    // GridList と同一の関数でないと(どういう表現が適切?)、cols 関連の設定が無視される.
    // その代わりに GridListTile の幅にあわせて row が break する.
    // この方が使いやすいのだが、バグではないよね
    <GridListTile cols={1} className={classes['ListDocsItem-thumb-outer']}>
      <Card className={classes['ListDocsItem-card-root']} raised>
        <CardMedia className={classes['ListDocsItem-thumb']}>
          <img
            src={mainVisual.url}
            width={mainVisual.width}
            height={mainVisual.height}
            alt={title}
          />
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

export default ListDocsItem;
