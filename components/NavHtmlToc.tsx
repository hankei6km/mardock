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
  'NavHtmlToc-expand-button': {
    display: 'flex',
    [theme.breakpoints.up('md')]: {
      display: 'none'
    }
  },
  'NavHtmlToc-label': { flexGrow: 1 },
  'NavHtmlToc-list': {
    justifyContent: 'space-around',
    '& li': {
      '& li': {
        paddingLeft: theme.spacing(1)
      },
      '& div.indicator:not(.active)': {
        marginBottom: theme.spacing(0.5),
        marginRight: theme.spacing(0.5),
        borderLeft: `4px solid ${theme.palette.grey[300]}`
      },
      '& div.indicator': {
        marginBottom: theme.spacing(0.5),
        marginRight: theme.spacing(0.5),
        borderLeft: `4px solid ${theme.palette.primary.main}`
      }
    }
  },
  'NavHtmlToc-item': {
    // :marginBottom: theme.spacing(0.5)
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
  'NavHtmlToc-expand-button',
  'NavHtmlToc-label',
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
    <nav
      className={classes['NavHtmlToc-root']}
      aria-labelledby="table-of-contens-navigation"
    >
      <Box className={classes['NavHtmlToc-header-outer']}>
        <IconButton
          aria-label="Expand"
          aria-controls="additional-actions-table-of-contents"
          id="expand-table-of-contents-header"
          className={classes['NavHtmlToc-expand-button']}
        >
          <ExpandMoreIcon />
        </IconButton>
        <Box>
          <Typography component={'h3'} className={classes['NavHtmlToc-label']}>
            {nav.htmlToc.label}
          </Typography>
        </Box>
      </Box>
      <NavHtmlTocItems
        items={htmlToc.items}
        visibleId={visibleId}
        offset={offset}
        classes={classes}
      />
    </nav>
  );
};

export default NavHtmlToc;
