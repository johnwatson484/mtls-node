import fs from 'fs'
import Hapi from '@hapi/hapi'

const serverCert = fs.readFileSync('../certificates/server.crt')
const serverKey = fs.readFileSync('../certificates/server-private-key.pem')
const rootCA = fs.readFileSync('../certificates/rootCA.crt')

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
  tls: {
    cert: serverCert,
    key: serverKey,
    ca: rootCA,
    requestCert: true,
    rejectUnauthorized: true
  },
  router: {
    stripTrailingSlash: true
  },
  debug: { request: ['error'] }
})

server.route({
  method: 'GET',
  path: '/',
  handler: (request, h) => {
    return { data: 'Hello, world!' }
  }
})

await server.start()

console.log('Server running on %s', server.info.uri)
