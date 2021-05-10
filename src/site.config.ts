export type ConfigImageSource = {
  url: string;
  width: number;
  height: number;
  alt: string;
};
type SiteConfig = {
  siteName: string;
  siteNameDecorated: { label: string; strong?: boolean }[];
  // LICENSE とは別に定義する.
  siteCopyright: string;
  siteIcon: ConfigImageSource;
  // baseUrl は siteServerSideConfig に定義してある
  // (組み合てに環境変数利用しているので、うかつに secret をしない保険)
  nav: {
    main: { label: string; href: string }[];
    breadcrumbs: { [key: string]: { label: string; href: string }[] };
    htmlToc: { label: string };
  };
};

const siteConfig: SiteConfig = {
  siteName: 'mardock',
  siteNameDecorated: [
    { label: 'mar' },
    { label: 'doc', strong: true },
    { label: 'k' }
  ],
  siteCopyright: 'Copyright (c) 2021 hankei6km',
  siteIcon: {
    url:
      'https://images.microcms-assets.io/assets/cc433627f35c4232b7cb97e0376507a7/da27ed4e87794f41af0f5bfdf79391f1/mardock-site-icon-3.png',
    width: 800,
    height: 800,
    alt: 'mardock site icon'
  },
  nav: {
    main: [
      { label: 'Home', href: '/' },
      { label: 'Slides', href: '/deck' },
      { label: 'Docs', href: '/docs' },
      { label: 'About', href: '/about' }
    ],
    breadcrumbs: {
      '/': [{ label: 'Home', href: '/' }],
      '/deck': [
        { label: 'Home', href: '/' },
        { label: 'Slides', href: '/deck' }
      ],
      '/docs': [
        { label: 'Home', href: '/' },
        { label: 'Docs', href: '/docs' }
      ],
      '/about': [
        { label: 'Home', href: '/' },
        { label: 'About', href: '/about' }
      ]
    },
    htmlToc: {
      label: '目次'
    }
  }
};

export default siteConfig;
