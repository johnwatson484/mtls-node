import fs from 'fs'
import https from 'https'
import net from 'net'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const certsDir = path.resolve(__dirname, '../certificates')
const proxyCert = fs.readFileSync(path.join(certsDir, 'proxy.crt'))
const proxyKey = fs.readFileSync(path.join(certsDir, 'proxy-private-key.pem'))
const rootCA = fs.readFileSync(path.join(certsDir, 'rootCA.crt'))

const server = https.createServer({
  cert: proxyCert,
  key: proxyKey,
  ca: rootCA,
  requestCert: true,
  rejectUnauthorized: true
})

server.on('connect', (req, clientSocket, head) => {
  const [targetHost, targetPort] = req.url.split(':')

  const targetSocket = net.connect(targetPort, targetHost, () => {
    clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n')
    targetSocket.write(head)
    targetSocket.pipe(clientSocket)
    clientSocket.pipe(targetSocket)
  })

  targetSocket.on('error', (err) => {
    console.error('Target connection error:', err)
    clientSocket.end()
  })

  clientSocket.on('error', (err) => {
    console.error('Client connection error:', err)
    targetSocket.end()
  })
})

server.listen(3001, () => {
  console.log('Proxy server running on port 3001')
})
