// Main whiteboard screen — composes toolbar, canvas, stickies, pages, top bar

function PageNav({ pages, current, onChange, onAdd }) {
  return (
    <div style={{
      position: "absolute", left: "50%", top: 76,
      transform: "translateX(-50%)",
      display: "flex", alignItems: "center", gap: 2,
      background: "var(--gb-paper)",
      border: "var(--gb-stroke)",
      borderRadius: "var(--gb-radius)",
      boxShadow: "var(--gb-shadow-sm)",
      padding: 4,
      zIndex: 30,
    }}>
      <button onClick={() => onChange(Math.max(0, current - 1))}
        disabled={current === 0}
        style={{ width: 28, height: 28, borderRadius: 6, border: 0, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", opacity: current === 0 ? 0.3 : 1 }}>
        <Icon name="chevL" size={16}/>
      </button>
      {pages.map((p, i) => (
        <button key={i} onClick={() => onChange(i)}
          style={{
            minWidth: 28, height: 28, padding: "0 8px", borderRadius: 6,
            border: 0,
            background: i === current ? "var(--gb-bg-deep)" : "transparent",
            color: "var(--gb-ink)",
            fontWeight: i === current ? 600 : 500, fontSize: 13,
            fontFamily: "inherit",
          }}>
          {i + 1}
        </button>
      ))}
      <button onClick={() => onChange(Math.min(pages.length - 1, current + 1))}
        disabled={current === pages.length - 1}
        style={{ width: 28, height: 28, borderRadius: 6, border: 0, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", opacity: current === pages.length - 1 ? 0.3 : 1 }}>
        <Icon name="chevR" size={16}/>
      </button>
      <div style={{width: 1, height: 18, background: "var(--gb-line)", margin: "0 2px"}}/>
      <button onClick={onAdd}
        style={{ width: 28, height: 28, borderRadius: 6, border: 0, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gb-ink-soft)" }}
        title="Add page"
      >
        <Icon name="plus" size={16}/>
      </button>
    </div>
  );
}

function ShareModal({ board, onClose, anonymous }) {
  const [copied, setCopied] = React.useState(false);
  const [access, setAccess] = React.useState(anonymous ? "link" : "team");
  const link = `groove.bo/${board?.id || "u-7k2p4n"}`;

  return (
    <div className="gb-modal-back" onClick={onClose}>
      <div className="gb-modal" onClick={e => e.stopPropagation()}>
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6}}>
          <div>
            <h2 style={{fontFamily: "var(--gb-font-display)", fontSize: 22, fontWeight: 500, margin: 0, lineHeight: 1.2, letterSpacing: "-0.01em"}}>Share board</h2>
            <p style={{margin: "4px 0 0", color: "var(--gb-ink-soft)", fontSize: 13}}>{board?.title || "Untitled board"}</p>
          </div>
          <button onClick={onClose} className="gb-btn gb-btn-ghost" style={{width: 32, height: 32, padding: 0}}>
            <Icon name="x" size={18}/>
          </button>
        </div>

        {anonymous && (
          <div style={{
            background: "var(--gb-bg-deep)",
            border: "var(--gb-stroke)",
            borderRadius: "var(--gb-radius)",
            padding: "10px 14px",
            margin: "16px 0",
            display: "flex", alignItems: "center", gap: 10,
            fontSize: 13, color: "var(--gb-ink-soft)",
          }}>
            <Icon name="globe" size={16}/>
            <span>You're not signed in. Anyone with the link can edit this board.</span>
          </div>
        )}

        {/* Link row */}
        <div style={{display: "flex", gap: 8, margin: "20px 0 18px"}}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", border: "var(--gb-stroke)", borderRadius: "var(--gb-radius)", background: "var(--gb-bg)" }}>
            <Icon name="globe" size={14}/>
            <span style={{fontFamily: "var(--gb-font-mono)", fontSize: 13}}>{link}</span>
          </div>
          <button className="gb-btn gb-btn-primary"
            onClick={() => { navigator.clipboard?.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
            <Icon name="copy" size={14}/>
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>

        <div style={{fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--gb-ink-soft)", marginBottom: 8}}>Access</div>
        <div style={{display: "flex", flexDirection: "column", gap: 6, marginBottom: 18}}>
          {(anonymous ? [
            { id: "link", icon: "globe", title: "Anyone with the link", desc: "Can view and edit — no sign-in needed" },
            { id: "view", icon: "lock", title: "Anyone with the link can view", desc: "View only — can't draw or move" },
          ] : [
            { id: "team", icon: "people", title: "My team", desc: "Everyone at your workspace" },
            { id: "link", icon: "globe", title: "Anyone with the link", desc: "Can view and edit — no sign-in needed" },
            { id: "view", icon: "lock", title: "Anyone with the link can view", desc: "View only — can't draw or move" },
          ]).map(opt => (
            <button key={opt.id} onClick={() => setAccess(opt.id)}
              style={{
                textAlign: "left", display: "flex", gap: 12, alignItems: "center",
                padding: "10px 12px",
                border: access === opt.id ? "1.5px solid var(--gb-ink)" : "var(--gb-stroke)",
                borderRadius: "var(--gb-radius)",
                background: access === opt.id ? "var(--gb-bg-deep)" : "transparent",
              }}>
              <div style={{
                width: 28, height: 28, borderRadius: 6,
                background: "var(--gb-paper)",
                color: "var(--gb-ink-soft)",
                border: "var(--gb-stroke)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <Icon name={opt.icon} size={14}/>
              </div>
              <div style={{flex: 1}}>
                <div style={{fontWeight: 500, fontSize: 13.5}}>{opt.title}</div>
                <div style={{fontSize: 12, color: "var(--gb-ink-soft)", marginTop: 1}}>{opt.desc}</div>
              </div>
              <div style={{
                width: 16, height: 16, borderRadius: "50%",
                border: "1.5px solid " + (access === opt.id ? "var(--gb-ink)" : "var(--gb-line)"),
                background: access === opt.id ? "var(--gb-ink)" : "transparent",
                position: "relative",
              }}>
                {access === opt.id && (
                  <div style={{position: "absolute", inset: 3, borderRadius: "50%", background: "var(--gb-paper)"}}/>
                )}
              </div>
            </button>
          ))}
        </div>

        <div style={{display: "flex", gap: 10, justifyContent: "flex-end"}}>
          <button className="gb-btn gb-btn-ghost" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}

// Page sizes in logical units — landscape orientations sized like real paper.
// Reasoning: kids draw "on a page", not "in space". Fixed dims = no infinite-scroll panic.
const PAGE_PRESETS = {
  letter: { w: 1100, h: 850, label: "Letter (11×8.5)" },
  a4:     { w: 1169, h: 827, label: "A4" },
  square: { w: 900,  h: 900, label: "Square" },
};

// Three discrete zoom levels. No pinch, no scroll-wheel — just labelled choices.
// "fit" is computed dynamically; the others are fixed multipliers from logical px.
const ZOOM_STEPS = [
  { id: "fit",  label: "Fit"   },
  { id: "100",  label: "100%", scale: 1.0 },
  { id: "150",  label: "150%", scale: 1.5 },
];

function ZoomControl({ value, onChange }) {
  return (
    <div style={{
      position: "absolute", bottom: 20, right: 20, zIndex: 45,
      background: "var(--gb-paper)",
      border: "var(--gb-stroke)",
      borderRadius: "var(--gb-radius-pill)",
      boxShadow: "var(--gb-shadow-sm)",
      padding: 4, display: "flex", gap: 2,
    }}>
      {ZOOM_STEPS.map(z => {
        const active = value === z.id;
        return (
          <button key={z.id} onClick={() => onChange(z.id)}
            style={{
              minWidth: 52, height: 30, padding: "0 12px",
              border: 0, borderRadius: 999,
              background: active ? "var(--gb-ink)" : "transparent",
              color: active ? "var(--gb-paper)" : "var(--gb-ink)",
              fontFamily: "inherit", fontSize: 12, fontWeight: 600,
              letterSpacing: "0.01em",
              cursor: "pointer",
              transition: "background .12s, color .12s",
            }}>
            {z.label}
          </button>
        );
      })}
    </div>
  );
}

function Whiteboard({ board, onHome, onSignIn, t, currentUser, anonymous }) {
  const [tool, setTool] = React.useState("pen");
  const [eraserMode, setEraserMode] = React.useState("pixel"); // 'pixel' | 'stroke'
  // Per-tool colors so each tool remembers its own pick. Highlighter defaults to lemon yellow.
  const [toolColors, setToolColors] = React.useState({
    pen: "#1F1D1A",
    highlighter: "#F8E16C",
    shape: "#1F1D1A",
  });
  const color = toolColors[tool] || "#1F1D1A";
  const setColor = (c) => setToolColors(prev => ({ ...prev, [tool]: c }));
  const [size, setSize] = React.useState(4);
  const [paths, setPaths] = React.useState({});
  const [stickies, setStickies] = React.useState({});
  const [page, setPage] = React.useState(0);
  const [pages, setPages] = React.useState([{}]);
  const [selectedSticky, setSelectedSticky] = React.useState(null);
  const [shareOpen, setShareOpen] = React.useState(false);
  const [history, setHistory] = React.useState([{ paths: {}, stickies: {} }]);
  const [histIdx, setHistIdx] = React.useState(0);
  const [titleEditing, setTitleEditing] = React.useState(false);
  const [title, setTitle] = React.useState(board?.title || "Untitled board");
  const [zoom, setZoom] = React.useState("fit");
  const [fitScale, setFitScale] = React.useState(1);
  const [cursors, setCursors] = React.useState({
    c1: { x: 320, y: 280 },
    c2: { x: 640, y: 420 },
    c3: { x: 480, y: 200 },
  });
  const wrapRef = React.useRef(null);
  const pageRef = React.useRef(null);

  const pagePreset = PAGE_PRESETS[t.pageSize] || PAGE_PRESETS.letter;
  const PAGE_W = pagePreset.w;
  const PAGE_H = pagePreset.h;

  // Compute the fit-scale: largest scale ≤ 1 that fits the page in the viewport with padding.
  // We never up-scale beyond 1 here; "150%" is the explicit zoom-in choice.
  React.useLayoutEffect(() => {
    const compute = () => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const r = wrap.getBoundingClientRect();
      const pad = 120; // matches mat padding + breathing room
      const sw = (r.width  - pad) / PAGE_W;
      const sh = (r.height - pad) / PAGE_H;
      setFitScale(Math.max(0.3, Math.min(1, Math.min(sw, sh))));
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [PAGE_W, PAGE_H]);

  const activeScale = zoom === "fit"
    ? fitScale
    : (ZOOM_STEPS.find(z => z.id === zoom)?.scale || 1);

  React.useEffect(() => { setTitle(board?.title || "Untitled board"); }, [board]);

  // Animate fake cursors — bounded to the page, since cursors are page-relative now.
  React.useEffect(() => {
    if (anonymous) return;
    const interval = setInterval(() => {
      setCursors(prev => {
        const next = {};
        for (const [k, v] of Object.entries(prev)) {
          next[k] = {
            x: Math.max(40, Math.min(PAGE_W - 100, v.x + (Math.random() - 0.5) * 220)),
            y: Math.max(40, Math.min(PAGE_H - 80,  v.y + (Math.random() - 0.5) * 220)),
          };
        }
        return next;
      });
    }, 1700);
    return () => clearInterval(interval);
  }, [anonymous, PAGE_W, PAGE_H]);

  const pushHistory = (nextPaths, nextStickies) => {
    const trimmed = history.slice(0, histIdx + 1);
    trimmed.push({ paths: nextPaths, stickies: nextStickies });
    setHistory(trimmed);
    setHistIdx(trimmed.length - 1);
  };

  const handlePathsChange = (next) => {
    setPaths(next);
    pushHistory(next, stickies);
  };

  const undo = () => {
    if (histIdx === 0) return;
    const prev = history[histIdx - 1];
    setPaths(prev.paths); setStickies(prev.stickies); setHistIdx(histIdx - 1);
  };
  const redo = () => {
    if (histIdx >= history.length - 1) return;
    const next = history[histIdx + 1];
    setPaths(next.paths); setStickies(next.stickies); setHistIdx(histIdx + 1);
  };

  const clearPage = () => {
    const nextPaths    = { ...paths,    [page]: [] };
    const nextStickies = { ...stickies, [page]: [] };
    setPaths(nextPaths);
    setStickies(nextStickies);
    setSelectedSticky(null);
    pushHistory(nextPaths, nextStickies);
  };

  const handleSurfaceClick = (e) => {
    if (e.target !== e.currentTarget && !e.target.classList.contains("gb-canvas-bg")) return;
    if (tool !== "sticky") {
      setSelectedSticky(null);
      return;
    }
    // Place stickies in PAGE coordinates (un-scaled), so they stay locked to the page
    // regardless of zoom level.
    const pg = pageRef.current;
    if (!pg) return;
    const r = pg.getBoundingClientRect();
    const px = (e.clientX - r.left) / activeScale;
    const py = (e.clientY - r.top)  / activeScale;
    const newSticky = {
      id: "s" + Date.now(),
      x: Math.max(8, Math.min(PAGE_W - 188, px - 90)),
      y: Math.max(8, Math.min(PAGE_H - 188, py - 90)),
      color: STICKY_COLORS[Math.floor(Math.random() * STICKY_COLORS.length)],
      rot: (Math.random() - 0.5) * 4,
      text: "",
    };
    const nextStickies = { ...stickies, [page]: [...(stickies[page] || []), newSticky] };
    setStickies(nextStickies);
    pushHistory(paths, nextStickies);
    setSelectedSticky(newSticky.id);
  };

  return (
    <div ref={wrapRef} style={{ position: "absolute", inset: 0 }}>
      <div className="gb-canvas-wrap" onClick={(e) => { if (e.target === e.currentTarget) setSelectedSticky(null); }}>
        <div className="gb-canvas-mat" onClick={(e) => { if (e.target === e.currentTarget) setSelectedSticky(null); }}>
          <div
            ref={pageRef}
            className={`gb-page bg-${t.background}`}
            onClick={handleSurfaceClick}
            style={{
              width: PAGE_W,
              height: PAGE_H,
              transform: `scale(${activeScale})`,
            }}
          >
            <div className="gb-canvas-bg" style={{position: "absolute", inset: 0}} onClick={handleSurfaceClick}/>
            <DrawCanvas
              tool={tool} eraserMode={eraserMode} color={color} size={size}
              paths={paths} onPathsChange={handlePathsChange}
              page={page}
              pageW={PAGE_W} pageH={PAGE_H} scale={activeScale}
            />
            {(stickies[page] || []).map(s => (
              <Sticky key={s.id} data={s} selected={selectedSticky === s.id} onSelect={setSelectedSticky}
                scale={activeScale}
                bounds={{ w: PAGE_W, h: PAGE_H }}
                onChange={(updated) => setStickies({ ...stickies, [page]: stickies[page].map(x => x.id === updated.id ? updated : x) })}
                onDelete={(id) => {
                  const nextStickies = { ...stickies, [page]: stickies[page].filter(x => x.id !== id) };
                  setStickies(nextStickies); pushHistory(paths, nextStickies); setSelectedSticky(null);
                }}/>
            ))}
            {!anonymous && Object.entries(cursors).map(([id, pos]) => {
              const u = COLLABORATORS.find(c => c.id === id);
              return t.showCursors ? <LiveCursor key={id} user={u} x={pos.x} y={pos.y}/> : null;
            })}
          </div>
        </div>
      </div>

      <ZoomControl value={zoom} onChange={setZoom}/>

      {/* Top bar */}
      <header style={{
        position: "absolute", top: 12, left: 12, right: 12,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        zIndex: 40, pointerEvents: "none",
      }}>
        <div style={{display: "flex", gap: 8, alignItems: "center", pointerEvents: "auto"}}>
          {!anonymous && (
            <button onClick={onHome} className="gb-btn" style={{height: 36, padding: "0 12px", gap: 8}} title="Your boards">
              <Icon name="menu" size={16}/>
              <span style={{fontSize: 13, fontWeight: 500}}>Boards</span>
            </button>
          )}
          {anonymous && (
            <div className="gb-logo" style={{padding: "0 6px"}}>
              <span className="gb-logo-mark" style={{width: 24, height: 24}}></span>
            </div>
          )}
          <div style={{
            background: "var(--gb-paper)", border: "var(--gb-stroke)",
            borderRadius: "var(--gb-radius)", boxShadow: "var(--gb-shadow-sm)",
            padding: "7px 14px",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: board?.color || "var(--gb-accent)" }}/>
            {titleEditing ? (
              <input
                autoFocus value={title}
                onChange={e => setTitle(e.target.value)}
                onBlur={() => setTitleEditing(false)}
                onKeyDown={e => { if (e.key === "Enter") setTitleEditing(false); }}
                style={{ font: "inherit", fontFamily: "var(--gb-font-display)", fontSize: 15, fontWeight: 500, border: 0, background: "transparent", outline: "none", width: 220 }}
              />
            ) : (
              <span
                onClick={() => setTitleEditing(true)}
                style={{fontFamily: "var(--gb-font-display)", fontSize: 15, fontWeight: 500, whiteSpace: "nowrap", cursor: "text", letterSpacing: "-0.01em"}}>
                {title}
              </span>
            )}
            <span className="gb-chip" style={{marginLeft: 4, fontSize: 11, padding: "2px 8px"}}>
              <span style={{width: 5, height: 5, borderRadius: "50%", background: "var(--gb-mint)"}}/>
              {anonymous ? "Local" : "Saved"}
            </span>
          </div>
        </div>

        <div style={{display: "flex", alignItems: "center", gap: 8, pointerEvents: "auto"}}>
          {/* Undo / redo */}
          <div style={{
            background: "var(--gb-paper)", border: "var(--gb-stroke)",
            borderRadius: "var(--gb-radius)", boxShadow: "var(--gb-shadow-sm)",
            padding: 3, display: "flex", gap: 0,
          }}>
            <button onClick={undo} disabled={histIdx === 0}
              style={{width: 30, height: 30, border: 0, background: "transparent", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", opacity: histIdx === 0 ? 0.3 : 1}}>
              <Icon name="undo" size={15}/>
            </button>
            <button onClick={redo} disabled={histIdx >= history.length - 1}
              style={{width: 30, height: 30, border: 0, background: "transparent", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", opacity: histIdx >= history.length - 1 ? 0.3 : 1}}>
              <Icon name="redo" size={15}/>
            </button>
          </div>

          {/* Avatars (only signed in) */}
          {!anonymous && (
            <div style={{display: "flex", paddingLeft: 4}}>
              {COLLABORATORS.map((c, i) => (
                <div key={c.id} className="gb-avatar"
                  style={{ background: c.color, marginLeft: i ? -8 : 0, fontSize: 11, width: 28, height: 28 }}>
                  {c.initials}
                </div>
              ))}
              <div className="gb-avatar" style={{background: "var(--gb-grape)", marginLeft: -8, fontSize: 11, width: 28, height: 28}}>
                {currentUser.initials}
              </div>
            </div>
          )}

          <button className="gb-btn" onClick={() => setShareOpen(true)}>
            <Icon name="share" size={14}/>
            Share
          </button>

          {anonymous && (
            <button className="gb-btn gb-btn-primary" onClick={onSignIn}>
              Sign in to save
            </button>
          )}
        </div>
      </header>

      <PageNav pages={pages} current={page} onChange={setPage}
        onAdd={() => { setPages([...pages, {}]); setPage(pages.length); }}/>

      <Toolbar tool={tool} setTool={setTool} color={color} setColor={setColor}
        size={size} setSize={setSize} position={t.toolbarPosition} iconStyle={t.iconStyle}
        eraserMode={eraserMode} setEraserMode={setEraserMode}
        onClearPage={clearPage}/>

      {shareOpen && <ShareModal board={board} onClose={() => setShareOpen(false)} anonymous={anonymous}/>}
    </div>
  );
}

window.Whiteboard = Whiteboard;
window.ShareModal = ShareModal;
