import React from 'react';
import { makeStyles } from '@material-ui/core';
import Layout, { Props as LayoutProps, appBarHeight } from './Layout';
// import Box from '@material-ui/core/Box';

const useStyles = makeStyles((theme) => ({
  'NavBreadcrumbs-outer': {
    [theme.breakpoints.up('md')]: {
      position: 'sticky',
      top: appBarHeight
    }
  },
  'Layout-section-root': {
    '& .Layout-body': {
      [theme.breakpoints.up('md')]: {
        gridTemplateAreas:
          '"main main main main main main main bot bot bot bot"'
      }
    }
  },
  'Layout-section': ({ sectionStickyTop }: Props) => ({
    gridArea: 'main',
    position: 'sticky',
    top: sectionStickyTop,
    transition: 'top .3s',
    // ...theme.typography.body1,
    padding: theme.spacing(0),
    [theme.breakpoints.up('md')]: {
      position: 'fixed',
      top: 130,
      // window 幅いっぱいまで広げる.
      // gridTemplateAreas での main 指定幅は子要素の方で widht を指定
      width: '100%',
      maxWidth: theme.breakpoints.values.lg
      // top: 'unset'
    }
  }),
  'Layout-children': {
    widht: '100%',
    position: 'sticky',
    top: 66
  }
}));

type Props = { sectionStickyTop: number } & LayoutProps;

const LayoutDeck = (props: Props) => {
  const {
    children,
    section,
    sectionStickyTop,
    classes: inClasses,
    ...others
  } = props;
  const classes = useStyles(props);
  // useEffect(() => {
  //   if (others.deck && others.deck.script) {
  //     others.deck.script.forEach((b) => {
  //       const e = document.createElement('script');
  //       e.innerHTML = b;
  //       e.dataset.mardockAppended = 'true';
  //       document.body.appendChild(e);
  //     });
  //   }
  //   return () => {
  //     const appended = document.querySelectorAll('[data-mardock-appended]');
  //     // script タグを rmove するだけだとコードの内容によってはリークする?
  //     appended.forEach((a) => {
  //       a.remove();
  //     });
  //   };
  // }, [others.deck]);
  return (
    <Layout
      {...others}
      headerHideOptions={{
        disableHysteresis: true,
        threshold: 0
      }}
      section={section}
      classes={classes}
    >
      {children}
    </Layout>
  );
};
export default LayoutDeck;
