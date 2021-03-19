import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import { makeStyles } from '@material-ui/core/styles';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Typography from '@material-ui/core/Typography';
//:import SectionContext from '../SectionContext';
import Link from './Link';
import { pruneClasses } from '../utils/classes';
// import SiteContext from '../SiteContext';

const useStyles = makeStyles(() => ({
  'NavBreadcrumbs-root': {},
  'NavBreadcrumbs-link': {},
  'NavBreadcrumbs-last': {}
}));
const classNames = [
  'NavBreadcrumbs-root',
  'NavBreadcrumbs-link',
  'NavBreadcrumbs-last'
];

export type NavBreadcrumbsComponent = {};

type Props = {
  lastBreadcrumb?: string;
  classes?: { [key: string]: string };
};

const NavBreadcrumbs = ({ lastBreadcrumb, classes: inClasses }: Props) => {
  const classes = useStyles({ classes: pruneClasses(inClasses, classNames) });
  const router = useRouter();
  // const { nav } = useContext(SiteContext);
  const nav: {
    // main: { label: string; href: string }[];
    breadcrumbs: { [key: string]: { label: string; href: string }[] };
  } = {
    breadcrumbs: {
      '/': [{ label: 'Home', href: '/' }],
      '/deck': [
        { label: 'Home', href: '/' },
        { label: 'Slides', href: '/deck' }
      ],
      '/about': [
        { label: 'Home', href: '/' },
        { label: 'About', href: '/about' }
      ]
    }
  };
  const depthFromPath = useCallback(() => {
    const rref = `/${router.pathname.split('/', 2)[1]}`;
    return nav.breadcrumbs[rref].slice(0, lastBreadcrumb ? undefined : -1);
  }, [nav.breadcrumbs, router.pathname, lastBreadcrumb]);
  const last = useCallback(() => {
    if (lastBreadcrumb) {
      return lastBreadcrumb;
    }
    const rref = `/${router.pathname.split('/', 2)[1]}`;
    const d = nav.breadcrumbs[rref];
    return d[d.length - 1].label;
  }, [nav.breadcrumbs, router.pathname, lastBreadcrumb]);

  return (
    <Breadcrumbs className={classes['NavBreadcrumbs-root']}>
      {depthFromPath().map(({ label, href }) => (
        <Link key={href} href={href} className={classes['NavBreadcrumbs-link']}>
          {label}
        </Link>
      ))}
      <Typography className={classes['NavBreadcrumbs-last']}>
        {last()}
      </Typography>
    </Breadcrumbs>
  );
};

export default NavBreadcrumbs;
