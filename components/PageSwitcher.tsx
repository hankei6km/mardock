import React, { useEffect, useRef } from 'react';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import Slider, { Settings, CustomArrowProps } from 'react-slick';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  // style  は以下のソースから定義をコピーしています.
  // https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.css
  // https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.css
  // https://github.com/kenwheeler/slick

  // slick.css と Slick-theme.css を大雑把に jss 化.
  // loading と icon(font)は読み込まない.
  // mui の theme は使わないようにしている.
  // dots の absolute 指定は変更(dot 数が増えるとあふれるため).
  // それにより arrow ボタンの位置がずれる(全体の高さが変わるため).
  // dots は絵文字で置き換えているので環境によって差異が出る可能性あり.
  // arrow ボタンは Mui の IconButton に置き換え.
  'slick-root': {
    // Slider
    '& .slick-slider': {
      position: 'relative',

      display: 'block',
      boxSizing: 'border-box',
      userSelect: 'none',

      '-webkit-touch-callout': 'none',
      '-khtml-user-select': 'none',
      '-ms-touch-action': 'pan-y',
      'touch-action': 'pan-y',
      '-webkit-tap-highlight-color': 'transparent'
    },

    '& .slick-list': {
      position: 'relative',

      display: 'block',
      overflow: 'hidden',

      margin: 0,
      padding: 0
    },
    '& .slick-list:focus': {
      outline: 'none'
    },
    '& .slick-list.dragging': {
      // cursor: 'pointer',
      cursor: 'hand'
    },
    '& .slick-slider .slick-track, .slick-slider .slick-list': {
      // -webkit-transform: translate3d(0, 0, 0);
      // -moz-transform: translate3d(0, 0, 0);
      // -ms-transform: translate3d(0, 0, 0);
      // -o-transform: translate3d(0, 0, 0);
      transform: 'translate3d(0, 0, 0)'
    },
    '& .slick-track': {
      position: 'relative',
      top: 0,
      left: 0,
      display: 'block'
    },
    '& .slick-track:before, .slick-track:after': {
      display: 'table',
      content: ''
    },
    '& .slick-track:after': {
      clear: 'both'
    },
    '& .slick-loading .slick-track': {
      visibility: 'hidden'
    },
    '& .slick-slide': {
      display: 'none',
      float: 'left',

      height: '100%',
      minHeight: 1
    },
    "& [dir='rtl'] .slick-slide": {
      float: 'righ'
    },

    '& .slick-slide img': {
      // display: 'block'
    },
    '& .slick-slide.slick-loading img': {
      // display: none;
    },

    '& .slick-slide.dragging img': {
      pointerEvents: 'none'
    },
    '& .slick-initialized .slick-slide': {
      display: 'block'
    },
    '& .slick-loading .slick-slide': {
      visibility: 'hidden'
    },
    '& .slick-vertical .slick-slide': {
      display: 'block',

      height: 'auto',

      border: '1px solid transparent'
    },
    '& .slick-arrow.slick-hidden': {
      display: 'none'
    }
  },
  'slick-theme': {
    // Slider
    // .slick-loading .slick-list
    // {
    //     background: #fff url('./ajax-loader.gif') center center no-repeat;
    // }
    //
    // /* Icons */
    // @font-face {
    //   font-family: 'slick';
    //   font-weight: normal;
    //   font-style: normal;
    //
    //   src: url('./fonts/slick.eot');
    //   src: url('./fonts/slick.eot?#iefix') format('embedded-opentype'),
    //     url('./fonts/slick.woff') format('woff'),
    //     url('./fonts/slick.ttf') format('truetype'),
    //     url('./fonts/slick.svg#slick') format('svg');
    // }

    // Arrows
    '& .slick-prev, .slick-next': {
      // fontSize: 0,
      // lineHeight: 0,

      position: 'absolute',
      top: '50%',

      zIndex: 1000, // 項目の下に隠れないように.

      display: 'block',

      // width: 20,
      // height: 20,
      padding: 0,
      // -webkit-transform: translate(0, -50%);
      // -ms-transform: translate(0, -50%);
      transform: 'translate(0, -50%)',

      cursor: 'pointer',

      color: 'transparent',
      border: 'none',
      outline: 'none',
      background: 'transparent'
    },
    '& .slick-prev:hover, .slick-prev:focus, .slick-next:hover, .slick-next:focus': {
      color: 'grey',
      outline: 'none',
      background: 'transparent'
    },
    '& .slick-prev:hover:before, .slick-prev:focus:before, .slick-next:hover:before, .slick-next:focus:before': {
      opacity: 1
    },
    '& .slick-prev.slick-disabled:before, .slick-next.slick-disabled:before': {
      opacity: 0.25
    },
    '& .slick-prev:before, .slick-next:before': {
      // font-family: 'slick',
      fontSize: 20,
      lineHeight: 1,

      opacity: 0.75,

      '-webkit-font-smoothing': 'antialiased',
      '-moz-osx-font-smoothing': 'grayscale'
    },

    '& .slick-prev': {
      left: 5 // 内側にE表示
    },
    "& [dir='rtl'] .slick-prev": {
      right: 5, // 内側にE表示
      left: 'auto'
    },
    '& .slick-prev:before': {
      // content: '"←"'
    },
    "& [dir='rtl'] .slick-prev:before": {
      // content: '"→"'
    },

    '& .slick-next': {
      right: 5 // 内側にE表示
    },
    "& [dir='rtl'] .slick-next": {
      right: 'auto',
      left: 5 // 内側にE表示
    },
    '& .slick-next:before': {
      // content: '"→"'
    },
    "& [dir='rtl'] .slick-next:before": {
      // content: '"←"'
    },

    // Dots
    '& .slick-dotted.slick-slider': {
      marginBottom: 30
    },
    '& .slick-dots': {
      // position: 'absolute',  dots 込みの高さにする、ただし Arrow ボタンの位置が下がる(top の % 指定の場合)
      // bottom: -25,

      display: 'block',

      width: '100%',
      padding: 0,
      margin: 0,

      listStyle: 'none',

      textAlign: 'center'
    },
    '& .slick-dots li': {
      position: 'relative',

      display: 'inline-block',

      width: 20,
      height: 20,
      margin: '0px 2px',
      padding: 0,

      cursor: 'pointer'
    },
    '& .slick-dots li button': {
      fontSize: 0,
      lineHeight: 0,

      display: 'block',

      width: 20,
      height: 20,
      padding: 5,

      cursor: 'pointer',

      color: 'transparent',
      border: 0,
      outline: 'none',
      background: 'transparent'
    },
    '& .slick-dots li button:hover, .slick-dots li button:focus': {
      outline: 'none'
    },
    '& .slick-dots li button:hover:before, .slick-dots li button:focus:before': {
      opacity: 1
    },
    '& .slick-dots li button:before': {
      // font-family: 'slick';
      fontSize: 6,
      lineHeight: '20px',

      position: 'absolute',
      top: 0,
      left: 0,

      width: 20,
      height: 20,

      content: '"\u26AB"', // 黒丸
      textAlign: 'center',

      opacity: 0.25,
      color: 'black',

      '-webkit-font-smoothing': 'antialiased',
      '-moz-osx-font-smoothing': 'grayscale'
    },
    '& .slick-dots li.slick-active button:before': {
      opacity: 0.75,
      color: 'black'
    }
  },
  spacer: {
    // .slick-dots
    height: 25
  }
}));

function NextArrow(props: CustomArrowProps) {
  const { className, style, onClick } = props;
  return (
    <IconButton
      aria-label="next"
      component="div"
      className={className}
      style={{ ...style, display: 'block' }}
      onClick={onClick}
    >
      <NavigateNextIcon style={{ fontSize: '4em' }} />
    </IconButton>
  );
}

function PrevArrow(props: CustomArrowProps) {
  const { className, style, onClick } = props;
  return (
    <IconButton
      aria-label="previous"
      component="div"
      className={className}
      style={{ ...style, display: 'block' }}
      onClick={onClick}
    >
      <NavigateBeforeIcon style={{ fontSize: '4em' }} />
    </IconButton>
  );
}

type Props = {
  curPageIdx: number;
  classes?: { [key: string]: string }; // prune をかけないので注意
} & Settings;

const PageSwitcher = ({
  curPageIdx,
  classes: inClasses,
  ...inSettings
}: Props) => {
  const settings = {
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    ...inSettings
  };
  const classes = useStyles({
    classes: inClasses
  });
  const sliderEl = useRef<Slider>(null);
  useEffect(() => {
    if (sliderEl && sliderEl.current) {
      sliderEl.current.slickGoTo(curPageIdx);
    }
  }, [curPageIdx]);
  return (
    <Box className={`${classes['slick-root']} ${classes['slick-theme']}`}>
      <Slider ref={sliderEl} {...settings} />
    </Box>
  );
};

export default PageSwitcher;
