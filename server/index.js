import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import Hapi from '@hapi/hapi'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const certsDir = path.resolve(__dirname, '../certificates')
const serverCert = fs.readFileSync(path.join(certsDir, 'server.crt'))
const serverKey = fs.readFileSync(path.join(certsDir, 'server-private-key.pem'))
const rootCA = fs.readFileSync(path.join(certsDir, 'rootCA.crt'))

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
