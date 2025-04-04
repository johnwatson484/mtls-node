import fs from 'fs'
import https from 'https'
import net from 'net'

const serverCert = fs.readFileSync('../certificates/server.crt')
const serverKey = fs.readFileSync('../certificates/server-private-key.pem')
const rootCA = fs.readFileSync('../certificates/rootCA.crt')

const server = https.createServer({
  cert: serverCert,
  key: serverKey,
  ca: rootCA,
  requestCert: true,
  rejectUnauthorized: true
})

server.on('connect', (req, clientSocket, head) => {
  console.log('Received CONNECT request for:', req.url)
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
