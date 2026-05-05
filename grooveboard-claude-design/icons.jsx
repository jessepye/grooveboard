// Tool icons — all hand-drawn SVG, two style modes (chunky / line)
// Loaded into window.* so all babel scripts can use them.

function Icon({ name, style = "chunky", size = 24, color = "currentColor" }) {
  const stroke = style === "chunky" ? 2.5 : 1.8;
  const fill = style === "chunky" ? color : "none";
  const props = {
    width: size, height: size, viewBox: "0 0 24 24",
    fill: "none", stroke: color, strokeWidth: stroke,
    strokeLinecap: "round", strokeLinejoin: "round",
  };

  switch (name) {
    case "select":
      return (
        <svg {...props}>
          <path d="M5 3l4 16 3-7 7-3z" fill={fill} />
        </svg>
      );
    case "pen":
      return (
        <svg {...props}>
          <path d="M4 20l3-1 11-11-2-2L5 17l-1 3z" fill={fill} />
          <path d="M14 6l4 4" />
        </svg>
      );
    case "highlighter":
      return (
        <svg {...props}>
          <path d="M5 19h6l3-3-6-6-3 3v6z" fill={fill} />
          <path d="M14 10l5-5-3-3-5 5" fill={fill} />
        </svg>
      );
    case "eraser":
      return (
        <svg {...props}>
          <path d="M14 3l7 7-9 9H5l-2-2 11-11z" fill={fill} />
          <path d="M9 9l7 7" />
        </svg>
      );
    case "text":
      return (
        <svg {...props}>
          <path d="M5 5h14M12 5v14M9 19h6" fill="none" />
        </svg>
      );
    case "sticky":
      return (
        <svg {...props}>
          <path d="M4 4h12l4 4v12H4z" fill={fill} />
          <path d="M16 4v4h4" />
        </svg>
      );
    case "shape":
      return (
        <svg {...props}>
          <rect x="3" y="3" width="11" height="11" rx="1.5" fill={fill} />
          <circle cx="16" cy="16" r="5" fill={fill} />
        </svg>
      );
    case "laser":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="3" fill={color} stroke="none" />
          <path d="M12 4v3M12 17v3M4 12h3M17 12h3M6 6l2 2M16 16l2 2M6 18l2-2M16 8l2-2" />
        </svg>
      );
    case "undo":
      return (
        <svg {...props}>
          <path d="M9 14L4 9l5-5" />
          <path d="M4 9h10a6 6 0 0 1 0 12h-3" />
        </svg>
      );
    case "redo":
      return (
        <svg {...props}>
          <path d="M15 14l5-5-5-5" />
          <path d="M20 9H10a6 6 0 0 0 0 12h3" />
        </svg>
      );
    case "share":
      return (
        <svg {...props}>
          <circle cx="6" cy="12" r="2.5" fill={fill} />
          <circle cx="18" cy="6" r="2.5" fill={fill} />
          <circle cx="18" cy="18" r="2.5" fill={fill} />
          <path d="M8 11l8-4M8 13l8 4" />
        </svg>
      );
    case "trash":
      return (
        <svg {...props}>
          <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
        </svg>
      );
    case "plus":
      return (
        <svg {...props}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case "chevL":
      return (<svg {...props}><path d="M14 6l-6 6 6 6"/></svg>);
    case "chevR":
      return (<svg {...props}><path d="M10 6l6 6-6 6"/></svg>);
    case "chevD":
      return (<svg {...props}><path d="M6 9l6 6 6-6"/></svg>);
    case "x":
      return (<svg {...props}><path d="M6 6l12 12M18 6L6 18"/></svg>);
    case "copy":
      return (
        <svg {...props}>
          <rect x="8" y="8" width="12" height="12" rx="2" fill={fill}/>
          <path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>
        </svg>
      );
    case "people":
      return (
        <svg {...props}>
          <circle cx="9" cy="8" r="3" fill={fill}/>
          <path d="M3 20c0-3 3-5 6-5s6 2 6 5" fill={fill}/>
          <circle cx="17" cy="9" r="2.5" fill={fill}/>
          <path d="M14 20c0-2 2-4 4-4s4 2 4 4"/>
        </svg>
      );
    case "lock":
      return (
        <svg {...props}>
          <rect x="5" y="11" width="14" height="10" rx="2" fill={fill}/>
          <path d="M8 11V8a4 4 0 0 1 8 0v3"/>
        </svg>
      );
    case "globe":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" fill={fill}/>
          <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>
        </svg>
      );
    case "search":
      return (
        <svg {...props}>
          <circle cx="11" cy="11" r="6"/>
          <path d="M16 16l5 5"/>
        </svg>
      );
    case "grid":
      return (
        <svg {...props}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" fill={fill}/>
          <rect x="14" y="3" width="7" height="7" rx="1.5" fill={fill}/>
          <rect x="3" y="14" width="7" height="7" rx="1.5" fill={fill}/>
          <rect x="14" y="14" width="7" height="7" rx="1.5" fill={fill}/>
        </svg>
      );
    case "star":
      return (
        <svg {...props}>
          <path d="M12 3l2.5 6 6.5.5-5 4.5 1.5 6.5L12 17l-5.5 3.5L8 14 3 9.5 9.5 9z" fill={fill}/>
        </svg>
      );
    case "music":
      return (
        <svg {...props}>
          <circle cx="6" cy="18" r="2.5" fill={fill}/>
          <circle cx="17" cy="15" r="2.5" fill={fill}/>
          <path d="M8 18V6l12-2v11"/>
        </svg>
      );
    case "menu":
      return (
        <svg {...props}>
          <circle cx="5" cy="7" r="1.6" fill={color} stroke="none"/>
          <circle cx="5" cy="12" r="1.6" fill={color} stroke="none"/>
          <circle cx="5" cy="17" r="1.6" fill={color} stroke="none"/>
          <path d="M10 7h10M10 12h10M10 17h6"/>
        </svg>
      );
    default:
      return <svg {...props}><circle cx="12" cy="12" r="6"/></svg>;
  }
}

window.Icon = Icon;
