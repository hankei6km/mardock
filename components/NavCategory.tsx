import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Link from './Link';
import { pruneClasses } from '../utils/classes';
import { PagesCategory } from '../types/client/contentTypes';

const useStyles = makeStyles((theme) => ({
  'NavCategory-root': {
    width: '100%'
  },
  'NavCategory-list': {
    display: 'flex',
    // justifyContent: 'space-around',
    // justifyContent: 'center',
    listStyle: 'none',
    margin: 0,
    padding: 0,
    '& li::before': {
      content: '\u200B'
    }
  },
  'NavCategory-link': {
    //width: '100%'
    '& a': {
      color: theme.palette.primary.contrastText
    },
    backgroundColor: theme.palette.primary.main,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(0.5),
    marginRight: theme.spacing(1)
  },
  'NavCategory-all-root': {},
  'NavCategory-all-list': {
    display: 'flex',
    justifyContent: 'space-around',
    listStyle: 'none',
    '& li::before': {
      content: '\u200B'
    }
  },
  'NavCategory-all-link': {
    // '&:hover': { textDecorationLine: 'none'}
  }
}));
const classNames = [
  'NavCategory-root',
  'NavCategory-list',
  'NavCategory-link',
  'NavCategory-all-root',
  'NavCategory-all-list',
  'NavCategory-all-link'
];

type Props = {
  all?: boolean;
  categoryPath: string;
  allCategory: PagesCategory[];
  category: PagesCategory[];
  classes?: { [key: string]: string };
};

const NavCategory = ({
  all = false,
  categoryPath,
  allCategory,
  category,
  classes: inClasses
}: Props) => {
  const classes = useStyles({ classes: pruneClasses(inClasses, classNames) });
  return (
    <Box
      component={all ? 'nav' : 'nav'}
      className={classes[all ? 'NavCategory-all-root' : 'NavCategory-root']}
    >
      <ul
        className={classes[all ? 'NavCategory-all-list' : 'NavCategory-list']}
      >
        {(all ? allCategory : category).map(({ id, title }) => (
          <Typography
            key={id}
            component="li"
            className={
              classes[all ? 'NavCategory-all-link' : 'NavCategory-link']
            }
          >
            <Link href={`${categoryPath}/[...id]`} as={`${categoryPath}/${id}`}>
              {title}
            </Link>
          </Typography>
        ))}
      </ul>
    </Box>
  );
};

export default NavCategory;
