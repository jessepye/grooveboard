// Service entrypoint: a bare HTTP server (health check) with the collab relay
// attached. Containerized in Phase 1; deployed behind a load balancer later.

import { createServer } from 'node:http'
import { attachCollab } from './collab.js'

const PORT = Number(process.env.PORT ?? 3001)

const httpServer = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ status: 'ok' }))
    return
  }
  res.writeHead(404)
  res.end()
})

attachCollab(httpServer)

httpServer.listen(PORT, () => {
  console.log(`collab-service listening on :${PORT}`)
})
