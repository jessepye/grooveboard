// Wire protocol validation. The relay holds no board state and forwards
// payloads verbatim to other clients' browsers, so this module is the only
// thing standing between a hostile client and everyone else on the board:
// nothing gets relayed unless its shape and bounds check out here.

export interface Point {
  x: number
  y: number
}

export interface Stroke {
  id: string
  tool: string
  points: Point[]
  color: string
  size: number
}

export interface Limits {
  /** Server-wide cap on a single message, enforced by socket.io (`maxHttpBufferSize`). */
  maxPayloadBytes: number
  maxPointsPerStroke: number
  /** An erase event carries the page's surviving strokes — cap that array. */
  maxStrokesPerErase: number
  maxConnectionsPerIp: number
  /** Steady-state messages/sec per connection. */
  ratePerSec: number
  /** Burst allowance per connection (erasing sweeps can spike to ~60 events/sec). */
  rateBurst: number
}

export const DEFAULT_LIMITS: Limits = {
  maxPayloadBytes: 512 * 1024,
  maxPointsPerStroke: 4000,
  maxStrokesPerErase: 4000,
  maxConnectionsPerIp: 20,
  ratePerSec: 40,
  rateBurst: 120,
}

/** Bounds on metadata strings so ids/colors can't be used to smuggle blobs. */
const MAX_META_LENGTH = 64
/** Page index sanity bound; Milestone 1 uses a single page but keeps the field. */
const MAX_PAGE = 1000
const MAX_STROKE_SIZE = 200

const BOARD_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isValidBoardId(id: string): boolean {
  return BOARD_ID_RE.test(id)
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function isPage(v: unknown): v is number {
  return typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= MAX_PAGE
}

function isMetaString(v: unknown): v is string {
  return typeof v === 'string' && v.length > 0 && v.length <= MAX_META_LENGTH
}

function isPoint(v: unknown): v is Point {
  return isRecord(v) && Number.isFinite(v.x) && Number.isFinite(v.y)
}

function isStroke(v: unknown, limits: Limits): v is Stroke {
  return (
    isRecord(v) &&
    isMetaString(v.id) &&
    isMetaString(v.tool) &&
    isMetaString(v.color) &&
    typeof v.size === 'number' &&
    Number.isFinite(v.size) &&
    v.size > 0 &&
    v.size <= MAX_STROKE_SIZE &&
    Array.isArray(v.points) &&
    v.points.length <= limits.maxPointsPerStroke &&
    v.points.every(isPoint)
  )
}

export function validateDraw(payload: unknown, limits: Limits): boolean {
  return isRecord(payload) && isPage(payload.page) && isStroke(payload.stroke, limits)
}

export function validateErase(payload: unknown, limits: Limits): boolean {
  return (
    isRecord(payload) &&
    isPage(payload.page) &&
    Array.isArray(payload.strokes) &&
    payload.strokes.length <= limits.maxStrokesPerErase &&
    payload.strokes.every(s => isStroke(s, limits))
  )
}

export function validateClear(payload: unknown): boolean {
  return isRecord(payload) && isPage(payload.page)
}
