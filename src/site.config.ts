type SiteConfig = {
  siteName: string;
  siteIcon: string;
  nav: {
    main: { label: string; href: string }[];
    breadcrumbs: { [key: string]: { label: string; href: string }[] };
  };
};

const siteConfig: SiteConfig = {
  siteName: 'mardock',
  siteIcon:
    'https://images.microcms-assets.io/assets/cc433627f35c4232b7cb97e0376507a7/d106c1f3df9849e58cbd5264c3abd841/mardock-site-icon.png?fit64=Y3JvcA&h64=MTIw&w64=MTIw',
  nav: {
    main: [
      { label: 'Home', href: '/' },
      { label: 'Slides', href: '/deck' },
      { label: 'About', href: '/about' }
    ],
    breadcrumbs: {
      '/': [{ label: 'Home', href: '/' }],
      '/deck': [
        { label: 'Home', href: '/' },
        { label: 'Slides', href: '/deck' }
      ],
      '/about': [
        { label: 'Home', href: '/' },
        { label: 'About', href: '/about' }
      ]
    }
  }
};

export default siteConfig;
