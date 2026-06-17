/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the collaboration WebSocket service. */
  readonly VITE_COLLAB_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
