// Whiteboard — main canvas screen with drawing, stickies, pages, cursors

const COLORS = [
  { name: "ink", value: "#2A2118" },
  { name: "tomato", value: "#F25B3A" },
  { name: "mango", value: "#FFB23F" },
  { name: "lemon", value: "#F8E16C" },
  { name: "mint", value: "#5DD0A8" },
  { name: "sky", value: "#4FB3E8" },
  { name: "grape", value: "#8B6CD9" },
  { name: "bubblegum", value: "#F08AB8" },
];

const STICKY_COLORS = ["#FFE066", "#FFB23F", "#F08AB8", "#5DD0A8", "#4FB3E8", "#C9A8F0"];

const COLLABORATORS = [
  { id: "c1", name: "Aria", color: "#F25B3A", initials: "A" },
  { id: "c2", name: "Kai",  color: "#4FB3E8", initials: "K" },
  { id: "c3", name: "Maya", color: "#5DD0A8", initials: "M" },
];

// ─── Drawing canvas ─────────────────────────────────────
// Helper: shortest distance from point P to segment AB
function distToSegment(p, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const len2 = dx*dx + dy*dy;
  if (len2 === 0) {
    const ddx = p.x - a.x, ddy = p.y - a.y;
    return Math.sqrt(ddx*ddx + ddy*ddy);
  }
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const cx = a.x + t*dx, cy = a.y + t*dy;
  const ex = p.x - cx, ey = p.y - cy;
  return Math.sqrt(ex*ex + ey*ey);
}

function DrawCanvas({ tool, eraserMode, color, size, paths, onPathsChange, page, lockTo, pageW, pageH, scale }) {
  const canvasRef = React.useRef(null);
  const [drawing, setDrawing] = React.useState(false);
  const currentPath = React.useRef(null);
  const erasingRef = React.useRef(false);

  // Use logical page dims so strokes are stored in page coords, independent of zoom.
  const W = pageW || 1100;
  const H = pageH || 850;
  const S = scale || 1;

  const redraw = React.useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    ctx.clearRect(0, 0, cv.width, cv.height);
    const all = (paths[page] || []).concat(currentPath.current ? [currentPath.current] : []);
    for (const p of all) {
      if (p.points.length < 2) continue;
      ctx.beginPath();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = p.color;
      ctx.lineWidth = p.size;
      ctx.globalAlpha = p.tool === "highlighter" ? 0.35 : 1;
      ctx.globalCompositeOperation = p.tool === "eraser" ? "destination-out" : "source-over";
      ctx.moveTo(p.points[0].x, p.points[0].y);
      for (let i = 1; i < p.points.length; i++) {
        ctx.lineTo(p.points[i].x, p.points[i].y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }, [paths, page]);

  React.useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    // Backing-store size = logical page dims, scaled up for crispness on hi-DPI.
    const dpr = window.devicePixelRatio || 1;
    cv.width = W * dpr;
    cv.height = H * dpr;
    cv.style.width = W + "px";
    cv.style.height = H + "px";
    const ctx = cv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    redraw();
  }, [redraw, W, H]);

  React.useEffect(() => { redraw(); }, [redraw]);

  const isDrawTool = ["pen", "highlighter", "eraser"].includes(tool);
  const isStrokeEraser = tool === "eraser" && eraserMode === "stroke";

  // Convert client coords → logical page coords (un-scale)
  const toLocal = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) / S,
      y: (e.clientY - r.top)  / S,
    };
  };

  // Find paths whose nearest segment is within `radius` of point p.
  const removeStrokesAt = (p, radius) => {
    const list = paths[page] || [];
    let removed = false;
    const kept = list.filter(stroke => {
      // Skip eraser strokes themselves (none persisted here, but be safe)
      if (stroke.tool === "eraser") return true;
      const hit = stroke.points.some((pt, i) => {
        const next = stroke.points[i + 1] || pt;
        return distToSegment(p, pt, next) <= (radius + (stroke.size || 4) / 2);
      });
      if (hit) { removed = true; return false; }
      return true;
    });
    if (removed) {
      onPathsChange({ ...paths, [page]: kept });
    }
  };

  const start = (e) => {
    if (!isDrawTool) return;
    const { x, y } = toLocal(e);
    if (isStrokeEraser) {
      erasingRef.current = true;
      removeStrokesAt({ x, y }, 10);
      return;
    }
    currentPath.current = {
      tool,
      color: tool === "highlighter" ? color : tool === "eraser" ? "#000" : color,
      size: tool === "highlighter" ? size * 4 : tool === "eraser" ? size * 3 : size,
      points: [{x, y}],
    };
    setDrawing(true);
  };
  const move = (e) => {
    if (isStrokeEraser && erasingRef.current) {
      const { x, y } = toLocal(e);
      removeStrokesAt({ x, y }, 10);
      return;
    }
    if (!drawing || !currentPath.current) return;
    const { x, y } = toLocal(e);
    currentPath.current.points.push({ x, y });
    redraw();
  };
  const end = () => {
    erasingRef.current = false;
    if (!drawing || !currentPath.current) return;
    const next = { ...paths };
    next[page] = (next[page] || []).concat([currentPath.current]);
    onPathsChange(next);
    currentPath.current = null;
    setDrawing(false);
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={start}
      onMouseMove={move}
      onMouseUp={end}
      onMouseLeave={end}
      style={{
        position: "absolute", inset: 0,
        cursor: isDrawTool
          ? `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'><circle cx='10' cy='10' r='6' fill='${encodeURIComponent(color)}' stroke='%232A2118' stroke-width='2'/></svg>") 10 10, crosshair`
          : "default",
        pointerEvents: lockTo ? "none" : "auto",
      }}
    />
  );
}

// ─── Sticky note ────────────────────────────────────────
function Sticky({ data, onChange, onDelete, selected, onSelect, scale, bounds }) {
  const [dragging, setDragging] = React.useState(false);
  const startRef = React.useRef(null);
  const S = scale || 1;
  const B = bounds || { w: Infinity, h: Infinity };

  const onMouseDown = (e) => {
    if (e.target.tagName === "TEXTAREA" || e.target.tagName === "BUTTON") return;
    startRef.current = { sx: e.clientX, sy: e.clientY, x: data.x, y: data.y };
    setDragging(true);
    onSelect(data.id);
    e.stopPropagation();
  };
  React.useEffect(() => {
    if (!dragging) return;
    const move = (e) => {
      const s = startRef.current;
      // Convert client-pixel deltas → page-coord deltas through current scale.
      const dx = (e.clientX - s.sx) / S;
      const dy = (e.clientY - s.sy) / S;
      const STICKY = 180;
      const nx = Math.max(8, Math.min(B.w - STICKY - 8, s.x + dx));
      const ny = Math.max(8, Math.min(B.h - STICKY - 8, s.y + dy));
      onChange({ ...data, x: nx, y: ny });
    };
    const up = () => setDragging(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  }, [dragging, data, onChange, S, B.w, B.h]);

  return (
    <div
      className={`gb-sticky ${dragging ? "dragging" : ""}`}
      onMouseDown={onMouseDown}
      style={{
        left: data.x, top: data.y,
        background: data.color,
        transform: `rotate(${data.rot}deg)`,
        outline: selected ? "3px dashed var(--gb-ink)" : "none",
        outlineOffset: "4px",
      }}
    >
      <textarea
        value={data.text}
        onChange={(e) => onChange({ ...data, text: e.target.value })}
        placeholder="Type something..."
      />
      {selected && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(data.id); }}
          style={{
            position: "absolute", top: -14, right: -14,
            width: 28, height: 28, borderRadius: "50%",
            border: "var(--gb-stroke)", background: "var(--gb-paper)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "var(--gb-shadow-sm)",
          }}
          aria-label="Delete sticky"
        >
          <Icon name="x" size={16}/>
        </button>
      )}
    </div>
  );
}

// ─── Live cursor ────────────────────────────────────────
function LiveCursor({ user, x, y }) {
  return (
    <div className="gb-cursor" style={{ left: x, top: y }}>
      <svg className="gb-cursor-pointer" viewBox="0 0 22 22">
        <path d="M3 2l3 16 3.5-7 7-3z" fill={user.color} stroke="#2A2118" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
      <span className="gb-cursor-name" style={{background: user.color}}>{user.name}</span>
    </div>
  );
}

// ─── Toolbar tools ────────────────────────────────────────
const TOOLS = [
  { id: "select", label: "Move" },
  { id: "pen", label: "Pen" },
  { id: "highlighter", label: "Highlighter" },
  { id: "eraser", label: "Eraser" },
  { id: "sticky", label: "Sticky note" },
  { id: "text", label: "Text" },
  { id: "shape", label: "Shape" },
  { id: "laser", label: "Laser" },
];

function Toolbar({ tool, setTool, color, setColor, size, setSize, position, iconStyle, eraserMode, setEraserMode, onClearPage }) {
  const [openPopover, setOpenPopover] = React.useState(null); // 'pen' | 'highlighter' | 'shape' | 'eraser' | null
  const [confirmClear, setConfirmClear] = React.useState(false);

  // Close popover when switching to a tool that doesn't own one
  React.useEffect(() => {
    if (openPopover && openPopover !== tool) setOpenPopover(null);
  }, [tool, openPopover]);

  // Reset clear-confirm timer
  React.useEffect(() => {
    if (!confirmClear) return;
    const id = setTimeout(() => setConfirmClear(false), 2500);
    return () => clearTimeout(id);
  }, [confirmClear]);

  const isVertical = position === "left" || position === "right";

  const containerStyle = {
    position: "absolute",
    background: "var(--gb-paper)",
    border: "var(--gb-stroke)",
    borderRadius: "var(--gb-radius-pill)",
    boxShadow: "var(--gb-shadow-md)",
    padding: 8,
    display: "flex",
    flexDirection: isVertical ? "column" : "row",
    gap: 4,
    alignItems: "center",
    zIndex: 50,
    ...(position === "bottom" && { bottom: 24, left: "50%", transform: "translateX(-50%)" }),
    ...(position === "top"    && { top: 84, left: "50%", transform: "translateX(-50%)" }),
    ...(position === "left"   && { left: 24, top: "50%", transform: "translateY(-50%)" }),
    ...(position === "right"  && { right: 24, top: "50%", transform: "translateY(-50%)" }),
  };

  // Which tools have an attached color picker
  const COLOR_TOOLS = ["pen", "highlighter", "shape"];

  const ToolBtn = ({id, label}) => {
    const active = tool === id;
    const hasColor = COLOR_TOOLS.includes(id);
    return (
      <button
        onClick={() => {
          if (active) {
            // Re-clicking the active tool toggles its popover (color or eraser modes)
            if (hasColor || id === "eraser") {
              setOpenPopover(p => p === id ? null : id);
            }
          } else {
            setTool(id);
            // Auto-open eraser modes the first time you switch to it
            if (id === "eraser") setOpenPopover("eraser");
            else setOpenPopover(null);
          }
        }}
        title={label}
        style={{
          position: "relative",
          width: 44, height: 44,
          border: "none", borderRadius: "50%",
          background: active ? "var(--gb-ink)" : "transparent",
          color: active ? "var(--gb-paper)" : "var(--gb-ink)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "transform .08s, background .12s",
        }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--gb-bg-deep)"; }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
      >
        <Icon name={id} size={22} style={iconStyle}/>
        {/* Color stripe at the bottom of pen/highlighter/shape buttons */}
        {hasColor && (
          <span style={{
            position: "absolute", bottom: 7, left: "50%", transform: "translateX(-50%)",
            width: 18, height: 4, borderRadius: 2,
            background: color,
            border: color.toLowerCase() === "#ffffff" ? "1px solid var(--gb-line)" : "none",
            boxShadow: active ? "0 0 0 1.5px var(--gb-paper)" : "none",
            pointerEvents: "none",
          }}/>
        )}
        {/* Mode dot on eraser button */}
        {id === "eraser" && active && (
          <span style={{
            position: "absolute", bottom: 4, right: 4,
            width: 8, height: 8, borderRadius: "50%",
            background: eraserMode === "stroke" ? "var(--gb-tomato)" : "var(--gb-mango)",
            border: "1.5px solid var(--gb-paper)",
          }}/>
        )}
      </button>
    );
  };

  // Popover position helper — anchored next to the toolbar
  const popoverAnchor = {
    ...(position === "bottom" && { bottom: 56 }),
    ...(position === "top"    && { top: 56 }),
    ...(position === "left"   && { left: 56 }),
    ...(position === "right"  && { right: 56 }),
  };

  return (
    <div style={containerStyle}>
      <div style={{display: "flex", flexDirection: isVertical ? "column" : "row", gap: 4, alignItems: "center"}}>
        {TOOLS.map(t => {
          const showColorPop = openPopover === t.id && COLOR_TOOLS.includes(t.id);
          const showEraserPop = openPopover === "eraser" && t.id === "eraser";
          return (
            <div key={t.id} style={{position: "relative"}}>
              <ToolBtn {...t} />

              {/* Per-tool attached color picker */}
              {showColorPop && (
                <div
                  onMouseLeave={() => setOpenPopover(null)}
                  style={{
                    position: "absolute",
                    ...popoverAnchor,
                    ...(isVertical
                      ? { top: "50%", transform: "translateY(-50%)" }
                      : { left: "50%", transform: "translateX(-50%)" }),
                    background: "var(--gb-paper)", border: "var(--gb-stroke)",
                    borderRadius: 14, boxShadow: "var(--gb-shadow-md)",
                    padding: 10,
                    display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8,
                    width: 168,
                    zIndex: 60,
                  }}
                >
                  {COLORS.map(c => (
                    <button key={c.name}
                      onClick={() => { setColor(c.value); setOpenPopover(null); }}
                      style={{
                        width: 32, height: 32, borderRadius: "50%",
                        background: c.value,
                        border: color === c.value ? "3px solid var(--gb-ink)" : "2px solid var(--gb-ink)",
                        outline: color === c.value ? "2px solid var(--gb-paper)" : "none",
                        outlineOffset: -5,
                        cursor: "pointer",
                      }}
                    />
                  ))}
                  <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 8, marginTop: 6, paddingTop: 8, borderTop: "1.5px solid var(--gb-line)"}}>
                    <span style={{fontSize: 11, fontWeight: 800, color: "var(--gb-ink-soft)"}}>SIZE</span>
                    <input type="range" min={2} max={20} value={size} onChange={e => setSize(Number(e.target.value))} style={{flex: 1}}/>
                    <span style={{fontSize: 11, fontWeight: 800, width: 22, textAlign: "right"}}>{size}</span>
                  </div>
                </div>
              )}

              {/* Eraser-mode popover (attached to eraser button) */}
              {showEraserPop && (
                <div
                  onMouseLeave={() => setOpenPopover(null)}
                  style={{
                    position: "absolute",
                    ...popoverAnchor,
                    ...(isVertical
                      ? { top: "50%", transform: "translateY(-50%)" }
                      : { left: "50%", transform: "translateX(-50%)" }),
                    background: "var(--gb-paper)", border: "var(--gb-stroke)",
                    borderRadius: 14, boxShadow: "var(--gb-shadow-md)",
                    padding: 10,
                    display: "flex", flexDirection: "column", gap: 6,
                    width: 200,
                    zIndex: 60,
                  }}
                >
                  <div style={{fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--gb-ink-soft)", padding: "2px 4px 4px"}}>Eraser</div>
                  {[
                    { id: "pixel",  title: "Pixel eraser",  desc: "Rub away small bits" },
                    { id: "stroke", title: "Whole stroke",  desc: "Tap a line to remove it" },
                  ].map(m => {
                    const active = (eraserMode || "pixel") === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => { setEraserMode && setEraserMode(m.id); setOpenPopover(null); }}
                        style={{
                          textAlign: "left", display: "flex", gap: 10, alignItems: "center",
                          padding: "8px 10px",
                          border: active ? "1.5px solid var(--gb-ink)" : "var(--gb-stroke)",
                          borderRadius: 10,
                          background: active ? "var(--gb-bg-deep)" : "transparent",
                          fontFamily: "inherit", cursor: "pointer",
                        }}
                      >
                        <span style={{
                          width: 24, height: 24, borderRadius: "50%",
                          background: m.id === "stroke" ? "var(--gb-tomato)" : "var(--gb-mango)",
                          flexShrink: 0,
                          border: "1.5px solid var(--gb-ink)",
                        }}/>
                        <div style={{minWidth: 0}}>
                          <div style={{fontSize: 13, fontWeight: 600}}>{m.title}</div>
                          <div style={{fontSize: 11, color: "var(--gb-ink-soft)", marginTop: 1}}>{m.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Divider before destructive actions */}
      <div style={{
        width: isVertical ? 28 : 1,
        height: isVertical ? 1 : 28,
        background: "var(--gb-line)",
        margin: isVertical ? "4px 0" : "0 4px",
      }}/>

      {/* Clear page — two-tap confirm */}
      <button
        onClick={() => {
          if (confirmClear) { onClearPage && onClearPage(); setConfirmClear(false); }
          else { setConfirmClear(true); }
        }}
        title={confirmClear ? "Tap again to confirm" : "Clear page"}
        style={{
          width: 44, height: 44,
          border: confirmClear ? "1.5px solid var(--gb-tomato)" : "none",
          borderRadius: "50%",
          background: confirmClear ? "var(--gb-tomato)" : "transparent",
          color: confirmClear ? "var(--gb-paper)" : "var(--gb-ink-soft)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
          transition: "background .12s, color .12s",
          position: "relative",
        }}
        onMouseEnter={e => { if (!confirmClear) e.currentTarget.style.background = "var(--gb-bg-deep)"; }}
        onMouseLeave={e => { if (!confirmClear) e.currentTarget.style.background = "transparent"; }}
      >
        <Icon name="trash" size={20} style={iconStyle}/>
        {confirmClear && (
          <span style={{
            position: "absolute",
            ...(isVertical
              ? { left: 52, top: "50%", transform: "translateY(-50%)" }
              : { bottom: 52, left: "50%", transform: "translateX(-50%)" }),
            background: "var(--gb-ink)",
            color: "var(--gb-paper)",
            fontSize: 11, fontWeight: 600,
            padding: "5px 10px",
            borderRadius: 6,
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}>
            Tap again to clear
          </span>
        )}
      </button>
    </div>
  );
}

window.DrawCanvas = DrawCanvas;
window.Sticky = Sticky;
window.LiveCursor = LiveCursor;
window.Toolbar = Toolbar;
window.COLORS = COLORS;
window.STICKY_COLORS = STICKY_COLORS;
window.COLLABORATORS = COLLABORATORS;
