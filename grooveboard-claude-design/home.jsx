// Home / board picker — list of "your boards" plus a New Board CTA

const SAMPLE_BOARDS = [
  { id: "b1", title: "Q3 Roadmap brainstorm", color: "var(--gb-tomato)", updated: "2 minutes ago", collaborators: 4, pages: 3, preview: "roadmap" },
  { id: "b2", title: "Onboarding flow sketches", color: "var(--gb-sky)", updated: "Today, 11:42", collaborators: 2, pages: 2, preview: "flow" },
  { id: "b3", title: "Retro — Sprint 14", color: "var(--gb-mint)", updated: "Yesterday", collaborators: 8, pages: 1, preview: "retro" },
  { id: "b4", title: "Pricing page concepts", color: "var(--gb-mango)", updated: "2 days ago", collaborators: 3, pages: 4, preview: "pricing" },
  { id: "b5", title: "Architecture diagram", color: "var(--gb-grape)", updated: "Last week", collaborators: 5, pages: 2, preview: "arch" },
  { id: "b6", title: "Notes — design review", color: "var(--gb-bubblegum)", updated: "Last week", collaborators: 1, pages: 1, preview: "notes" },
];

function BoardPreview({ kind }) {
  const previews = {
    roadmap: (
      <svg viewBox="0 0 200 120" width="100%" height="100%">
        <rect width="200" height="120" fill="var(--gb-paper)"/>
        {/* Three swimlanes */}
        <line x1="20" y1="34" x2="180" y2="34" stroke="var(--gb-line)" strokeWidth="1"/>
        <line x1="20" y1="62" x2="180" y2="62" stroke="var(--gb-line)" strokeWidth="1"/>
        <line x1="20" y1="90" x2="180" y2="90" stroke="var(--gb-line)" strokeWidth="1"/>
        <text x="14" y="22" fontSize="7" fontWeight="600" fill="var(--gb-ink-soft)">Q3</text>
        <rect x="32" y="22" width="36" height="14" rx="2" fill="var(--gb-tomato)" opacity="0.85"/>
        <rect x="76" y="22" width="48" height="14" rx="2" fill="var(--gb-mango)" opacity="0.85"/>
        <rect x="44" y="50" width="56" height="14" rx="2" fill="var(--gb-sky)" opacity="0.85"/>
        <rect x="108" y="50" width="40" height="14" rx="2" fill="var(--gb-mint)" opacity="0.85"/>
        <rect x="60" y="78" width="72" height="14" rx="2" fill="var(--gb-grape)" opacity="0.85"/>
      </svg>
    ),
    flow: (
      <svg viewBox="0 0 200 120" width="100%" height="100%">
        <rect width="200" height="120" fill="var(--gb-paper)"/>
        <rect x="22" y="40" width="36" height="40" rx="4" fill="none" stroke="var(--gb-ink)" strokeWidth="1.2"/>
        <rect x="80" y="40" width="36" height="40" rx="4" fill="none" stroke="var(--gb-ink)" strokeWidth="1.2"/>
        <rect x="138" y="40" width="36" height="40" rx="4" fill="none" stroke="var(--gb-ink)" strokeWidth="1.2"/>
        <line x1="58" y1="60" x2="80" y2="60" stroke="var(--gb-ink-soft)" strokeWidth="1.2" markerEnd="url(#arr2)"/>
        <line x1="116" y1="60" x2="138" y2="60" stroke="var(--gb-ink-soft)" strokeWidth="1.2" markerEnd="url(#arr2)"/>
        <circle cx="40" cy="55" r="3" fill="var(--gb-tomato)"/>
        <line x1="28" y1="68" x2="52" y2="68" stroke="var(--gb-line)"/>
        <line x1="28" y1="73" x2="46" y2="73" stroke="var(--gb-line)"/>
        <defs>
          <marker id="arr2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M0 0L10 5L0 10z" fill="var(--gb-ink-soft)"/>
          </marker>
        </defs>
      </svg>
    ),
    retro: (
      <svg viewBox="0 0 200 120" width="100%" height="100%">
        <rect width="200" height="120" fill="var(--gb-paper)"/>
        {[
          {x: 20, y: 22, c: "var(--gb-mint)", l: "Went well"},
          {x: 76, y: 22, c: "var(--gb-mango)", l: "Tricky"},
          {x: 132, y: 22, c: "var(--gb-bubblegum)", l: "Try"},
        ].map((col, i) => (
          <g key={i}>
            <text x={col.x + 4} y={col.y - 4} fontSize="7" fontWeight="600" fill="var(--gb-ink-soft)">{col.l}</text>
            <rect x={col.x} y={col.y} width="48" height="22" fill={col.c} opacity="0.85"/>
            <rect x={col.x + 2} y={col.y + 28} width="48" height="22" fill={col.c} opacity="0.85"/>
            <rect x={col.x - 2} y={col.y + 56} width="48" height="22" fill={col.c} opacity="0.85"/>
          </g>
        ))}
      </svg>
    ),
    pricing: (
      <svg viewBox="0 0 200 120" width="100%" height="100%">
        <rect width="200" height="120" fill="var(--gb-paper)"/>
        {[0,1,2].map(i => (
          <g key={i} transform={`translate(${20 + i*58}, 22)`}>
            <rect width="48" height="76" rx="4" fill="none" stroke="var(--gb-ink)" strokeWidth="1.2"/>
            <text x="24" y="14" textAnchor="middle" fontSize="8" fontWeight="600" fill="var(--gb-ink)">{["Free","Pro","Team"][i]}</text>
            <text x="24" y="32" textAnchor="middle" fontSize="14" fontWeight="600" fill="var(--gb-ink)" fontFamily="var(--gb-font-display)">${[0,12,24][i]}</text>
            <line x1="8" y1="42" x2="40" y2="42" stroke="var(--gb-line)"/>
            <line x1="8" y1="50" x2="36" y2="50" stroke="var(--gb-line)"/>
            <line x1="8" y1="58" x2="32" y2="58" stroke="var(--gb-line)"/>
            <line x1="8" y1="66" x2="38" y2="66" stroke="var(--gb-line)"/>
            {i === 1 && <rect width="48" height="76" rx="4" fill="var(--gb-mango)" opacity="0.18"/>}
          </g>
        ))}
      </svg>
    ),
    arch: (
      <svg viewBox="0 0 200 120" width="100%" height="100%">
        <rect width="200" height="120" fill="var(--gb-paper)"/>
        <rect x="80" y="14" width="40" height="20" rx="2" fill="var(--gb-grape)" opacity="0.85"/>
        <rect x="22" y="50" width="40" height="20" rx="2" fill="var(--gb-sky)" opacity="0.85"/>
        <rect x="80" y="50" width="40" height="20" rx="2" fill="var(--gb-sky)" opacity="0.85"/>
        <rect x="138" y="50" width="40" height="20" rx="2" fill="var(--gb-sky)" opacity="0.85"/>
        <rect x="50" y="86" width="40" height="20" rx="2" fill="var(--gb-mint)" opacity="0.85"/>
        <rect x="110" y="86" width="40" height="20" rx="2" fill="var(--gb-mint)" opacity="0.85"/>
        <line x1="100" y1="34" x2="42" y2="50" stroke="var(--gb-ink-soft)" strokeWidth="1"/>
        <line x1="100" y1="34" x2="100" y2="50" stroke="var(--gb-ink-soft)" strokeWidth="1"/>
        <line x1="100" y1="34" x2="158" y2="50" stroke="var(--gb-ink-soft)" strokeWidth="1"/>
        <line x1="42" y1="70" x2="70" y2="86" stroke="var(--gb-ink-soft)" strokeWidth="1"/>
        <line x1="100" y1="70" x2="70" y2="86" stroke="var(--gb-ink-soft)" strokeWidth="1"/>
        <line x1="100" y1="70" x2="130" y2="86" stroke="var(--gb-ink-soft)" strokeWidth="1"/>
        <line x1="158" y1="70" x2="130" y2="86" stroke="var(--gb-ink-soft)" strokeWidth="1"/>
      </svg>
    ),
    notes: (
      <svg viewBox="0 0 200 120" width="100%" height="100%">
        <rect width="200" height="120" fill="var(--gb-paper)"/>
        <line x1="22" y1="26" x2="120" y2="26" stroke="var(--gb-ink)" strokeWidth="1.5"/>
        <line x1="22" y1="44" x2="178" y2="44" stroke="var(--gb-line)"/>
        <line x1="22" y1="58" x2="160" y2="58" stroke="var(--gb-line)"/>
        <line x1="22" y1="72" x2="170" y2="72" stroke="var(--gb-line)"/>
        <line x1="22" y1="86" x2="100" y2="86" stroke="var(--gb-line)"/>
        <rect x="60" y="38" width="42" height="10" fill="var(--gb-lemon)" opacity="0.6"/>
        <circle cx="180" cy="26" r="4" fill="var(--gb-tomato)"/>
      </svg>
    ),
  };
  return previews[kind] || previews.roadmap;
}

function HomeScreen({ onOpen, t, currentUser }) {
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState("recent");
  const filtered = SAMPLE_BOARDS.filter(b => b.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "var(--gb-bg)",
      overflow: "auto",
    }}>
      {/* Top bar */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 36px",
        borderBottom: "var(--gb-stroke)",
        background: "var(--gb-paper)",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div className="gb-logo">
          <span className="gb-logo-mark"></span>
          <span>GrooveBoard</span>
        </div>
        <div className="gb-row" style={{gap: 12}}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 14px", border: "var(--gb-stroke)",
            borderRadius: "var(--gb-radius)",
            background: "var(--gb-bg)", width: 280,
          }}>
            <Icon name="search" size={16}/>
            <input
              value={search}
              onChange={(e)=>setSearch(e.target.value)}
              placeholder="Search boards..."
              style={{ border: 0, background: "transparent", outline: "none", font: "inherit", fontSize: 13, fontWeight: 500, flex: 1, color: "var(--gb-ink)" }}
            />
            <span style={{fontSize: 11, fontWeight: 500, color: "var(--gb-ink-soft)", background: "var(--gb-bg-deep)", padding: "1px 6px", borderRadius: 4}}>⌘K</span>
          </div>
          <div className="gb-avatar" style={{background: "var(--gb-grape)", boxShadow: "var(--gb-shadow-sm)"}}>{currentUser.initials}</div>
        </div>
      </header>

      <main style={{ padding: "44px 36px 80px", maxWidth: 1180, margin: "0 auto" }}>
        {/* Hero */}
        <div style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 32,
          marginBottom: 44,
        }}>
          <div>
            <div className="gb-chip" style={{marginBottom: 14}}>
              <span style={{width: 6, height: 6, borderRadius: "50%", background: "var(--gb-accent)"}}/>
              3 boards updated this week
            </div>
            <h1 style={{
              fontFamily: "var(--gb-font-display)",
              fontSize: 44, fontWeight: 500,
              margin: 0, letterSpacing: "-0.025em",
              lineHeight: 1.05,
            }}>
              Welcome back, {currentUser.name.split(" ")[0]}.
            </h1>
            <p style={{margin: "10px 0 0", color: "var(--gb-ink-soft)", fontSize: 16}}>Pick up where you left off, or start something new.</p>
          </div>
          <button
            onClick={() => onOpen("new")}
            className="gb-btn gb-btn-primary"
            style={{fontSize: 14, padding: "11px 18px"}}
          >
            <Icon name="plus" size={16}/>
            New board
          </button>
        </div>

        {/* Your boards */}
        <section>
          <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, borderBottom: "var(--gb-stroke)", paddingBottom: 12}}>
            <div className="gb-row" style={{gap: 4}}>
              {[
                { id: "recent", label: "Recent" },
                { id: "shared", label: "Shared with me" },
                { id: "starred", label: "Starred" },
              ].map(f => (
                <button key={f.id} onClick={() => setFilter(f.id)}
                  style={{
                    appearance: "none", border: 0,
                    padding: "6px 12px",
                    borderRadius: 6,
                    background: filter === f.id ? "var(--gb-bg-deep)" : "transparent",
                    color: filter === f.id ? "var(--gb-ink)" : "var(--gb-ink-soft)",
                    fontSize: 13, fontWeight: 500,
                    fontFamily: "inherit",
                  }}>
                  {f.label}
                </button>
              ))}
            </div>
            <div className="gb-row" style={{gap: 4}}>
              <button className="gb-btn gb-btn-ghost" style={{padding: "6px 10px", fontSize: 13}}>
                <Icon name="grid" size={14}/>
              </button>
              <button className="gb-btn gb-btn-ghost" style={{padding: "6px 10px", fontSize: 13, opacity: 0.55}}>
                <Icon name="text" size={14}/>
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
            {filtered.map(b => (
              <button key={b.id} className="gb-card" onClick={() => onOpen(b.id)}
                style={{
                  textAlign: "left", padding: 0, overflow: "hidden",
                  cursor: "pointer", transition: "transform .12s, box-shadow .15s, border-color .15s",
                  display: "flex", flexDirection: "column",
                  border: "var(--gb-stroke)",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--gb-shadow-md)"; e.currentTarget.style.borderColor = "var(--gb-ink-soft)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "var(--gb-shadow-sm)"; e.currentTarget.style.borderColor = "var(--gb-line)"; }}
              >
                <div style={{height: 150, borderBottom: "var(--gb-stroke)", background: "var(--gb-bg)", position: "relative"}}>
                  <BoardPreview kind={b.preview}/>
                  <div style={{
                    position: "absolute", top: 10, left: 10,
                    width: 6, height: 6, borderRadius: "50%",
                    background: b.color,
                  }}/>
                  {b.collaborators > 1 && (
                    <div style={{position: "absolute", top: 10, right: 10, display: "flex"}}>
                      {Array.from({length: Math.min(3, b.collaborators)}).map((_, i) => (
                        <div key={i} className="gb-avatar" style={{
                          width: 22, height: 22, fontSize: 9, marginLeft: i ? -6 : 0,
                          background: ["var(--gb-tomato)","var(--gb-sky)","var(--gb-mint)"][i],
                          border: "1.5px solid var(--gb-paper)",
                        }}>{["A","K","M"][i]}</div>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{padding: "12px 14px"}}>
                  <div style={{fontFamily: "var(--gb-font-display)", fontSize: 16, fontWeight: 500, lineHeight: 1.2, letterSpacing: "-0.01em"}}>{b.title}</div>
                  <div style={{fontSize: 12, fontWeight: 400, color: "var(--gb-ink-soft)", marginTop: 4, display: "flex", gap: 8}}>
                    <span>{b.updated}</span>
                    <span>·</span>
                    <span>{b.pages} {b.pages === 1 ? "page" : "pages"}</span>
                    {b.collaborators > 1 && <><span>·</span><span>{b.collaborators} people</span></>}
                  </div>
                </div>
              </button>
            ))}

            {/* New board card — last in grid */}
            <button onClick={() => onOpen("new")}
              style={{
                textAlign: "left", padding: 0, overflow: "hidden",
                cursor: "pointer", display: "flex", flexDirection: "column",
                border: "1.5px dashed var(--gb-line)",
                borderRadius: "var(--gb-radius-lg)",
                background: "transparent",
                minHeight: 200,
                alignItems: "center", justifyContent: "center",
                gap: 10,
                color: "var(--gb-ink-soft)",
                transition: "border-color .15s, color .15s, background .15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--gb-ink-soft)"; e.currentTarget.style.color = "var(--gb-ink)"; e.currentTarget.style.background = "var(--gb-paper)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--gb-line)"; e.currentTarget.style.color = "var(--gb-ink-soft)"; e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "var(--gb-bg-deep)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon name="plus" size={18}/>
              </div>
              <div style={{fontFamily: "var(--gb-font-display)", fontSize: 15, fontWeight: 500}}>New blank board</div>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

window.HomeScreen = HomeScreen;
window.SAMPLE_BOARDS = SAMPLE_BOARDS;
