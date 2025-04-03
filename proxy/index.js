import fs from 'fs'
import https from 'https'
import httpProxy from 'http-proxy'
import net from 'net'

// Load certificates
const proxyCert = fs.readFileSync('../certificates/proxy.crt')
const proxyKey = fs.readFileSync('../certificates/proxy-private-key.pem')
const rootCA = fs.readFileSync('../certificates/rootCA.crt')

// Create HTTPS server options
const serverOptions = {
  key: proxyKey,
  cert: proxyCert,
  ca: rootCA,
  requestCert: true,
  rejectUnauthorized: true
}

// Create the proxy server
const proxy = httpProxy.createServer({
  target: {
    protocol: 'https:',
    host: 'server.local',
    port: 3000
  },
  ssl: serverOptions,
  secure: true,
  changeOrigin: true,
  agent: new https.Agent({
    ca: rootCA
  })
})

// Handle proxy errors
proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err)

  // If we have a response object, send an error response
  if (res && res.writeHead) {
    res.writeHead(502)
    res.end('Proxy error: ' + err.message)
  }
})

// Create an HTTPS server that will handle both regular requests and CONNECT tunneling
const server = https.createServer(serverOptions)

// Handle regular HTTP requests
server.on('request', (req, res) => {
  console.log(`Regular request: ${req.method} ${req.url}`)
  proxy.web(req, res)
})

// Handle CONNECT tunneling for HTTPS
server.on('connect', (req, socket, head) => {
  console.log(`CONNECT request for: ${req.url}`)

  // Parse the target from the CONNECT URL (format: hostname:port)
  const { hostname, port } = new URL(`http://${req.url}`)
  const targetPort = parseInt(port || 443, 10)

  console.log(`Establishing TCP connection to ${hostname}:${targetPort}`)

  // Set socket options
  socket.setKeepAlive(true)
  socket.setNoDelay(true)

  // Create a TCP connection to the target server
  const targetSocket = net.connect({
    host: hostname,
    port: targetPort
  }, () => {
    console.log(`TCP connection established to ${hostname}:${targetPort}`)

    // Send the 200 Connection Established response
    socket.write('HTTP/1.1 200 Connection Established\r\n' +
                 'Connection: keep-alive\r\n' +
                 '\r\n')

    // Connect the sockets together to create the tunnel
    targetSocket.pipe(socket)
    socket.pipe(targetSocket)

    console.log('CONNECT tunnel established successfully')
  })

  // Handle target socket events
  targetSocket.on('error', (err) => {
    console.error(`Target connection error for ${hostname}:${targetPort}:`, err.message)
    socket.end()
  })

  // Handle client socket events
  socket.on('error', (err) => {
    console.error('Client socket error:', err.message)
    targetSocket.end()
  })

  socket.on('end', () => {
    console.log('Client socket ended')
    targetSocket.end()
  })

  targetSocket.on('end', () => {
    console.log('Target socket ended')
    socket.end()
  })

  socket.on('close', () => {
    console.log('Client socket closed')
    targetSocket.destroy()
  })

  targetSocket.on('close', () => {
    console.log('Target socket closed')
    socket.destroy()
  })
})

// Start the server
const PORT = 3001
server.listen(PORT, 'proxy.local', () => {
  console.log(`HTTPS Tunneling Proxy Server running on port ${PORT}`)
  console.log('- Using mutual TLS authentication')
  console.log('- Handling both regular requests and CONNECT tunneling')
})
