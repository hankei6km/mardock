// https://github.com/mui-org/material-ui/blob/8558ec2e55486561503f2f736f57f70eea48e044/examples/nextjs/pages/_app.js
import React from 'react';
import { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import Head from 'next/head';
import { ThemeProvider } from '@material-ui/core/styles';
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import theme from '../src/theme';
import { join } from 'path';
import 'lite-youtube-embed/src/lite-yt-embed.css';
import '../src/slick.css';
import '../src/slick-theme.css';
import { SnackbarProvider } from 'notistack';
import SiteContext from '../components/SiteContext';
import siteConfig from '../src/site.config';

const useStyles = makeStyles((theme) => ({
  containerRoot: {
    width: theme.breakpoints.values.sm
  }
}));

export default function MyApp({ Component, pageProps }: AppProps) {
  const classes = useStyles();
  React.useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles && jssStyles.parentElement) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  // React.createContext だと router から外れた場所からの get では
  // 共有されないもよう。
  // sessionStorage は?
  // https://ja.reactjs.org/docs/hooks-faq.html#how-to-avoid-passing-callbacks-down

  const router = useRouter();
  return (
    <React.Fragment>
      <Head>
        <title>My page</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
        {/* lite-youtube-embed を適用すると Youtube を埋め込んだページで
         server と browser で異なる内容になる
        */}
        <script
          type="text/javascript"
          src={join(router.basePath, '/scripts/lite-yt-embed.js')}
        ></script>
      </Head>
      <ThemeProvider theme={theme}>
        <SnackbarProvider
          maxSnack={3}
          dense
          hideIconVariant
          classes={{ containerRoot: classes.containerRoot }}
        >
          <SiteContext.Provider value={siteConfig}>
            {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
            <CssBaseline />
            <Component {...pageProps} />
          </SiteContext.Provider>
        </SnackbarProvider>
      </ThemeProvider>
    </React.Fragment>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired
};
