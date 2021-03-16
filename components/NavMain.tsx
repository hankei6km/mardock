import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import { makeStyles } from '@material-ui/core/styles';
import Link from './Link';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { pruneClasses } from '../utils/classes';

const useStyles = makeStyles((theme) => ({
  'NavMain-root': {},
  'NavMain-group': {},
  'NavMain-item': {
    textTransform: 'none',
    opacity: 1,
    color: theme.palette.text.secondary,
    // transition: 'opacity .3s',
    '&:hover': { textDecorationLine: 'none', opacity: 0.5 }
  }
}));
const classNames = ['NavMain-root', 'NavMain-group', 'NavMain-item'];

type Props = {
  classes?: { [key: string]: string };
};

const NavMain = ({ classes: inClasses }: Props) => {
  const classes = useStyles({ classes: pruneClasses(inClasses, classNames) });
  const router = useRouter();
  // const { nav } = useContext(SiteContext);
  // const { component, variant } = useContext(SectionContext);
  const nav: {
    main: { label: string; href: string }[];
    // breadcrumbs: { [key: string]: { label: string; href: string }[] };
  } = {
    main: [
      { label: 'Home', href: '/' },
      { label: 'Slides', href: '/deck' },
      { label: 'About', href: '/about' }
    ]
  };
  const tabValueFromPath = useCallback(() => {
    const rref = `/${router.pathname.split('/', 2)[1]}`;
    return nav.main.findIndex(({ href }) => href === rref);
  }, [nav.main, router.pathname]);

  return (
    <nav
      aria-labelledby="primary-navigation"
      className={classes['NavMain-root']}
    >
      <Tabs
        id="primary-navigation"
        indicatorColor="primary"
        textColor="primary"
        value={tabValueFromPath()}
        centered
        className={classes['NavMain-group']}
      >
        {nav.main.map(({ label, href }) => (
          <Tab
            key={`${label}:${href}`}
            className={classes['NavMain-item']}
            component={Link}
            label={label}
            href={href}
          />
        ))}
      </Tabs>
    </nav>
  );
};

export default NavMain;
