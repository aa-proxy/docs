import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "🛸 aa-proxy",
  description: "Docs for aa-proxy",
  base: '/docs/',
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    search: {
      provider: 'local',
    },
    editLink: {
      pattern: 'https://github.com/aa-proxy/docs/edit/main/:path',
    },
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' }
    ],

    sidebar: [
      {
        text: 'Main',
        items: [
          { text: 'Getting started', link: '/getting-started' },
          { text: 'Supported hardware', link: '/supported-hardware' },
          { text: 'Troubleshooting Guide', link: '/troubleshooting' },
          { text: 'EV Routing Features', link: '/ev' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/aa-proxy/aa-proxy-rs' }
    ]
  }
})
