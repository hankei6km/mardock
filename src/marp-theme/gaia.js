// Converted from https://github.com/marp-team/marp-core/blob/main/themes/gaia.scss
const { create } = require('jss');
const preset = require('jss-preset-default').default;
const { readFileSync } = require('fs');
const mix = require('mix-css-color');
const hljs = readFileSync(
  'node_modules/highlight.js/styles/sunburst.css'
).toString('utf-8');

const jss = create();
jss.setup(preset());
// jss.use(pluginCamelCase());

// 16 進数で表記 #xxxxxx
const colorLight = '#fff8e1';
const colorDark = '#455a64';
const colorPrimary = '#0288d1';
const colorSecondary = '#81d4fa';

const colorSchemeStyle = ({ bg, text, highlight }) => ({
  // update での更新ではなく、style.section 等で直接展開する
  // (update で展開させるとセレクターが処理されない、と思うが、未確認)
  color: text,
  backgroundColor: bg,

  '& a, mark': {
    color: highlight
  },

  '& code': {
    background: `${mix(text, bg, 80).hex}`,
    color: bg
  },

  '& h1, h2, h3, h4, h5, h6': {
    '& strong': {
      color: highlight
    }
  },

  '& pre > code': {
    background: text
  },

  '& header, footer, section::after, blockquote::before, blockquote::after': {
    color: `${mix(text, bg, 80).hex}`
  },

  '& table': {
    '& th, td': {
      borderColor: text
    },
    '& thead th': {
      background: text,
      color: bg
    },
    '& tbody > tr:nth-child(odd)': {
      '& td, th': {
        // background: `rgba(${text}, 0.1)`
        background: `${text}19` // 色表記が #xxxxxx であることが前提
      }
    }
  }
});

const style = {
  '@global': {
    '@import': [
      `url('https://fonts.googleapis.com/css?family=Lato:400,900|Roboto+Mono:400,700&display=swap')`
    ],
    'svg[data-marp-fitting="svg"]': {
      maxHeight: '580px' // Slide height - padding * 2
    },
    'h1, h2, h3, h4, h5, h6': {
      margin: ['0.5em', 0, 0, 0],
      '& strong': {
        fontWeight: 'inherit'
      }
    },
    h1: {
      fontSize: '1.8em'
    },
    h2: {
      fontSize: '1.5em'
    },

    h3: {
      fontSize: '1.3em'
    },

    h4: {
      fontSize: '1.1em'
    },

    h5: {
      fontSize: '1em'
    },

    h6: {
      fontSize: '0.9em'
    },

    'p, blockquote': {
      margin: ['1em', 0, 0, 0]
    },

    'ul, ol': {
      '& > li': {
        margin: ['0.3em', 0, 0, 0],

        '& > p': {
          margin: ['0.6em', 0, 0, 0]
        }
      }
    },

    code: {
      display: 'inline-block',
      fontFamily: `'Roboto Mono', monospace`,
      fontSize: '0.8em',
      letterSpacing: 0,
      margin: ['-0.1em', '0.15em'],
      padding: ['0.1em', '0.2em'],
      verticalAlign: 'baseline'
    },

    pre: {
      display: 'block',
      margin: ['1em', 0, 0, 0],
      minHeight: '1em',
      overflow: 'visible',

      '& code': {
        boxSizing: 'border-box',
        margin: 0,
        minWidth: '100%',
        padding: '0.5em',
        fontSize: '0.7em',

        '& svg[data-marp-fitting="svg"]': {
          maxHeight: 'calc(580px - 1em)'
        }
      }
    },
    blockquote: {
      margin: ['1em', 0, 0, 0],
      padding: '0 1em',
      position: 'relative',

      '&::after, &::before': {
        content: `'“'`,
        display: 'block',
        fontFamily: `'Times New Roman', serif`,
        fontWeight: 'bold',
        position: 'absolute'
      },

      '&::before': {
        top: 0,
        left: 0
      },

      '&::after': {
        right: 0,
        bottom: 0,
        transform: 'rotate(180deg)'
      },

      '& > *:first-child': {
        marginTop: 0
      }
    },

    mark: {
      background: 'transparent'
    },

    table: {
      borderSpacing: 0,
      borderCollapse: 'collapse',
      margin: ['1em', 0, 0, 0],

      '& th, td': {
        padding: ['0.2em', '0.4em'],
        borderWidth: '1px',
        borderStyle: 'solid'
      }
    },

    section: {
      // invalid property value
      // backgroundImage: `linear-gradient(
      //    135deg,
      //    rgba(#888, 0),
      //    rgba(#888, 0.02) 50%,
      //    rgba(#fff, 0) 50%,
      //    rgba(#fff, 0.05)
      //  )`,
      // 動いているページからコピペ.
      // backgroundImage:
      //   'linear-gradient(135deg,hsla(0,0%,53.3%,0),hsla(0,0%,53.3%,.02) 50%,hsla(0,0%,100%,0) 0,hsla(0,0%,100%,.05))',
      fontSize: '35px',
      fontFamily: `'Lato', 'Avenir Next', 'Avenir', 'Trebuchet MS', 'Segoe UI', sans-serif`,
      height: '720px',
      lineHeight: '1.35',
      letterSpacing: '1.25px',
      padding: '70px',
      width: '1280px',
      wordWrap: 'break-word',

      '& > *:first-child, & > header:first-child + *': {
        marginTop: 0
      },
      ...colorSchemeStyle({
        bg: colorLight,
        text: colorDark,
        highlight: colorPrimary
      })
    },
    'section.invert': colorSchemeStyle({
      bg: colorDark,
      text: colorLight,
      highlight: colorSecondary
    }),
    'section.gaia': colorSchemeStyle({
      bg: colorPrimary,
      text: colorLight,
      highlight: colorSecondary
    }),

    'section.lead': {
      display: 'flex',
      flexDirection: 'column',
      flexWrap: 'nowrap',
      justifyContent: 'center',

      '& h1, h2, h3, h4, h5, h6': {
        textAlign: 'center',

        '& svg[data-marp-fitting="svg"]': {
          '--preserve-aspect-ratio': 'xMidYMid meet'
        }
      },

      '& p': {
        textAlign: 'center'
      },

      '& blockquote': {
        '& > h1, > h2, > h3, > h4, > h5, > h6, > p': {
          textAlign: 'left'
        },

        '& svg[data-marp-fitting="svg"]:not([data-marp-fitting-math])': {
          '--preserve-aspect-ratio': 'xMinYMin meet'
        }
      },

      '& ul, ol': {
        '& > li > p': {
          textAlign: 'left'
        }
      },

      '& table': {
        marginLeft: 'auto',
        marginRight: 'auto'
      }
    },
    'header, footer, section::after': {
      boxSizing: 'border-box',
      fontSize: '66%',
      height: '70px',
      lineHeight: '50px',
      overflow: 'hidden',
      padding: '10px 25px',
      position: 'absolute'
    },

    header: {
      left: 0,
      right: 0,
      top: 0
    },

    footer: {
      left: 0,
      right: 0,
      bottom: 0
    },

    'section::after': {
      right: 0,
      bottom: 0,
      fontSize: '80%'
    }
  }
};

const sheet = jss.createStyleSheet(style, { link: true });

// 見た感じ動いているという程度。
//
// コンバートしていない項目。
// section.backgroundImage

const themeGaia = `
/*
Gaia jss version(unofficial).

original credit
> Marp / Marpit Gaia theme.
>
> @theme gaia
> @author Yuki Hattori

@theme gaia_jss

@auto-scaling true
@size 4:3 960px 720px
 */
${hljs}
${sheet.toString()}`;

module.exports = themeGaia;
