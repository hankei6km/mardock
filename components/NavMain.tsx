import React, { useCallback, useContext } from 'react';
import { useRouter } from 'next/router';
import { makeStyles } from '@material-ui/core';
import Link from './Link';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { pruneClasses } from '../utils/classes';
import SiteContext from './SiteContext';

const useStyles = makeStyles((theme) => ({
  'NavMain-root': {
    backgroundColor: theme.palette.primary.main,
    [theme.breakpoints.up('md')]: {
      backgroundColor: theme.palette.background.default
    }
  },
  'NavMain-nav': {},
  'NavMain-list': {
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    listStyle: 'none',
    '& li::before': {
      content: '\u200B'
    },
    [theme.breakpoints.up('md')]: {
      flexDirection: 'row',
      justifyContent: 'space-around'
    }
  },
  'NavMain-item': {
    ...theme.typography.h3,
    display: 'flex',
    textAlign: 'right',
    justifyContent: 'flex-end',
    padding: theme.spacing(1),
    [theme.breakpoints.up('md')]: {
      ...theme.typography.body1,
      color: theme.palette.text.secondary,
      display: 'block',
      justifyContent: 'unset',
      padding: 0,
      minWidth: '6em',
      textAlign: 'center'
    }
  },
  'NavMain-indicator': {
    //color: theme.palette.info.main,
    // borderRight: `6px solid ${theme.palette.primary.contrastText}`,
    [theme.breakpoints.up('md')]: {
      color: theme.palette.primary.main
    }
  },
  'NavMain-link': {
    ...theme.typography.h6
  }
}));
const classNames = [
  'NavMain-root',
  'NavMain-list',
  'NavMain-item',
  'NavMain-indicator',
  'NavMain-link'
];

type Props = {
  classes?: { [key: string]: string };
};

const NavMain = ({ classes: inClasses }: Props) => {
  const classes = useStyles({
    classes: pruneClasses(inClasses, classNames)
  });
  const router = useRouter();
  const { nav } = useContext(SiteContext);
  // const { component, variant } = useContext(SectionContext);
  const tabValueFromPath = useCallback(() => {
    const rref = `/${router.pathname.split('/', 2)[1]}`;
    return nav.main.findIndex(({ href }) => href === rref);
  }, [nav.main, router.pathname]);

  return (
    <Box className={classes['NavMain-root']}>
      <nav
        aria-labelledby="primary-navigation"
        className={classes['NavMain-nav']}
      >
        <ul id="primary-navigation" className={classes['NavMain-list']}>
          {nav.main.map(({ label, href }, idx) => (
            <Typography
              component="li"
              key={`${label}:${href}`}
              className={`${classes['NavMain-item']} ${
                idx === tabValueFromPath() ? classes['NavMain-indicator'] : ''
              }`}
            >
              <Link
                href={href}
                color="inherit"
                className={classes['NavMain-link']}
              >
                {label}
              </Link>
            </Typography>
          ))}
        </ul>
      </nav>
    </Box>
  );
};

export default NavMain;
