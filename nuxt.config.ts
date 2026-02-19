export default defineNuxtConfig({
  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://www.theweathernetwork.com' },
        { rel: 'preconnect', href: 'https://en.wikipedia.org' },
        { rel: 'preconnect', href: 'https://google.com' },
        
        // Prefetch the actual pages
        { rel: 'prefetch', href: 'https://www.theweathernetwork.com' },
        { rel: 'prefetch', href: 'https://en.wikipedia.org/wiki/Toronto' },
        { rel: 'prefetch', href: 'https://google.com' },
      ]
    }
  },

  routeRules: {
    '/exit': {
      redirect: {
        to: 'https://www.theweathernetwork.com',
        statusCode: 302
      }
    }
  }
})
