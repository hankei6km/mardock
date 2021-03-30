import React, { useContext, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import SiteContext from './SiteContext';
import { Link as ScrollLink } from 'react-scroll';
import { pruneClasses } from '../utils/classes';
import { TocItems, HtmlToc } from '../types/pageTypes';

const useStyles = makeStyles((theme) => ({
  'NavHtmlToc-root': {
    width: '100%',
    '& ul': {
      listStyle: 'none',
      margin: 0,
      padding: 0,
      '& li::before': {
        content: '\u200B'
      }
    }
  },
  'NavHtmlToc-header-outer': {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(0.5)
  },
  'NavHtmlToc-label': { order: 2 },
  'NavHtmlToc-expand-button': {
    display: 'flex',
    order: 1,
    transform: 'rotate(0deg)',
    padding: theme.spacing(0.5),
    '&:not(.NavHtmlToc-list-expanded)': {
      transform: 'rotate(270deg)'
    },
    [theme.breakpoints.up('md')]: {
      display: 'none'
    }
  },
  'NavHtmlToc-list-outer': {
    overflow: 'hidden',
    transition: 'max-height .5s linear',
    maxHeight: 400, // 目次で必要な高さは?
    '&:not(.NavHtmlToc-list-expanded)': {
      maxHeight: 0
    },
    paddingLeft: theme.spacing(1),
    [theme.breakpoints.up('md')]: {
      maxHeight: 400,
      '&:not(.NavHtmlToc-list-expanded)': {
        maxHeight: 400
      },
      paddingLeft: theme.spacing(0)
    }
  },
  'NavHtmlToc-list': {
    justifyContent: 'space-around',
    '& li': {
      '& li': {
        paddingLeft: theme.spacing(1)
      },
      '& div.indicator:not(.active)': {
        marginBottom: theme.spacing(0.5),
        marginRight: theme.spacing(0.5),
        borderLeft: `4px solid ${theme.palette.content.background.default.main}`
      },
      '& div.indicator': {
        marginBottom: theme.spacing(0.5),
        marginRight: theme.spacing(0.5),
        borderLeft: `4px solid ${theme.palette.primary.main}`
      }
    }
  },
  'NavHtmlToc-item': {
    marginBottom: theme.spacing(0.5)
  },
  'NavHtmlToc-link': {
    color: theme.palette.primary.main,
    textDecorationLine: 'none',
    '&:hover': {
      textDecorationLine: 'underline'
    }
  }
}));
const classNames = [
  'NavHtmlToc-root',
  'NavHtmlToc-header-outer',
  'NavHtmlToc-label',
  'NavHtmlToc-expand-button',
  'NavHtmlToc-list-outer',
  'NavHtmlToc-list',
  'NavHtmlToc-item',
  'NavHtmlToc-link'
];

type Props = {
  htmlToc: HtmlToc;
  offset?: number;
  classes?: { [key: string]: string };
};
const NavHtmlTocItems = ({
  items,
  visibleId,
  offset = -80,
  classes: inClasses
}: {
  items: TocItems;
  visibleId: string;
  offset?: number;
  classes?: { [key: string]: string };
}) => {
  const classes = useStyles({ classes: pruneClasses(inClasses, classNames) });
  return (
    <ul className={classes['NavHtmlToc-list']}>
      {items.map(({ id, label, items }) => (
        <li key={id}>
          <Box display="flex">
            <Box className={`indicator${visibleId === id ? ' active' : ''}`} />
            <Typography
              component="p"
              className={`${classes['NavHtmlToc-item']}`}
            >
              <ScrollLink
                href={`#${id}`}
                to={`${id}`}
                offset={offset}
                smooth={true}
                duration={500}
                onClick={(): void => {
                  //const a = e.target as HTMLAnchorElement;
                  window.history.pushState({}, '', `#${id}`);
                }}
                className={classes['NavHtmlToc-link']}
              >
                {label}
              </ScrollLink>
            </Typography>
          </Box>
          {items.length > 0 && (
            <NavHtmlTocItems
              items={items}
              visibleId={visibleId}
              offset={offset}
              classes={classes}
            />
          )}
        </li>
      ))}
    </ul>
  );
};

const NavHtmlToc = ({ htmlToc, offset = -80, classes: inClasses }: Props) => {
  const classes = useStyles({ classes: pruneClasses(inClasses, classNames) });
  const { nav } = useContext(SiteContext);
  const [expanded, setExpanded] = useState(false);
  const [visibleId, setVisibleId] = useState(
    htmlToc.items.length > 0 ? htmlToc.items[0].id : ''
  );
  useEffect(() => {
    const scroller = window;
    const tocIds: string[] = [];
    htmlToc.items.forEach((v) => {
      tocIds.push(v.id);
      // 中分類まで.
      v.items.forEach(({ id }) => tocIds.push(id));
    });
    const elms: Element[] = [];
    let timerId: any = 0;
    const handleScroll = () => {
      if (timerId !== 0) {
        clearTimeout(timerId);
      }
      timerId = setTimeout(() => {
        const top = 0;
        const bottom = scroller.innerHeight;
        const idx = elms.findIndex((e) => {
          const rect = e.getBoundingClientRect();
          if (top < rect.top && rect.bottom < bottom) {
            return true;
          }
          return false;
        });
        if (idx >= 0) {
          setVisibleId(elms[idx].id);
        } else {
          const rect = elms[0].getBoundingClientRect();
          if (rect.top >= 0) {
            setVisibleId(elms[0].id);
          } else {
            setVisibleId(elms[elms.length - 1].id);
          }
        }
        timerId = 0;
      }, 10);
    };
    tocIds.forEach((id) => {
      const e = document.querySelector(`#${id}`);
      if (e) {
        elms.push(e);
      }
    });
    if (elms.length > 0) {
      scroller.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (timerId !== 0) {
        clearTimeout(timerId);
      }
      if (elms.length > 0) {
        scroller.removeEventListener('scroll', handleScroll);
      }
    };
  }, [htmlToc.items]);
  return (
    <Box className={classes['NavHtmlToc-root']}>
      <Box className={classes['NavHtmlToc-header-outer']}>
        <Typography component={'h2'} className={classes['NavHtmlToc-label']}>
          {nav.htmlToc.label}
        </Typography>
        <IconButton
          aria-label="Expand table of cotents"
          aria-controls="toc-entries"
          aria-expanded={expanded}
          className={`${classes['NavHtmlToc-expand-button']}${
            expanded ? ' NavHtmlToc-list-expanded' : ''
          }`}
          onClick={() => setExpanded(!expanded)}
        >
          <ExpandMoreIcon />
        </IconButton>
      </Box>
      <Box
        className={`${classes['NavHtmlToc-list-outer']}${
          expanded ? ' NavHtmlToc-list-expanded' : ''
        }`}
      >
        <Box>
          <NavHtmlTocItems
            items={htmlToc.items}
            visibleId={visibleId}
            offset={offset}
            classes={classes}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default NavHtmlToc;
