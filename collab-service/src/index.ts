// Entrypoint. Configuration comes from the environment:
//
//   PORT            listen port (default 3001, matching the frontend's default)
//   CORS_ORIGIN     comma-separated origins for the polling transport (unset = websocket-only clients)
//   COLLAB_DISABLED set to "1" to refuse all new connections (kill switch;
//                   existing connections survive so a restart with this set
//                   drains the service)

import { createCollabServer } from './server.js'

const port = Number(process.env.PORT ?? 3001)
const disabled = () => process.env.COLLAB_DISABLED === '1'
const corsOrigin = process.env.CORS_ORIGIN?.split(',').map(o => o.trim())

const server = createCollabServer({
  corsOrigin,
  acceptConnections: () => !disabled(),
})

server.listen(port).then(bound => {
  console.log(`collab-service listening on :${bound}${disabled() ? ' (kill switch ON)' : ''}`)
})

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    // Containers get SIGTERM then SIGKILL; close sockets promptly and exit.
    server.close().then(() => process.exit(0))
  })
}
