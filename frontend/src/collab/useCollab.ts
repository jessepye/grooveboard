// React binding for the Collaboration Service (collab-service/). Opens one
// Socket.IO connection per board and relays drawing events both ways, matching
// the service's protocol:
//
//   draw  -> { page, stroke }
//   erase -> { page, strokes }   (the page's strokes after an erasure)
//   clear -> { page }
//
// The relay is a dumb broadcaster (sender excluded), so what we send is exactly
// what peers receive.

import { useEffect, useRef, useState } from 'react'
import { io, type Socket } from 'socket.io-client'
import type { Stroke } from '../drawing/types'

export interface DrawEvent {
  page: number
  stroke: Stroke
}
export interface EraseEvent {
  page: number
  strokes: Stroke[]
}
export interface ClearEvent {
  page: number
}

export interface CollabHandlers {
  onDraw?: (e: DrawEvent) => void
  onErase?: (e: EraseEvent) => void
  onClear?: (e: ClearEvent) => void
}

export interface Collab {
  connected: boolean
  sendDraw: (e: DrawEvent) => void
  sendErase: (e: EraseEvent) => void
  sendClear: (e: ClearEvent) => void
}

const SERVER_URL = import.meta.env.VITE_COLLAB_URL ?? 'http://localhost:3001'

export function useCollab(boardId: string, handlers: CollabHandlers): Collab {
  const [connected, setConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  // Keep the latest handlers in a ref so re-renders don't churn the connection;
  // the socket listeners are registered once per board.
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  useEffect(() => {
    const socket = io(SERVER_URL, {
      transports: ['websocket'],
      query: { board: boardId },
    })
    socketRef.current = socket

    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))
    socket.on('draw', (e: DrawEvent) => handlersRef.current.onDraw?.(e))
    socket.on('erase', (e: EraseEvent) => handlersRef.current.onErase?.(e))
    socket.on('clear', (e: ClearEvent) => handlersRef.current.onClear?.(e))

    return () => {
      socket.disconnect()
      socketRef.current = null
      setConnected(false)
    }
  }, [boardId])

  return {
    connected,
    sendDraw: e => socketRef.current?.emit('draw', e),
    sendErase: e => socketRef.current?.emit('erase', e),
    sendClear: e => socketRef.current?.emit('clear', e),
  }
}
