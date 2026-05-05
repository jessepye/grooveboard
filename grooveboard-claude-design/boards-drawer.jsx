// Slide-in left drawer for switching between recent boards.
// Replaces the home gallery as the default surface for board management.

function BoardsDrawer({ open, onClose, onOpen, currentBoardId, currentUser }) {
  const [search, setSearch] = React.useState("");
  const filtered = (window.SAMPLE_BOARDS || []).filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase())
  );

  // Esc to close
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <React.Fragment>
      {/* Scrim */}
      <div
        onClick={onClose}
        style={{
          position: "absolute", inset: 0, zIndex: 90,
          background: "rgba(20, 18, 14, 0.18)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity .18s ease",
        }}
      />
      {/* Panel */}
      <aside
        style={{
          position: "absolute", top: 0, bottom: 0, left: 0,
          width: 360, zIndex: 91,
          background: "var(--gb-paper)",
          borderRight: "var(--gb-stroke)",
          boxShadow: open ? "var(--gb-shadow-lg, 0 12px 32px rgba(20,18,14,0.18))" : "none",
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform .22s cubic-bezier(.2,.7,.2,1)",
          display: "flex", flexDirection: "column",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "14px 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: "var(--gb-stroke)",
        }}>
          <div className="gb-logo" style={{gap: 8}}>
            <span className="gb-logo-mark"/>
            <span style={{fontSize: 16}}>GrooveBoard</span>
          </div>
          <button
            onClick={onClose}
            className="gb-btn gb-btn-ghost"
            style={{width: 30, height: 30, padding: 0}}
            title="Close (Esc)"
          >
            <Icon name="x" size={16}/>
          </button>
        </div>

        {/* Primary action */}
        <div style={{padding: "14px 16px 10px"}}>
          <button
            onClick={() => { onOpen("new"); onClose(); }}
            className="gb-btn gb-btn-primary"
            style={{width: "100%", justifyContent: "center", padding: "11px 14px", fontSize: 14}}
          >
            <Icon name="plus" size={16}/>
            New blank board
          </button>
        </div>

        {/* Search */}
        <div style={{padding: "4px 16px 12px"}}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "7px 12px", border: "var(--gb-stroke)",
            borderRadius: "var(--gb-radius)",
            background: "var(--gb-bg)",
          }}>
            <Icon name="search" size={14}/>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your boards..."
              style={{
                border: 0, background: "transparent", outline: "none",
                font: "inherit", fontSize: 13, fontWeight: 500,
                flex: 1, color: "var(--gb-ink)",
              }}
            />
          </div>
        </div>

        {/* Boards list */}
        <div style={{
          flex: 1, overflow: "auto",
          padding: "0 8px 16px",
        }}>
          <div style={{
            padding: "8px 8px 6px",
            fontSize: 11, fontWeight: 600,
            color: "var(--gb-ink-soft)",
            textTransform: "uppercase", letterSpacing: "0.06em",
          }}>
            Recent
          </div>

          {filtered.length === 0 && (
            <div style={{padding: "20px 8px", fontSize: 13, color: "var(--gb-ink-soft)"}}>
              No boards match "{search}".
            </div>
          )}

          {filtered.map(b => {
            const active = b.id === currentBoardId;
            return (
              <button
                key={b.id}
                onClick={() => { onOpen(b.id); onClose(); }}
                style={{
                  width: "100%", textAlign: "left",
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 10px",
                  background: active ? "var(--gb-bg-deep)" : "transparent",
                  border: 0, borderRadius: 10,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  marginBottom: 2,
                  transition: "background .12s",
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--gb-bg)"; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: b.color, flexShrink: 0,
                }}/>
                <div style={{flex: 1, minWidth: 0}}>
                  <div style={{
                    fontFamily: "var(--gb-font-display)",
                    fontSize: 14, fontWeight: 500,
                    letterSpacing: "-0.01em",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {b.title}
                  </div>
                  <div style={{
                    fontSize: 11, color: "var(--gb-ink-soft)",
                    marginTop: 2,
                    display: "flex", gap: 6, alignItems: "center",
                  }}>
                    <span>{b.updated}</span>
                    {b.collaborators > 1 && (
                      <React.Fragment>
                        <span>·</span>
                        <span>{b.collaborators} people</span>
                      </React.Fragment>
                    )}
                  </div>
                </div>
                {active && (
                  <span style={{
                    fontSize: 10, fontWeight: 600,
                    color: "var(--gb-ink-soft)",
                    textTransform: "uppercase", letterSpacing: "0.06em",
                  }}>
                    Open
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding: "12px 16px",
          borderTop: "var(--gb-stroke)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 10,
        }}>
          <div style={{display: "flex", alignItems: "center", gap: 10, minWidth: 0}}>
            <div className="gb-avatar" style={{
              background: "var(--gb-grape)", boxShadow: "var(--gb-shadow-sm)",
              width: 28, height: 28, fontSize: 11,
            }}>
              {currentUser.initials}
            </div>
            <div style={{minWidth: 0}}>
              <div style={{fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
                {currentUser.name}
              </div>
              <div style={{fontSize: 11, color: "var(--gb-ink-soft)"}}>Personal workspace</div>
            </div>
          </div>
          <button className="gb-btn gb-btn-ghost" style={{padding: "6px 10px", fontSize: 12}}>
            Sign out
          </button>
        </div>
      </aside>
    </React.Fragment>
  );
}

window.BoardsDrawer = BoardsDrawer;
