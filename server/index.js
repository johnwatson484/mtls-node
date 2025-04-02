import Hapi from '@hapi/hapi'

const server = Hapi.server({
  host: '0.0.0.0',
  port: 3000,
  routes: {
    validate: {
      options: {
        abortEarly: false
      }
    }
  },
  router: {
    stripTrailingSlash: true
  }
})

server.route({
  path: '/',
  handler: (request, h) => {
    return 'Hello, world!'
  }
})

await server.start()

console.log('Server running on %s', server.info.uri)
