export type ConfigImageSource = {
  url: string;
  width: number;
  height: number;
  alt: string;
};
type SiteConfig = {
  siteName: string;
  siteIcon: ConfigImageSource;
  nav: {
    main: { label: string; href: string }[];
    breadcrumbs: { [key: string]: { label: string; href: string }[] };
    htmlToc: { label: string };
  };
};

const siteConfig: SiteConfig = {
  siteName: 'mardock',
  siteIcon: {
    url:
      'https://images.microcms-assets.io/assets/cc433627f35c4232b7cb97e0376507a7/0f8cf6adefbc4830bb9edca781c97ad1/mardock-site-icon-2.png',
    width: 640,
    height: 640,
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
        { label: 'Docs', href: '/doc' }
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
