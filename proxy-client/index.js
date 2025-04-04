import fs from 'fs'
import tunnel from 'tunnel'
import path from 'path'
import { fileURLToPath } from 'url'
import Wreck from '@hapi/wreck'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const certsDir = path.resolve(__dirname, '../certificates')
const clientCert = fs.readFileSync(path.join(certsDir, 'client.crt'))
const clientKey = fs.readFileSync(path.join(certsDir, 'client-private-key.pem'))
const rootCA = fs.readFileSync(path.join(certsDir, 'rootCA.crt'))

const agent = tunnel.httpsOverHttps({
  proxy: {
    host: 'localhost',
    port: 3001,
    cert: clientCert,
    key: clientKey,
    ca: rootCA,
  },
  cert: clientCert,
  key: clientKey,
  ca: rootCA,
})
const { payload } = await Wreck.get('https://localhost:3000', {
  agent,
  json: true
})

console.log(payload)
