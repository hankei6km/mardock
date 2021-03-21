import React, { ReactNode, useEffect } from 'react';
// import { useRouter } from 'next/router';
import { makeStyles } from '@material-ui/core';
// import NoSsr from '@material-ui/core/NoSsr';
import Head from 'next/head';
import Container from '@material-ui/core/Container';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import GitHubIcon from '@material-ui/icons/GitHub';
import TwitterIcon from '@material-ui/icons/Twitter';
import Notification from './Notification';
import { PageData } from '../types/pageTypes';
import { ApiNameArticle } from '../types/apiName';
import Link from './Link';
import NavMain from './NavMain';
import NavBreadcrumbs from './NavBreadcrumbs';
import DateUpdated from './DateUpdated';

const siteName = 'mardock';

const useStyles = makeStyles((theme) => ({
  header: {},
  'Header-content': {
    width: '100%',
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1)
  },
  'Siteicon-root': {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  'Siteicon-image': ({ apiName, id }: Props) => ({
    width: theme.spacing(apiName === 'pages' && id === 'home' ? 18 : 12),
    height: theme.spacing(apiName === 'pages' && id === 'home' ? 18 : 12),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  }),
  SiteTitle: {
    ...theme.typography.h2
  },
  'NavMain-outer': {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  'NavBreadcrumbs-outer': {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  'DateUpdated-root': {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  'Layout-section-root': {
    display: 'flex',
    justifyContent: 'center',
    width: '100%'
  },
  'Layout-section-top': {
    width: 300
  },
  'Layout-section-bottom': {
    width: 300
  },
  'Layout-section': {
    flexGrow: 1,
    ...theme.typography.body1,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    '&  h2': {
      ...theme.typography.h4
    },
    '& article > h3': {
      ...theme.typography.h6,
      marginTop: theme.spacing(1),
      paddingTop: theme.spacing(0.5),
      paddingBottom: theme.spacing(0.5),
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
      borderLeft: `6px solid ${theme.palette.primary.main}`,
      backgroundColor: theme.palette.divider // ライトグレイぽい色は他にないかね
      // background: `linear-gradient(to right, ${theme.palette.primary.main} ,#f0f0f0)`
    },
    '& article > h4': {
      ...theme.typography.h6,
      display: 'inline',
      marginTop: theme.spacing(1),
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
      // color: theme.palette.primary.contrastText,
      color: theme.palette.getContrastText(theme.palette.primary.main),
      backgroundColor: theme.palette.primary.main
    },
    '& article > :not(section) a': {
      textDecorationLine: 'none',
      '&:hover': {
        textDecorationLine: 'underline'
      }
    },
    '& article > .tocContainer': {
      padding: theme.spacing(2),
      // backgroundColor: theme.palette.divider,
      // backgroundColor: theme.palette.primary.main,
      border: `1px solid ${theme.palette.primary.main}`,
      borderRadius: theme.shape.borderRadius,
      '& .tocTitle': {
        margin: theme.spacing(0, 0.5),
        // marginTop: theme.spacing(0.5),
        // marginBottom: theme.spacing(0.5),
        // paddingLeft: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        borderBottom: `1px solid ${theme.palette.divider}`,
        ...theme.typography.body1
      },
      // '&  ul': {
      //   listStyle: 'none'
      // },
      // '& ul li::before': {
      //   content: '\u200B'
      // },
      '& > nav > ul': {
        color: theme.palette.primary.main,
        paddingLeft: theme.spacing(3),
        paddingRight: theme.spacing(1),
        '& ul': {
          paddingLeft: theme.spacing(2)
        }
      },
      '& .tocItem': {
        marginTop: theme.spacing(1),
        '& > a': {
          color: theme.palette.primary.main,
          textDecorationLine: 'none',
          '&:hover': {
            textDecorationLine: 'underline'
          }
        }
      }
    },
    '& article > p > img, article > p > a > img': {
      width: '100%',
      height: '100%'
      // objectFit: 'contain'
    },
    '& article > ul': {
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(1),
      [theme.breakpoints.up('sm')]: {
        paddingLeft: theme.spacing(4)
      }
    },
    '& article :not(pre) > code': {
      padding: '.2em .4em',
      margin: 0,
      fontSize: '95%',
      backgroundColor: 'rgba(27,31,35,.1);',
      borderRadius: '3px'
    },
    '& article > blockquote': {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      padding: theme.spacing(1),
      borderLeft: `6px solid ${theme.palette.secondary.main}`,
      backgroundColor: theme.palette.divider
    },
    '& article > .embed.youtube': {
      marginBottom: theme.spacing(1)
    },
    '& > section': {
      // children のセクション
      '& h3': {
        ...theme.typography.h6,
        marginTop: theme.spacing(1),
        paddingTop: theme.spacing(0.5),
        paddingBottom: theme.spacing(0.5),
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
        borderLeft: `6px solid ${theme.palette.primary.main}`,
        backgroundColor: theme.palette.divider // ライトグレイぽい色は他にないかね
        // background: `linear-gradient(to right, ${theme.palette.primary.main} ,#f0f0f0)`
      },
      '& h4': {
        ...theme.typography.h6,
        display: 'inline',
        marginTop: theme.spacing(1),
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
        // color: theme.palette.primary.contrastText,
        color: theme.palette.getContrastText(theme.palette.primary.main),
        backgroundColor: theme.palette.primary.main
      }
    }
  },
  footer: {
    marginTop: theme.spacing(1),
    padding: theme.spacing(1),
    minHeight: 200,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.getContrastText(theme.palette.primary.main),
    '& .MuiIconButton-label': {
      color: theme.palette.getContrastText(theme.palette.primary.main)
    }
  }
}));

const ogImageParams = new URLSearchParams('');
ogImageParams.append('fit', 'crop');
ogImageParams.append('w', '1200');
ogImageParams.append('h', '630');
const ogImageParamsStr = ogImageParams.toString();

type Props = {
  apiName: ApiNameArticle;
  children?: ReactNode;
  topSection?: ReactNode;
  bottomSection?: ReactNode;
} & Partial<PageData>;

function getAvatarSrcSet(src: string): string {
  const u = src.split('?', 2)[0];
  // return encodeURIComponent(
  return `${u}?dpr64=Mw&#x26;fit64=Y3JvcA&#x26;h64=MTIw&#x26;w64=MTIw 3x, ${u}?dpr64=Mg&#x26;fit64=Y3JvcA&#x26;h64=MTIw&#x26;w64=MTIw 2x, ${u}?dpr64=&#x26;fit64=Y3JvcA&#x26;h64=MTIw&#x26;w64=MTIw 1x`;
}

const Layout = ({
  apiName,
  id,
  children,
  topSection,
  bottomSection,
  updated,
  title = 'This is the default title',
  description,
  articleTitle,
  html: html = '',
  mainVisual = '',
  notification
}: Props) => {
  const classes = useStyles({ apiName, id });
  // const router = useRouter();
  const avatarSrc =
    'https://images.microcms-assets.io/assets/cc433627f35c4232b7cb97e0376507a7/d106c1f3df9849e58cbd5264c3abd841/mardock-site-icon.png?fit64=Y3JvcA&h64=MTIw&w64=MTIw';
  const avatarSrcSet = getAvatarSrcSet(avatarSrc);
  const _title =
    apiName === 'pages' && id === 'home'
      ? `${title} | static slide site`
      : `${title} | mardock | static slide site`;
  const ogImageUrl = mainVisual ? `${mainVisual}?${ogImageParamsStr}` : '';
  useEffect(() => {
    const handleClick = (e: Event) => {
      const a = e.target as HTMLAnchorElement;
      const to = document.querySelector(`${a.dataset['scrollTo']}`);
      if (to) {
        e.preventDefault();
        window.history.pushState({}, '', `${a.dataset['scrollTo']}`);
        // router.push(
        //   {
        //     path: router.asPath,
        //     hash: `${a.dataset['scrollTo']}`,
        //     query: router.query
        //   },
        //   undefined,
        //   { scroll: false, shallow: false }
        // );
        to.scrollIntoView({ behavior: 'smooth' });
      }
    };
    const a = document.querySelectorAll('.tocItem > a');
    a.forEach((v) => {
      v.addEventListener('click', handleClick, { capture: false });
    });
    return () => {
      a.forEach((v) => {
        v.removeEventListener('click', handleClick, { capture: false });
      });
    };
  }, []);
  // header footer は https://github.com/hankei6km/my-starter-nextjs-typescript-material-ui-micro-cms-aspida に outer で記述だが、
  // 今回は直接記述.
  return (
    <>
      <Head>
        <title>{_title}</title>
        <meta charSet="utf-8" />
        <meta name="og:title" content={_title} />
        {description && <meta name="description" content={description} />}
        {description && <meta name="og:description" content={description} />}
        {ogImageUrl && <meta property="og:image" content={ogImageUrl} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <header className={classes.header}>
        <Container maxWidth="sm" disableGutters>
          <Box className={classes['Header-content']}>
            <Box className={classes['Siteicon-root']}>
              <a href="/">
                <Avatar
                  className={classes['Siteicon-image']}
                  alt="Site icon"
                  imgProps={{ width: 120, height: 120 }}
                  src={avatarSrc}
                  srcSet={avatarSrcSet}
                />
              </a>
              <Typography component="h1" className={classes['SiteTitle']}>
                <Link href="/" underline="none" color="textPrimary">
                  {siteName}
                </Link>
              </Typography>
            </Box>
            {apiName === 'pages' && (
              <Box className={classes['NavMain-outer']}>
                <NavMain classes={classes} />
              </Box>
            )}
            {apiName === 'deck' && (
              <Box className={classes['NavBreadcrumbs-outer']}>
                <NavBreadcrumbs lastBreadcrumb={title} classes={classes} />
              </Box>
            )}
          </Box>
        </Container>
      </header>
      <Box className={classes['Layout-section-root']}>
        <Box component="section" className={classes['Layout-section-top']}>
          {topSection}
        </Box>
        <Container
          component="section"
          maxWidth="sm"
          disableGutters
          className={classes['Layout-section']}
        >
          <>
            <Typography component="h2">{articleTitle}</Typography>
            {apiName === 'deck' && (
              <DateUpdated updated={updated} classes={classes} />
            )}
            <Divider />
            <article
              dangerouslySetInnerHTML={{
                __html: html
              }}
            ></article>
            {children}
          </>
        </Container>
        <Box component="section" className={classes['Layout-section-top']}>
          {bottomSection}
        </Box>
      </Box>
      <footer className={classes.footer}>
        <Container maxWidth="sm" disableGutters>
          <Typography variant="body1">Copyright (c) 2021 hankei6km</Typography>
          <IconButton
            aria-label="link to GitHub account"
            component={Link}
            href="https://github.com/hankei6km"
          >
            <GitHubIcon />
          </IconButton>
          <IconButton
            aria-label="link to Twitter account"
            component={Link}
            href="https://twitter.com/hankei6km"
          >
            <TwitterIcon />
          </IconButton>
        </Container>
      </footer>
      {notification && notification.title && (
        <Notification
          title={notification.title}
          messageHtml={notification.messageHtml}
          serverity={notification.serverity}
        />
      )}
    </>
  );
};

export default Layout;

// avatar の srcset などを作成したときのソース.
// 適当な保存場所がなかったので、ここに貼り付けておく.
// {
//   "imageBaseUrl": "https://images.microcms-assets.io/assets/71827cdd928b42fbab94cd30dfbc2a85/a651c3b80a624d78bcc84d08722773fd/draftlint-icon.png",
//   "baseParameterSet": [
//     {}
//   ],
//   "baseMedias": [],
//   "editTargetKey": "EDIT-TARGET-KEY",
//   "defaultTargetKey": "DEFAULT-TARGET-KEY",
//   "card": {
//     "cardType": "summary_large_image",
//     "title": "",
//     "description": ""
//   },
//   "tagFragment": {
//     "altText": "",
//     "linkText": "",
//     "asThumb": true,
//     "newTab": false,
//     "srcsetDescriptor": "auto",
//     "disableWidthHeight": false
//   },
//   "previewSetState": "edited",
//   "previewSetKind": "data",
//   "previewSet": [
//     {
//       "itemKey": "EDIT-TARGET-KEY",
//       "previewUrl": "https://images.microcms-assets.io/assets/71827cdd928b42fbab94cd30dfbc2a85/a651c3b80a624d78bcc84d08722773fd/draftlint-icon.png?dpr64=Mw&fit64=Y3JvcA&h64=MTIw&w64=MTIw",
//       "baseImageUrl": "https://images.microcms-assets.io/assets/71827cdd928b42fbab94cd30dfbc2a85/a651c3b80a624d78bcc84d08722773fd/draftlint-icon.png",
//       "imageParams": [
//         {
//           "key": "dpr",
//           "value": "3"
//         },
//         {
//           "key": "fit",
//           "value": "crop"
//         },
//         {
//           "key": "h",
//           "value": "120"
//         },
//         {
//           "key": "w",
//           "value": "120"
//         }
//       ],
//       "imgWidth": 360,
//       "imgHeight": 360,
//       "imgDispDensity": 3,
//       "media": "auto"
//     },
//     {
//       "itemKey": "ITEM-KEY-2",
//       "previewUrl": "https://images.microcms-assets.io/assets/71827cdd928b42fbab94cd30dfbc2a85/a651c3b80a624d78bcc84d08722773fd/draftlint-icon.png?dpr64=Mg&fit64=Y3JvcA&h64=MTIw&w64=MTIw",
//       "baseImageUrl": "https://images.microcms-assets.io/assets/71827cdd928b42fbab94cd30dfbc2a85/a651c3b80a624d78bcc84d08722773fd/draftlint-icon.png",
//       "imageParams": [
//         {
//           "key": "dpr",
//           "value": "2"
//         },
//         {
//           "key": "fit",
//           "value": "crop"
//         },
//         {
//           "key": "h",
//           "value": "120"
//         },
//         {
//           "key": "w",
//           "value": "120"
//         }
//       ],
//       "imgWidth": 240,
//       "imgHeight": 240,
//       "imgDispDensity": 2,
//       "media": "auto"
//     },
//     {
//       "itemKey": "ITEM-KEY-3",
//       "previewUrl": "https://images.microcms-assets.io/assets/71827cdd928b42fbab94cd30dfbc2a85/a651c3b80a624d78bcc84d08722773fd/draftlint-icon.png?dpr64=&fit64=Y3JvcA&h64=MTIw&w64=MTIw",
//       "baseImageUrl": "https://images.microcms-assets.io/assets/71827cdd928b42fbab94cd30dfbc2a85/a651c3b80a624d78bcc84d08722773fd/draftlint-icon.png",
//       "imageParams": [
//         {
//           "key": "dpr",
//           "value": ""
//         },
//         {
//           "key": "fit",
//           "value": "crop"
//         },
//         {
//           "key": "h",
//           "value": "120"
//         },
//         {
//           "key": "w",
//           "value": "120"
//         }
//       ],
//       "imgWidth": 120,
//       "imgHeight": 120,
//       "imgDispDensity": null,
//       "media": "auto"
//     },
//     {
//       "itemKey": "DEFAULT-TARGET-KEY",
//       "previewUrl": "https://images.microcms-assets.io/assets/71827cdd928b42fbab94cd30dfbc2a85/a651c3b80a624d78bcc84d08722773fd/draftlint-icon.png?dpr64=&fit64=Y3JvcA&h64=MTIw&w64=MTIw",
//       "baseImageUrl": "https://images.microcms-assets.io/assets/71827cdd928b42fbab94cd30dfbc2a85/a651c3b80a624d78bcc84d08722773fd/draftlint-icon.png",
//       "imageParams": [
//         {
//           "key": "dpr",
//           "value": ""
//         },
//         {
//           "key": "fit",
//           "value": "crop"
//         },
//         {
//           "key": "h",
//           "value": "120"
//         },
//         {
//           "key": "w",
//           "value": "120"
//         }
//       ],
//       "imgWidth": 120,
//       "imgHeight": 120,
//       "imgDispDensity": null,
//       "media": "auto"
//     }
//   ]
// }
