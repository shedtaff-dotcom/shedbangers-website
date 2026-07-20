// Frenchie's World Cup Final Party Game
// Spain vs Argentina — 19 Jul 2026
// CDN build — no import/export

const { useState, useEffect, useRef } = React;

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const PUB_ID   = "2PACX-1vSjeWoTJLAWNBaOk3LCqbYrcBUxzQjbJYJ943_TP85B51-Q2WBt6lmZdpoQiC1dm2BJI_hhyhxMmGPC";
const FINAL_GID = "2071438602";
const IS_ADMIN  = typeof window !== "undefined" && window.location.search.includes("admin=true");
const SHEET_URL = `https://docs.google.com/spreadsheets/d/e/${PUB_ID}/pub?output=csv&single=true&gid=${FINAL_GID}`;

// ─── SCORING ─────────────────────────────────────────────────────────────────
const EVENTS = [
  { key: "Corner",    label: "First Corner",       icon: "⛳", pts: 10, type: "time"  },
  { key: "Yellow",    label: "First Yellow Card",   icon: "🟨", pts: 10, type: "time"  },
  { key: "FreeKick",  label: "First Free Kick",     icon: "🦶", pts: 5,  type: "time"  },
  { key: "Goal",      label: "First Goal",          icon: "⚽", pts: 15, type: "time"  },
  { key: "Sub",       label: "First Substitution",  icon: "🔄", pts: 10, type: "time"  },
  { key: "SpainScore",label: "Spain Final Score",   icon: "🇪🇸", pts: 50, type: "score" },
  { key: "ArgScore",  label: "Argentina Final Score",icon: "🇦🇷", pts: 50, type: "score" },
  { key: "TotalGoals",label: "Total Goals",         icon: "🎯", pts: 30, type: "exact" },
];

// Score calculation
function hasValue(v) {
  // Empty/missing = not entered. "0" is a valid value.
  return v !== "" && v !== null && v !== undefined && !isNaN(parseInt(v, 10));
}

function calcScore(prediction, actual, type) {
  const p = parseInt(prediction, 10);
  const a = parseInt(actual, 10);
  if (isNaN(p) || !hasValue(actual)) return { pts: 0, diff: null, won: false };

  if (type === "time") {
    const diff = Math.abs(p - a);
    return { pts: 0, diff, won: false }; // winner decided separately (closest)
  }
  if (type === "exact") {
    if (p === a) return { pts: EVENTS.find(e => e.type === "exact").pts, diff: 0, won: true };
    if (Math.abs(p - a) === 1) return { pts: Math.round(EVENTS.find(e => e.type === "exact").pts / 2), diff: 1, won: false };
    return { pts: 0, diff: Math.abs(p - a), won: false };
  }
  if (type === "score") {
    // Both score predictions must match for the 50pt bonus
    return { pts: 0, diff: Math.abs(p - a), won: false }; // handled in calcTotal
  }
  return { pts: 0, diff: null, won: false };
}

function calcTotal(person, actuals) {
  let total = 0;
  const breakdown = [];

  // Time events — closest guess wins full points
  // We need all players to determine winner, so just return diffs here
  const timeDiffs = {};
  EVENTS.filter(e => e.type === "time").forEach(e => {
    const p = parseInt(person[e.key], 10);
    const a = parseInt(actuals[e.key], 10);
    if (!isNaN(p) && !isNaN(a) && a > 0) {
      timeDiffs[e.key] = Math.abs(p - a);
    }
  });

  // Exact (total goals)
  EVENTS.filter(e => e.type === "exact").forEach(e => {
    const p = parseInt(person[e.key], 10);
    const a = parseInt(actuals[e.key], 10);
    if (!isNaN(p) && !isNaN(a) && a > 0) {
      if (p === a) { total += e.pts; breakdown.push(`${e.label}: exact! +${e.pts}pts`); }
      else if (Math.abs(p - a) === 1) { const h = Math.round(e.pts/2); total += h; breakdown.push(`${e.label}: 1 off +${h}pts`); }
    }
  });

  // Score prediction bonus — both Spain AND Argentina score exactly right
  const sp = parseInt(person.SpainScore, 10);
  const sa = parseInt(actuals.SpainScore, 10);
  const ap = parseInt(person.ArgScore, 10);
  const aa = parseInt(actuals.ArgScore, 10);
  if (!isNaN(sp) && !isNaN(ap) && hasValue(actuals.SpainScore) && hasValue(actuals.ArgScore)) {
    if (sp === sa && ap === aa) {
      total += 50;
      breakdown.push(`Exact scoreline! +50pts`);
    }
  }

  return { total, timeDiffs, breakdown };
}

// ─── CSV PARSER ───────────────────────────────────────────────────────────────
function parseCSVRow(row) {
  const result = []; let cur = "", inQ = false;
  for (let i = 0; i < row.length; i++) {
    const c = row[i];
    if (c === '"') { inQ = !inQ; }
    else if (c === ',' && !inQ) { result.push(cur.trim()); cur = ""; }
    else { cur += c; }
  }
  result.push(cur.trim());
  return result;
}

function parseFinalCSV(text) {
  const rows = text.split("\n")
    .map(parseCSVRow)
    .filter(r => r.some(c => c));

  if (rows.length < 2) return { actuals: null, players: [] };

  const headers = rows[0].map(h => h.trim());
  const toObj   = row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (row[i]||"").trim(); });
    return obj;
  };

  const dataRows = rows.slice(1).map(toObj).filter(r => r.Name);
  const actualRow = dataRows.find(r => r.Name.toUpperCase() === "ACTUAL");
  const players   = dataRows.filter(r => r.Name.toUpperCase() !== "ACTUAL");

  return { actuals: actualRow || null, players };
}

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;600&display=swap');
  @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideIn { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
  @keyframes twinkle { from{opacity:.1;transform:scale(1)} to{opacity:.5;transform:scale(1.5)} }
  @keyframes spin    { to{transform:rotate(360deg)} }
  @keyframes popIn   { 0%{transform:scale(.5);opacity:0} 70%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
  @keyframes pulse   { 0%,100%{box-shadow:0 0 0 0 rgba(255,215,0,.4)} 50%{box-shadow:0 0 0 12px rgba(255,215,0,0)} }
  .fade-up  { animation:fadeUp .5s ease both }
  .slide-in { animation:slideIn .3s ease both }
  .pop-in   { animation:popIn .5s cubic-bezier(.175,.885,.32,1.275) both }
  .btn {
    font-family:'Bebas Neue',sans-serif; letter-spacing:2px; font-size:1rem;
    padding:12px 28px; border:none; border-radius:3px;
    cursor:pointer; transition:transform .15s,box-shadow .15s;
  }
  .btn:hover  { transform:translateY(-2px) }
  .btn-red    { background:linear-gradient(135deg,#C0392B,#e74c3c);color:#fff }
  .btn-red:hover  { box-shadow:0 4px 20px #C0392B99 }
  .btn-gold   { background:linear-gradient(135deg,#b8860b,#FFD700);color:#111 }
  .btn-gold:hover { box-shadow:0 4px 20px #FFD70099 }
  .btn-ghost  { background:transparent;color:#F5F0E8;border:1px solid #555 }
  .btn-ghost:hover{ border-color:#FFD700;color:#FFD700 }
  .event-card {
    background:rgba(255,255,255,.04); border:1px solid rgba(255,215,0,.15);
    border-radius:8px; padding:20px; transition:all .3s;
  }
  .event-card.live { 
    border-color:rgba(255,215,0,.5);
    background:rgba(255,215,0,.06);
    animation:pulse 2s ease infinite;
  }
  .event-card.done { border-color:rgba(74,222,128,.3); background:rgba(74,222,128,.04); }
  .player-row {
    display:flex; align-items:center; gap:12; padding:12px 16px;
    border-radius:4px; margin-bottom:6px; transition:all .2s;
  }
  .player-row.winner { background:rgba(255,215,0,.1); border:1px solid rgba(255,215,0,.3); }
  .player-row.normal { background:rgba(255,255,255,.03); border:1px solid #2a2a2a; }
  @media print { #site-nav,.no-print{display:none!important} }
`;

// ─── SCOREBOARD ───────────────────────────────────────────────────────────────
function Scoreboard({ players, actuals }) {
  if (!actuals) return (
    <div style={{ textAlign:"center", color:"#888", padding:40 }}>
      Waiting for ACTUAL row in sheet…
    </div>
  );

  // Build per-event winners (time events — closest)
  const eventWinners = {};
  EVENTS.filter(e => e.type === "time").forEach(e => {
    const a = parseInt(actuals[e.key], 10);
    if (!hasValue(actuals[e.key])) return;

    let minDiff = Infinity;
    players.forEach(p => {
      const pv = parseInt(p[e.key], 10);
      if (!isNaN(pv)) minDiff = Math.min(minDiff, Math.abs(pv - a));
    });

    eventWinners[e.key] = players
      .filter(p => {
        const pv = parseInt(p[e.key], 10);
        return !isNaN(pv) && Math.abs(pv - a) === minDiff;
      })
      .map(p => p.Name);
  });

  // Calculate total scores
  const scores = players.map(player => {
    const { total, timeDiffs, breakdown } = calcTotal(player, actuals);

    // Add time event points
    let timePts = 0;
    EVENTS.filter(e => e.type === "time").forEach(e => {
      if (eventWinners[e.key] && eventWinners[e.key].includes(player.Name)) {
        timePts += e.pts;
        breakdown.push(`${e.label}: closest! +${e.pts}pts`);
      }
    });

    return {
      name:      player.Name,
      total:     total + timePts,
      breakdown,
      player,
    };
  }).sort((a, b) => b.total - a.total);

  const maxPts = scores.length ? scores[0].total : 1;
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="fade-up">
      {scores.map((s, i) => {
        const medal  = i===0&&s.total>0?"🥇":i===1?"🥈":i===2?"🥉":"";
        const isOpen = expanded === i;
        return (
          <div key={i} style={{ marginBottom:8 }}>
            <div
              className={`player-row ${i===0&&s.total>0?"winner":"normal"}`}
              onClick={() => setExpanded(isOpen ? null : i)}
              style={{ cursor:"pointer" }}
            >
              <span style={{ color:"#888", fontSize:".85rem", width:24, textAlign:"right", flexShrink:0 }}>{i+1}</span>
              <span style={{ fontSize:"1rem", flexShrink:0 }}>{medal}</span>
              <span style={{ flex:1, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1, fontSize:"1.1rem", color:i===0&&s.total>0?"#FFD700":"#F5F0E8" }}>
                {s.name}
              </span>
              <span style={{ color:"#888", fontSize:".8rem" }}>{isOpen?"▲":"▼"}</span>
              <div style={{ width:80, height:5, background:"#1a1a1a", borderRadius:3, flexShrink:0 }}>
                <div style={{ height:"100%", borderRadius:3, width:`${maxPts?Math.round((s.total/maxPts)*100):0}%`, background:"linear-gradient(90deg,#C0392B,#FFD700)", transition:"width .6s ease" }}/>
              </div>
              <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.1rem", color:i===0&&s.total>0?"#FFD700":"#F5F0E8", width:60, textAlign:"right", flexShrink:0 }}>
                {s.total} <span style={{ color:"#888", fontSize:".7rem" }}>pts</span>
              </span>
            </div>
            {isOpen && s.breakdown.length > 0 && (
              <div style={{ background:"rgba(0,0,0,.3)", border:"1px solid #2a2a2a", borderTop:"none", borderRadius:"0 0 4px 4px", padding:"10px 16px" }}>
                {s.breakdown.map((b,bi) => (
                  <div key={bi} style={{ color:"#bbb", fontSize:".82rem", lineHeight:1.8 }}>· {b}</div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── EVENT CARDS ──────────────────────────────────────────────────────────────
function EventCards({ players, actuals }) {
  if (!actuals) return null;

  // Per event: find closest player(s)
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:12, marginBottom:32 }}>
      {EVENTS.map(e => {
        const actual  = parseInt(actuals[e.key], 10);
        const happened = hasValue(actuals[e.key]);

        // Find predictions
        const predictions = players.map(p => ({
          name: p.Name,
          val:  parseInt(p[e.key], 10),
        })).filter(p => !isNaN(p.val));

        // Find winner(s)
        let winners = [];
        if (happened && e.type === "time") {
          const minDiff = Math.min(...predictions.map(p => Math.abs(p.val - actual)));
          winners = predictions.filter(p => Math.abs(p.val - actual) === minDiff).map(p => p.name);
        } else if (happened && e.type === "exact") {
          winners = predictions.filter(p => p.val === actual).map(p => p.name);
        } else if (happened && e.type === "score") {
          // Score shown but winner calculated across both score fields
        }

        return (
          <div key={e.key} className={`event-card ${happened?"done":""}`}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
              <span style={{ fontSize:"1.6rem" }}>{e.icon}</span>
              <div>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1, color:"#FFD700", fontSize:".95rem" }}>
                  {e.label}
                </div>
                <div style={{ color:"#888", fontSize:".78rem" }}>{e.pts} pts</div>
              </div>
              {happened && (
                <div style={{ marginLeft:"auto", textAlign:"right" }}>
                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.8rem", color:"#4ade80", lineHeight:1 }}>
                    {e.type === "time" ? `${actual}'` : actual}
                  </div>
                  <div style={{ color:"#888", fontSize:".72rem" }}>ACTUAL</div>
                </div>
              )}
              {!happened && (
                <div style={{ marginLeft:"auto" }}>
                  <span style={{ color:"#555", fontSize:".8rem", fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1 }}>WAITING…</span>
                </div>
              )}
            </div>

            {winners.length > 0 && (
              <div className="pop-in" style={{
                background:"rgba(255,215,0,.1)", border:"1px solid rgba(255,215,0,.3)",
                borderRadius:4, padding:"6px 10px", marginBottom:10,
                fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1,
                color:"#FFD700", fontSize:".88rem"
              }}>
                🏆 {winners.join(" & ")} +{e.pts}pts
              </div>
            )}

            {/* Predictions list */}
            <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
              {predictions
                .sort((a,b) => {
                  if (!happened) return 0;
                  return Math.abs(a.val - actual) - Math.abs(b.val - actual);
                })
                .map((p, pi) => {
                  const diff    = happened ? Math.abs(p.val - actual) : null;
                  const isWinner = winners.includes(p.name);
                  return (
                    <div key={pi} style={{
                      display:"flex", alignItems:"center", gap:8,
                      padding:"4px 8px", borderRadius:3,
                      background: isWinner ? "rgba(255,215,0,.08)" : "rgba(255,255,255,.02)",
                    }}>
                      <span style={{ flex:1, color: isWinner?"#FFD700":"#ccc", fontSize:".85rem" }}>{p.name}</span>
                      <span style={{ fontFamily:"'Bebas Neue',sans-serif", color: isWinner?"#FFD700":"#888", fontSize:".9rem" }}>
                        {e.type === "time" ? `${p.val}'` : p.val}
                      </span>
                      {happened && diff !== null && (
                        <span style={{ color: diff===0?"#4ade80":diff<=3?"#facc15":"#888", fontSize:".75rem", minWidth:32, textAlign:"right" }}>
                          {diff===0?"✓":`±${diff}`}
                        </span>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── ADMIN PANEL ──────────────────────────────────────────────────────────────
function AdminPanel({ actuals, onRefresh }) {
  if (!IS_ADMIN) return null;
  return (
    <div style={{
      background:"rgba(255,255,255,.03)", border:"1px solid #2a2a2a",
      borderRadius:6, padding:20, marginBottom:24
    }} className="no-print">
      <p style={{ fontFamily:"'Bebas Neue',sans-serif", letterSpacing:2, color:"#90CDF4", fontSize:".88rem", marginBottom:12 }}>
        🔧 ADMIN — FRENCHIE ONLY
      </p>
      <p style={{ color:"#888", fontSize:".85rem", lineHeight:1.9, marginBottom:12 }}>
        Update the <strong style={{color:"#F5F0E8"}}>ACTUAL</strong> row in the <strong style={{color:"#F5F0E8"}}>Final</strong> sheet tab as events happen.<br/>
        Enter the <strong style={{color:"#F5F0E8"}}>minute</strong> for time events (e.g. 23 for minute 23).<br/>
        Enter <strong style={{color:"#F5F0E8"}}>goals scored</strong> for SpainScore, ArgScore, TotalGoals.<br/>
        Hit Refresh after updating — page auto-refreshes every 60 seconds.
      </p>
      {actuals && (
        <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:12 }}>
          {EVENTS.map(e => (
            <div key={e.key} style={{
              padding:"4px 10px", borderRadius:3, fontSize:".8rem",
              background: hasValue(actuals[e.key]) ? "rgba(74,222,128,.1)" : "rgba(255,255,255,.04)",
              border:`1px solid ${hasValue(actuals[e.key])?"rgba(74,222,128,.3)":"#333"}`,
              color: hasValue(actuals[e.key]) ? "#4ade80" : "#888",
            }}>
              {e.icon} {e.key}: {actuals[e.key]||"—"}
            </div>
          ))}
        </div>
      )}
      <button className="btn btn-ghost" onClick={onRefresh} style={{ fontSize:".85rem", padding:"8px 18px" }}>
        ↺ Refresh Now
      </button>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
function FinalGame() {
  const [status,   setStatus]   = useState("loading");
  const [error,    setError]    = useState("");
  const [actuals,  setActuals]  = useState(null);
  const [players,  setPlayers]  = useState([]);
  const [lastLoad, setLastLoad] = useState(null);
  const [activeTab,setActiveTab]= useState("events");
  const timerRef = useRef(null);

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = CSS;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  useEffect(() => {
    loadData();
    // Auto-refresh every 60 seconds during the match
    timerRef.current = setInterval(loadData, 60000);
    return () => clearInterval(timerRef.current);
  }, []);

  async function loadData() {
    try {
      const res  = await fetch(SHEET_URL);
      const text = await res.text();
      const { actuals, players } = parseFinalCSV(text);
      setActuals(actuals);
      setPlayers(players);
      setLastLoad(new Date());
      setStatus("ready");
    } catch(e) {
      setError("Couldn't load data — check sheet is published to web.");
      setStatus(status === "loading" ? "error" : status);
    }
  }

  const eventsHappened = EVENTS.filter(e => actuals && hasValue(actuals[e.key])).length;

  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(150deg,#0a0a14 0%,#0d1520 50%,#160a0a 100%)",
      padding:"32px 16px 64px", position:"relative", overflow:"hidden",
      fontFamily:"'Barlow',sans-serif", color:"#F5F0E8"
    }}>

      {/* Sparkles */}
      {[...Array(16)].map((_,i) => (
        <div key={i} style={{
          position:"fixed", borderRadius:"50%", pointerEvents:"none",
          width:i%3===0?3:2, height:i%3===0?3:2,
          background:i%4===0?"#FFD700":i%4===1?"#fff":"#C0392B",
          left:`${(i*17+5)%100}%`, top:`${(i*13+8)%100}%`, opacity:.2,
          animation:`twinkle ${2+(i%3)}s ease-in-out ${i*.25}s infinite alternate`
        }}/>
      ))}

      <div style={{ maxWidth:960, margin:"0 auto", position:"relative", zIndex:1 }}>

        {/* Header */}
        <div className="fade-up" style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontSize:"2.4rem", marginBottom:4 }}>🏆</div>
          <h1 style={{
            fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(2.4rem,6vw,4.5rem)",
            letterSpacing:4, color:"#FFD700", textShadow:"0 0 40px #FFD70055",
            lineHeight:1, margin:"0 0 6px"
          }}>The Final</h1>

          {/* Teams */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:24, margin:"16px 0 8px" }}>
            <div style={{ textAlign:"center" }}>
              <img src="https://flagcdn.com/48x36/es.png" alt="Spain"
                style={{ borderRadius:4, marginBottom:6, display:"block", margin:"0 auto 6px" }}/>
              <span style={{ fontFamily:"'Bebas Neue',sans-serif", letterSpacing:2, fontSize:"1.2rem" }}>Spain</span>
            </div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"2rem", color:"#555", letterSpacing:4 }}>
              {actuals && (parseInt(actuals.SpainScore,10)>=0 && parseInt(actuals.ArgScore,10)>=0 &&
               (hasValue(actuals.SpainScore) && hasValue(actuals.ArgScore)))
                ? `${actuals.SpainScore} – ${actuals.ArgScore}`
                : "vs"
              }
            </div>
            <div style={{ textAlign:"center" }}>
              <img src="https://flagcdn.com/48x36/ar.png" alt="Argentina"
                style={{ borderRadius:4, marginBottom:6, display:"block", margin:"0 auto 6px" }}/>
              <span style={{ fontFamily:"'Bebas Neue',sans-serif", letterSpacing:2, fontSize:"1.2rem" }}>Argentina</span>
            </div>
          </div>

          <div style={{ width:100, height:2, background:"linear-gradient(90deg,transparent,#FFD700,transparent)", margin:"12px auto 8px" }}/>

          {/* Status bar */}
          <div style={{ display:"flex", gap:16, justifyContent:"center", flexWrap:"wrap", fontSize:".8rem", color:"#888" }}>
            <span>👥 {players.length} players</span>
            <span>·</span>
            <span style={{ color: eventsHappened>0?"#4ade80":"#888" }}>
              ⚽ {eventsHappened}/{EVENTS.length} events recorded
            </span>
            {lastLoad && (
              <>
                <span>·</span>
                <span>🔄 {lastLoad.toLocaleTimeString()}</span>
              </>
            )}
          </div>
        </div>

        {status === "loading" && (
          <div style={{ textAlign:"center", padding:"60px 0" }}>
            <div style={{ width:34, height:34, border:"3px solid #222", borderTopColor:"#FFD700", borderRadius:"50%", animation:"spin .8s linear infinite", margin:"0 auto 16px" }}/>
            <p style={{ color:"#888", letterSpacing:2, fontSize:".8rem", textTransform:"uppercase" }}>Loading…</p>
          </div>
        )}

        {status === "error" && (
          <div style={{ textAlign:"center", padding:40 }}>
            <p style={{ color:"#e74c3c", marginBottom:16 }}>⚠️ {error}</p>
            <button className="btn btn-ghost" onClick={loadData}>↺ Retry</button>
          </div>
        )}

        {status === "ready" && (
          <div>
            <AdminPanel actuals={actuals} onRefresh={loadData}/>

            {/* Tabs */}
            <div style={{ display:"flex", borderBottom:"1px solid #1a1a1a", marginBottom:24, justifyContent:"center", gap:4 }}>
              {[["events","⚡ Events"],["scoreboard","📊 Scoreboard"]].map(([v,l])=>(
                <button key={v}
                  onClick={()=>setActiveTab(v)}
                  style={{
                    fontFamily:"'Bebas Neue',sans-serif", letterSpacing:2, fontSize:".9rem",
                    padding:"10px 20px", border:"none", background:"transparent",
                    borderBottom:`2px solid ${activeTab===v?"#FFD700":"transparent"}`,
                    color: activeTab===v?"#FFD700":"#888", cursor:"pointer", transition:"all .2s"
                  }}
                >{l}</button>
              ))}
            </div>

            {activeTab === "events" && (
              <EventCards players={players} actuals={actuals}/>
            )}
            {activeTab === "scoreboard" && (
              <Scoreboard players={players} actuals={actuals}/>
            )}

            <div className="no-print" style={{ display:"flex", gap:10, justifyContent:"center", marginTop:16 }}>
              <button className="btn btn-ghost" onClick={loadData}>↺ Refresh</button>
              <button className="btn btn-gold"  onClick={()=>window.print()}>🖨 Print</button>
            </div>

            <p style={{ textAlign:"center", color:"#555", fontSize:".72rem", letterSpacing:2, marginTop:28 }}>
              FRENCHIE'S FINAL PARTY GAME · WORLD CUP 2026
            </p>
            <p style={{ textAlign:"center", fontSize:".7rem", marginTop:6, opacity:.3 }}>
              <img src="https://flagcdn.com/16x12/gb-wls.png" alt="Wales"
                style={{verticalAlign:"middle", marginRight:4}}/>
              Cymru Am Byth
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  React.createElement(FinalGame)
);
