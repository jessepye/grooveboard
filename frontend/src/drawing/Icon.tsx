// Hand-drawn SVG icons, ported from the prototype (icons.jsx).
// Two style modes: "chunky" (filled, heavier stroke) and "line" (outline only).

export type IconStyle = 'chunky' | 'line'

export interface IconProps {
  name: string
  variant?: IconStyle
  size?: number
  color?: string
}

export function Icon({ name, variant = 'chunky', size = 24, color = 'currentColor' }: IconProps) {
  const strokeWidth = variant === 'chunky' ? 2.5 : 1.8
  const fill = variant === 'chunky' ? color : 'none'
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  switch (name) {
    case 'select':
      return (
        <svg {...props}>
          <path d="M5 3l4 16 3-7 7-3z" fill={fill} />
        </svg>
      )
    case 'pen':
      return (
        <svg {...props}>
          <path d="M4 20l3-1 11-11-2-2L5 17l-1 3z" fill={fill} />
          <path d="M14 6l4 4" />
        </svg>
      )
    case 'highlighter':
      return (
        <svg {...props}>
          <path d="M5 19h6l3-3-6-6-3 3v6z" fill={fill} />
          <path d="M14 10l5-5-3-3-5 5" fill={fill} />
        </svg>
      )
    case 'eraser':
      return (
        <svg {...props}>
          <path d="M14 3l7 7-9 9H5l-2-2 11-11z" fill={fill} />
          <path d="M9 9l7 7" />
        </svg>
      )
    case 'shape':
      return (
        <svg {...props}>
          <rect x="3" y="3" width="11" height="11" rx="1.5" fill={fill} />
          <circle cx="16" cy="16" r="5" fill={fill} />
        </svg>
      )
    case 'undo':
      return (
        <svg {...props}>
          <path d="M9 14L4 9l5-5" />
          <path d="M4 9h10a6 6 0 0 1 0 12h-3" />
        </svg>
      )
    case 'redo':
      return (
        <svg {...props}>
          <path d="M15 14l5-5-5-5" />
          <path d="M20 9H10a6 6 0 0 0 0 12h3" />
        </svg>
      )
    case 'trash':
      return (
        <svg {...props}>
          <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
        </svg>
      )
    case 'x':
      return (
        <svg {...props}>
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      )
    default:
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="6" />
        </svg>
      )
  }
}
