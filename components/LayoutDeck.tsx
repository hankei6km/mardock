import React from 'react';
import { makeStyles } from '@material-ui/core';
import Layout, { Props } from './Layout';
// import Box from '@material-ui/core/Box';

const useStyles = makeStyles((theme) => ({
  'Layout-section-root': {
    '& .Layout-body': {
      [theme.breakpoints.up('md')]: {
        gridTemplateAreas:
          '"main main main main main main main bot bot bot bot"'
      }
    }
  },
  'Layout-section': {
    gridArea: 'main',
    // position: 'sticky',
    // top: -300,
    // ...theme.typography.body1,
    padding: theme.spacing(0, 1),
    [theme.breakpoints.up('md')]: {
      position: 'unset',
      top: 'unset'
    }
  },
  'Layout-children': {
    widht: '100%',
    position: 'sticky',
    top: 66
  }
}));

const LayoutDeck = ({ children, ...others }: Props) => {
  const classes = useStyles();
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
      // section={<Box className={classes['Layout-children']}>{children}</Box>}
      classes={classes}
    >
      {children}
    </Layout>
  );
};
export default LayoutDeck;
