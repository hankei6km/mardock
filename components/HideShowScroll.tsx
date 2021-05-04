import React, { ReactElement } from 'react';
import useScrollTrigger from '@material-ui/core/useScrollTrigger';
import { UseScrollTriggerOptions } from '@material-ui/core/useScrollTrigger/useScrollTrigger';
import Slide from '@material-ui/core/Slide';

// Hide と Show を組で取り出すような関数を用意できないか？

export function HideOnScroll({
  children,
  alwaysShowing,
  headerHideOptions = {}
}: {
  children?: ReactElement;
  alwaysShowing: boolean;
  headerHideOptions?: UseScrollTriggerOptions;
}) {
  // https://material-ui.com/components/app-bar/#hide-app-bar
  const trigger = useScrollTrigger(headerHideOptions);

  return (
    <Slide
      appear={false}
      direction="down"
      in={!trigger || alwaysShowing}
      //style={{ transitionDelay: !trigger ? '500ms' : '0ms' }}
    >
      {children}
    </Slide>
  );
}

export function ShowOnScroll({
  children,
  alwaysHiding,
  headerHideOptions = {}
}: {
  children?: ReactElement;
  alwaysHiding: boolean;
  headerHideOptions?: UseScrollTriggerOptions;
}) {
  // https://material-ui.com/components/app-bar/#hide-app-bar
  const trigger = useScrollTrigger(headerHideOptions);

  return (
    <Slide
      appear={false}
      direction="down"
      in={trigger && !alwaysHiding}
      //style={{ transitionDelay: !trigger ? '500ms' : '0ms' }}
    >
      {children}
    </Slide>
  );
}
