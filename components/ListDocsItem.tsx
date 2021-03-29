import React from 'react';
import { makeStyles } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import Typography from '@material-ui/core/Typography';
import Link from './Link';
import { join } from 'path';
import { pruneClasses } from '../utils/classes';
import { PagesCategory } from '../types/client/contentTypes';

const useStyles = makeStyles((theme) => ({
  'ListDocsItem-root': {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(1)
  },
  'ListDocsItem-thumb': {
    width: 80,
    aspectRatio: '16 / 9', // Props で指定させる?
    marginRight: theme.spacing(1),
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
  },
  'ListDocsItem-detail': {
    display: 'flex',
    flexDirection: 'column'
  },
  'ListDocsItem-title': {
    ...theme.typography.body1
  },
  'ListDocsItem-category': {
    display: 'flex',
    flexDirection: 'row'
  }
}));
const classNames = [
  'ListDocsItem-root',
  'ListDocsItem-thumb',
  'ListDocsItem-detail',
  'ListDocsItem-title',
  'ListDocsItem-category'
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
    <Box className={classes['ListDocsItem-root']}>
      <Box className={classes['ListDocsItem-thumb']}>
        <img
          src={mainVisual.url}
          width={mainVisual.width}
          height={mainVisual.height}
          alt={title}
        />
      </Box>
      <Box className={classes['ListDocsItem-detail']}>
        <Typography
          component={Link}
          href={join(itemPath, '[id]')}
          as={join(itemPath, itemId)}
          className={classes['ListDocsItem-title']}
        >
          {title}
        </Typography>
        <Box className={classes['ListDocsItem-category']}>
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
        </Box>
      </Box>
    </Box>
  );
};

export default ListDocsItem;
