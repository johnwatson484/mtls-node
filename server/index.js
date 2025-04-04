import fs from 'fs'
import Hapi from '@hapi/hapi'

const serverCert = fs.readFileSync('../certificates/server.crt')
const serverKey = fs.readFileSync('../certificates/server-private-key.pem')
const rootCA = fs.readFileSync('../certificates/rootCA.crt')

const server = Hapi.server({
  host: 'localhost',
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
  }
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
