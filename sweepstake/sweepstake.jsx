// Frenchie's World Cup 2026 Sweepstake
// CDN build — no import/export, React + ReactDOM loaded globally via index.html

const { useState, useEffect, useRef } = React;

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const SHEET_ID = "1AW5_It2evEtGySBDrL5wJ7H-SfmX_wPQG3sUVAqUznE";
const CSV = (sheet) =>
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${sheet}`;

// ─── TEAMS ───────────────────────────────────────────────────────────────────
const TEAMS = [
  // Tier 1 — top seeds
  { rank: 1,  name: "France",         flag: "🇫🇷", tier: 1 },
  { rank: 2,  name: "Spain",          flag: "🇪🇸", tier: 1 },
  { rank: 3,  name: "Argentina",      flag: "🇦🇷", tier: 1 },
  { rank: 4,  name: "England",        flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", tier: 1 },
  { rank: 5,  name: "Portugal",       flag: "🇵🇹", tier: 1 },
  { rank: 6,  name: "Brazil",         flag: "🇧🇷", tier: 1 },
  { rank: 7,  name: "Netherlands",    flag: "🇳🇱", tier: 1 },
  { rank: 8,  name: "Morocco",        flag: "🇲🇦", tier: 1 },
  { rank: 9,  name: "Belgium",        flag: "🇧🇪", tier: 1 },
  { rank: 10, name: "Germany",        flag: "🇩🇪", tier: 1 },
  { rank: 11, name: "Croatia",        flag: "🇭🇷", tier: 1 },
  { rank: 13, name: "Colombia",       flag: "🇨🇴", tier: 1 },
  // Tier 2
  { rank: 14, name: "Senegal",        flag: "🇸🇳", tier: 2 },
  { rank: 15, name: "Mexico",         flag: "🇲🇽", tier: 2 },
  { rank: 16, name: "USA",            flag: "🇺🇸", tier: 2 },
  { rank: 17, name: "Uruguay",        flag: "🇺🇾", tier: 2 },
  { rank: 18, name: "Japan",          flag: "🇯🇵", tier: 2 },
  { rank: 19, name: "Switzerland",    flag: "🇨🇭", tier: 2 },
  { rank: 21, name: "Iran",           flag: "🇮🇷", tier: 2 },
  { rank: 23, name: "Austria",        flag: "🇦🇹", tier: 2 },
  { rank: 24, name: "Ecuador",        flag: "🇪🇨", tier: 2 },
  { rank: 25, name: "South Korea",    flag: "🇰🇷", tier: 2 },
  { rank: 26, name: "Australia",      flag: "🇦🇺", tier: 2 },
  { rank: 29, name: "Egypt",          flag: "🇪🇬", tier: 2 },
  // Tier 3
  { rank: 30, name: "Canada",         flag: "🇨🇦", tier: 3 },
  { rank: 33, name: "Ivory Coast",    flag: "🇨🇮", tier: 3 },
  { rank: 35, name: "Qatar",          flag: "🇶🇦", tier: 3 },
  { rank: 36, name: "Algeria",        flag: "🇩🇿", tier: 3 },
  { rank: 39, name: "Sweden",         flag: "🇸🇪", tier: 3 },
  { rank: 40, name: "Tunisia",        flag: "🇹🇳", tier: 3 },
  { rank: 41, name: "Czechia",        flag: "🇨🇿", tier: 3 },
  { rank: 42, name: "Turkiye",        flag: "🇹🇷", tier: 3 },
  { rank: 44, name: "Norway",         flag: "🇳🇴", tier: 3 },
  { rank: 47, name: "Scotland",       flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", tier: 3 },
  { rank: 51, name: "DR Congo",       flag: "🇨🇩", tier: 3 },
  { rank: 52, name: "Bosnia & Herz.", flag: "🇧🇦", tier: 3 },
  { rank: 53, name: "Panama",         flag: "🇵🇦", tier: 3 },
  { rank: 57, name: "Saudi Arabia",   flag: "🇸🇦", tier: 3 },
  { rank: 60, name: "South Africa",   flag: "🇿🇦", tier: 3 },
  { rank: 61, name: "Iraq",           flag: "🇮🇶", tier: 3 },
  { rank: 62, name: "Uzbekistan",     flag: "🇺🇿", tier: 3 },
  { rank: 64, name: "Paraguay",       flag: "🇵🇾", tier: 3 },
  { rank: 65, name: "Ghana",          flag: "🇬🇭", tier: 3 },
  { rank: 68, name: "Jordan",         flag: "🇯🇴", tier: 3 },
  { rank: 70, name: "Cape Verde",     flag: "🇨🇻", tier: 3 },
  { rank: 81, name: "Curazao",        flag: "🇨🇼", tier: 3 },
  { rank: 83, name: "Haiti",          flag: "🇭🇹", tier: 3 },
  { rank: 95, name: "New Zealand",    flag: "🇳🇿", tier: 3 },
];

// ─── GOLDEN BOOT ─────────────────────────────────────────────────────────────
// Sorted best odds first (lowest number = favourite = assigned to weakest draw)
const GOLDEN_BOOT = [
  { name: "Harry Kane",           team: "England",     odds: "8/1"  },
  { name: "Kylian Mbappe",        team: "France",      odds: "9/1"  },
  { name: "Erling Haaland",       team: "Norway",      odds: "10/1" },
  { name: "Cristiano Ronaldo",    team: "Portugal",    odds: "12/1" },
  { name: "Lamine Yamal",         team: "Spain",       odds: "14/1" },
  { name: "Jude Bellingham",      team: "England",     odds: "16/1" },
  { name: "Vinicius Junior",      team: "Brazil",      odds: "16/1" },
  { name: "Lionel Messi",         team: "Argentina",   odds: "18/1" },
  { name: "Julian Alvarez",       team: "Argentina",   odds: "20/1" },
  { name: "Romelu Lukaku",        team: "Belgium",     odds: "20/1" },
  { name: "Marcus Rashford",      team: "England",     odds: "22/1" },
  { name: "Rafael Leao",          team: "Portugal",    odds: "25/1" },
  { name: "Bukayo Saka",          team: "England",     odds: "25/1" },
  { name: "Lautaro Martinez",     team: "Argentina",   odds: "28/1" },
  { name: "Phil Foden",           team: "England",     odds: "28/1" },
  { name: "Kai Havertz",          team: "Germany",     odds: "30/1" },
  { name: "Federico Chiesa",      team: "Italy",       odds: "33/1" },
  { name: "Florian Wirtz",        team: "Germany",     odds: "33/1" },
  { name: "Khvicha Kvaratskhelia",team: "Georgia",     odds: "33/1" },
  { name: "Darwin Nunez",         team: "Uruguay",     odds: "35/1" },
  { name: "Dusan Vlahovic",       team: "Serbia",      odds: "40/1" },
  { name: "Victor Osimhen",       team: "Nigeria",     odds: "40/1" },
  { name: "Rasmus Hojlund",       team: "Denmark",     odds: "45/1" },
  { name: "Jamal Musiala",        team: "Germany",     odds: "50/1" },
  { name: "Cody Gakpo",           team: "Netherlands", odds: "50/1" },
  { name: "Memphis Depay",        team: "Netherlands", odds: "55/1" },
  { name: "Olivier Giroud",       team: "France",      odds: "60/1" },
  { name: "Alvaro Morata",        team: "Spain",       odds: "66/1" },
  { name: "Gabriel Jesus",        team: "Brazil",      odds: "70/1" },
  { name: "Son Heung-min",        team: "South Korea", odds: "75/1" },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const TIER_COLOR = { 1: "#FFD700", 2: "#C0C0C0", 3: "#CD7F32" };
const TIER_LABEL = { 1: "Top Seeds", 2: "Mid Seeds", 3: "Underdogs" };

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Parse a simple single-column CSV (Name header, one name per row)
function parseNameCSV(text) {
  return text
    .split("\n")
    .map(r => r.replace(/^"|"$/g, "").trim())
    .filter(r => r && r.toLowerCase() !== "name");
}

// Parse the Draw tab CSV — detect LOCKED state from first data row
function parseDrawCSV(text) {
  const rows = text.split("\n").map(r =>
    r.split(",").map(c => c.replace(/^"|"$/g, "").trim())
  ).filter(r => r.some(c => c));

  if (!rows.length) return { locked: false, entries: [] };

  // Check for LOCKED row — first cell = "LOCKED", second = "TRUE"
  const lockedRow = rows.find(r => r[0].toUpperCase() === "LOCKED");
  const locked = lockedRow ? lockedRow[1].toUpperCase() === "TRUE" : false;

  // Skip header and LOCKED rows, parse entries
  const entries = rows
    .filter(r => r[0].toUpperCase() !== "LOCKED" && r[0].toUpperCase() !== "NAME" && r[0])
    .map(r => ({
      name:       r[0] || "",
      team1:      r[1] || "",
      team1Rank:  r[2] || "",
      team2:      r[3] || "",
      team2Rank:  r[4] || "",
      goldenBoot: r[5] || "",
    }))
    .filter(e => e.name && e.team1);

  return { locked, entries };
}

function buildDraw(participants) {
  const n = participants.length;
  const tier1  = shuffle(TEAMS.filter(t => t.tier === 1));
  const rest   = shuffle(TEAMS.filter(t => t.tier !== 1));

  // Everyone gets one tier-1 team first
  const result = participants.map((name, i) => ({
    name,
    teams: [tier1[i % tier1.length]],
    goldenBoot: null,
  }));

  // Distribute remaining 36 teams across all participants
  const remaining    = [...tier1.slice(n), ...rest];
  const shuffledIdx  = shuffle([...Array(n).keys()]);
  remaining.forEach((team, i) => {
    result[shuffledIdx[i % n]].teams.push(team);
  });

  // ── Assign Golden Boot ────────────────────────────────────────────────────
  // Score each participant: sum of FIFA rankings (higher = weaker draw)
  // Weakest draw gets the best Golden Boot pick (lowest odds = index 0)
  const scored = result
    .map((p, i) => ({
      idx:   i,
      score: p.teams.reduce((sum, t) => sum + t.rank, 0),
    }))
    .sort((a, b) => b.score - a.score); // descending: weakest first

  const gbPool = [...GOLDEN_BOOT];
  // Pad pool if more participants than GB entries
  while (gbPool.length < n) gbPool.push(...GOLDEN_BOOT);

  scored.forEach((s, rank) => {
    result[s.idx].goldenBoot = gbPool[rank % gbPool.length];
  });

  return result;
}

// Format draw results as TSV rows for easy pasting into the Draw sheet
function drawToClipboard(draw) {
  const header = "Name\tTeam1\tTeam1_Rank\tTeam2\tTeam2_Rank\tGoldenBoot";
  const rows = draw.map(e => {
    const t1 = e.teams[0] || {};
    const t2 = e.teams[1] || {};
    const gb = e.goldenBoot ? `${e.goldenBoot.name} (${e.goldenBoot.odds})` : "";
    return [e.name, t1.name||"", t1.rank||"", t2.name||"", t2.rank||"", gb].join("\t");
  });
  return [header, ...rows].join("\n");
}

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;600&display=swap');
  @keyframes fadeUp  { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideIn { from{opacity:0;transform:translateX(-14px) scale(.97)} to{opacity:1;transform:translateX(0) scale(1)} }
  @keyframes twinkle { from{opacity:.15;transform:scale(1)} to{opacity:.7;transform:scale(1.6)} }
  @keyframes spin    { to{transform:rotate(360deg)} }
  .fade-up  { animation:fadeUp .6s ease both }
  .slide-in { animation:slideIn .3s ease both }
  .btn {
    font-family:'Bebas Neue',sans-serif;
    letter-spacing:2px; font-size:1rem;
    padding:12px 28px; border:none; border-radius:3px;
    cursor:pointer; transition:transform .15s,box-shadow .15s;
  }
  .btn:hover  { transform:translateY(-2px) }
  .btn:active { transform:translateY(0) }
  .btn-red    { background:linear-gradient(135deg,#C0392B,#e74c3c);color:#fff }
  .btn-red:hover  { box-shadow:0 4px 20px #C0392B99 }
  .btn-gold   { background:linear-gradient(135deg,#b8860b,#FFD700);color:#111 }
  .btn-gold:hover { box-shadow:0 4px 20px #FFD70099 }
  .btn-ghost  { background:transparent;color:#F5F0E8;border:1px solid #444 }
  .btn-ghost:hover{ border-color:#FFD700;color:#FFD700 }
  .card {
    background:rgba(255,255,255,.04);
    border:1px solid rgba(255,215,0,.15);
    border-radius:6px; padding:16px;
    transition:transform .2s;
  }
  .card:hover { transform:translateY(-2px) }
  input[type=text],textarea {
    background:rgba(0,0,0,.5); border:1px solid #333;
    border-radius:3px; color:#F5F0E8;
    font-family:'Barlow',sans-serif; font-size:1rem;
    padding:10px 14px; outline:none; transition:border-color .2s;
  }
  input[type=text]:focus,textarea:focus { border-color:#FFD700 }
  .locked-badge {
    display:inline-block; background:#C0392B22;
    border:1px solid #C0392B88; color:#e74c3c;
    font-family:'Bebas Neue',sans-serif; letter-spacing:2px;
    font-size:.8rem; padding:4px 12px; border-radius:3px;
  }
  .gb-pill {
    display:inline-flex; align-items:center; gap:6px;
    background:rgba(255,215,0,.1); border:1px solid rgba(255,215,0,.3);
    border-radius:3px; padding:4px 10px; font-size:.82rem;
  }
  @media print {
    #site-nav,.no-print { display:none!important }
    body { background:white!important;color:black!important }
    .card { border:1px solid #ccc!important;background:white!important }
  }
`;

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
function Sweepstake() {
  const [status,     setStatus]     = useState("loading"); // loading|setup|drawing|results|locked
  const [loadError,  setLoadError]  = useState("");
  const [names,      setNames]      = useState([]);
  const [draw,       setDraw]       = useState([]);
  const [lockedDraw, setLockedDraw] = useState([]);
  const [revealed,   setRevealed]   = useState(new Set());
  const [revealIdx,  setRevealIdx]  = useState(-1);
  const [search,     setSearch]     = useState("");
  const [copied,     setCopied]     = useState(false);
  const autoRef = useRef(null);

  // Inject CSS once
  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = CSS;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  // On mount: check Draw tab first (locked?), then load Participants
  useEffect(() => { initialLoad(); }, []);

  async function initialLoad() {
    setStatus("loading");
    try {
      // 1. Check Draw tab for a locked result
      const drawRes  = await fetch(CSV("Draw"));
      const drawText = await drawRes.text();
      const { locked, entries } = parseDrawCSV(drawText);

      if (locked && entries.length) {
        setLockedDraw(entries);
        setStatus("locked");
        return;
      }

      // 2. Load participant names
      const nameRes  = await fetch(CSV("Participants"));
      const nameText = await nameRes.text();
      const parsed   = parseNameCSV(nameText);

      if (!parsed.length) {
        setLoadError("No names found in the Participants tab. Add some names and refresh.");
        setStatus("error");
        return;
      }

      setNames(parsed);
      setStatus("setup");
    } catch (e) {
      setLoadError("Couldn't reach the Google Sheet. Check it's published to the web.");
      setStatus("error");
    }
  }

  function runDraw() {
    const result = buildDraw(names);
    setDraw(result);
    setRevealed(new Set());
    setRevealIdx(-1);
    setStatus("drawing");
  }

  function revealNext() {
    const next = revealIdx + 1;
    if (next >= draw.length) { setStatus("results"); return; }
    setRevealIdx(next);
    setRevealed(prev => new Set([...prev, next]));
  }

  function revealAll() {
    setRevealed(new Set(draw.map((_, i) => i)));
    setRevealIdx(draw.length - 1);
    setStatus("results");
  }

  function startAuto() {
    autoRef.current = setInterval(() => {
      setRevealIdx(prev => {
        const next = prev + 1;
        if (next >= draw.length) {
          clearInterval(autoRef.current);
          setStatus("results");
          return prev;
        }
        setRevealed(r => new Set([...r, next]));
        return next;
      });
    }, 700);
  }

  useEffect(() => () => clearInterval(autoRef.current), []);

  async function copyForSheet() {
    const tsv = drawToClipboard(draw);
    try {
      await navigator.clipboard.writeText(tsv);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback: create a textarea and copy from it
      const ta = document.createElement("textarea");
      ta.value = tsv;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  }

  const pct      = draw.length ? (revealed.size / draw.length) * 100 : 0;
  const filtered = (status === "results" ? draw : []).filter(d =>
    !search ||
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.teams.some(t => t.name.toLowerCase().includes(search.toLowerCase())) ||
    (d.goldenBoot && d.goldenBoot.name.toLowerCase().includes(search.toLowerCase()))
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(150deg,#0a0a14 0%,#0d1520 50%,#160a0a 100%)",
      padding:"32px 16px 64px", position:"relative", overflow:"hidden",
      fontFamily:"'Barlow',sans-serif", color:"#F5F0E8"
    }}>

      {/* Sparkles */}
      {[...Array(18)].map((_,i) => (
        <div key={i} style={{
          position:"fixed", borderRadius:"50%", pointerEvents:"none",
          width:i%3===0?3:2, height:i%3===0?3:2,
          background:i%4===0?"#FFD700":i%4===1?"#fff":"#C0392B",
          left:`${(i*17+5)%100}%`, top:`${(i*13+8)%100}%`,
          opacity:.25, animation:`twinkle ${2+(i%3)}s ease-in-out ${i*.25}s infinite alternate`
        }}/>
      ))}

      <div style={{ maxWidth:900, margin:"0 auto", position:"relative", zIndex:1 }}>

        {/* ── Header (always shown) ── */}
        <div className="fade-up" style={{ textAlign:"center", marginBottom:40 }}>
          <div style={{ fontSize:"2.8rem", marginBottom:6 }}>⚽</div>
          <h1 style={{
            fontFamily:"'Bebas Neue',sans-serif",
            fontSize:"clamp(2.8rem,7vw,5rem)",
            letterSpacing:4, color:"#FFD700",
            textShadow:"0 0 40px #FFD70055",
            lineHeight:1, margin:"0 0 6px"
          }}>Frenchie's</h1>
          <h2 style={{
            fontFamily:"'Bebas Neue',sans-serif",
            fontSize:"clamp(1rem,2.5vw,1.5rem)",
            letterSpacing:8, color:"#F5F0E8",
            fontWeight:"normal", margin:"0 0 12px", opacity:.85
          }}>World Cup 2026 Sweepstake</h2>
          <div style={{ width:100, height:2, background:"linear-gradient(90deg,transparent,#FFD700,transparent)", margin:"0 auto 10px" }}/>
          <p style={{ color:"#555", fontSize:".78rem", letterSpacing:3, textTransform:"uppercase" }}>
            USA · Canada · Mexico · 11 Jun – 19 Jul
          </p>
        </div>

        {/* ════════ LOADING ════════ */}
        {status === "loading" && (
          <div style={{ textAlign:"center", padding:"60px 0" }}>
            <div style={{
              width:36, height:36, border:"3px solid #222",
              borderTopColor:"#FFD700", borderRadius:"50%",
              animation:"spin .8s linear infinite", margin:"0 auto 16px"
            }}/>
            <p style={{ color:"#666", letterSpacing:2, textTransform:"uppercase", fontSize:".85rem" }}>
              Loading draw data…
            </p>
          </div>
        )}

        {/* ════════ ERROR ════════ */}
        {status === "error" && (
          <div className="card" style={{ textAlign:"center", padding:"40px", borderColor:"#C0392B44" }}>
            <p style={{ color:"#e74c3c", fontSize:"1.1rem", marginBottom:16 }}>⚠️ {loadError}</p>
            <button className="btn btn-ghost" onClick={initialLoad}>↺ Retry</button>
          </div>
        )}

        {/* ════════ SETUP ════════ */}
        {status === "setup" && (
          <div className="fade-up">
            <div className="card" style={{ marginBottom:28, textAlign:"center" }}>
              <p style={{ color:"#FFD700", fontFamily:"'Bebas Neue',sans-serif", letterSpacing:2, fontSize:".9rem", marginBottom:12 }}>
                📋 PLAYERS LOADED FROM SHEET
              </p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center", marginBottom:16 }}>
                {names.map((n,i) => (
                  <span key={i} style={{
                    background:"rgba(255,215,0,.08)", border:"1px solid rgba(255,215,0,.2)",
                    borderRadius:3, padding:"5px 12px", fontSize:".9rem", color:"#F5F0E8"
                  }}>{n}</span>
                ))}
              </div>
              <p style={{ color:"#555", fontSize:".82rem" }}>
                {names.length} players · 48 teams · Golden Boot assigned by draw strength
              </p>
              <button className="btn btn-ghost no-print" style={{ marginTop:12, fontSize:".8rem", padding:"6px 14px" }} onClick={initialLoad}>
                ↺ Refresh from sheet
              </button>
            </div>

            <div style={{ textAlign:"center", marginBottom:40 }}>
              <button className="btn btn-red" style={{ fontSize:"1.2rem", padding:"16px 48px" }} onClick={runDraw}>
                🎰 Run the Draw
              </button>
            </div>
          </div>
        )}

        {/* ════════ DRAWING ════════ */}
        {status === "drawing" && (
          <div>
            <div style={{ textAlign:"center", marginBottom:24 }}>
              <p style={{ color:"#888", fontSize:".8rem", letterSpacing:2, textTransform:"uppercase", marginBottom:8 }}>
                {revealed.size} of {draw.length} revealed
              </p>
              <div style={{ height:4, background:"#1a1a1a", borderRadius:2 }}>
                <div style={{
                  height:"100%", borderRadius:2,
                  width:`${pct}%`,
                  background:"linear-gradient(90deg,#C0392B,#FFD700)",
                  transition:"width .4s ease"
                }}/>
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))", gap:12, marginBottom:24 }}>
              {draw.map((entry, i) => (
                <div key={i} className={revealed.has(i) ? "card slide-in" : "card"} style={{
                  minHeight:100,
                  borderColor:revealed.has(i)?"rgba(255,215,0,.3)":"rgba(255,255,255,.06)",
                  background:revealed.has(i)?"rgba(255,215,0,.06)":"rgba(255,255,255,.03)",
                  display:"flex", flexDirection:"column", justifyContent:"center"
                }}>
                  <p style={{ color:"#FFD700", fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1, fontSize:"1.05rem", marginBottom:8 }}>
                    {entry.name}
                  </p>
                  {revealed.has(i) ? (
                    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                      {entry.teams.map((t, ti) => (
                        <div key={ti} style={{ display:"flex", alignItems:"center", gap:8, fontSize:".88rem" }}>
                          <span>{t.flag}</span>
                          <span style={{ color:ti===0?"#F5F0E8":"#777", flex:1 }}>{t.name}</span>
                          <span style={{
                            fontSize:".7rem", padding:"2px 6px", borderRadius:3,
                            background:TIER_COLOR[t.tier]+"22", color:TIER_COLOR[t.tier],
                            border:`1px solid ${TIER_COLOR[t.tier]}44`
                          }}>#{t.rank}</span>
                        </div>
                      ))}
                      {entry.goldenBoot && (
                        <div style={{ marginTop:6 }} className="gb-pill">
                          <span>👟</span>
                          <span style={{ color:"#FFD700" }}>{entry.goldenBoot.name}</span>
                          <span style={{ color:"#888" }}>{entry.goldenBoot.odds}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ textAlign:"center", fontSize:"1.6rem", opacity:.25 }}>🎰</div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
              {revealed.size < draw.length ? (
                <>
                  <button className="btn btn-red" onClick={revealNext}>🎲 Reveal Next</button>
                  <button className="btn btn-ghost" onClick={startAuto}>▶ Auto Reveal</button>
                  <button className="btn btn-ghost" onClick={revealAll}>⚡ Skip to Results</button>
                </>
              ) : (
                <button className="btn btn-gold" onClick={() => setStatus("results")}>
                  🏆 See Full Results
                </button>
              )}
            </div>
          </div>
        )}

        {/* ════════ RESULTS (post-draw, not yet locked) ════════ */}
        {status === "results" && (
          <div className="fade-up">
            <div style={{ textAlign:"center", marginBottom:24 }}>
              <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", color:"#FFD700", letterSpacing:4, fontSize:"1.8rem", marginBottom:12 }}>
                🏆 The Draw Is Done
              </h2>
              <input type="text" placeholder="🔍  Search player, team or Golden Boot..."
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ width:"min(340px,100%)", marginBottom:16 }}
              />
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))", gap:12, marginBottom:32 }}>
              {filtered.map((entry, i) => (
                <div key={i} className="card slide-in" style={{ animationDelay:`${i*.03}s` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                    <span style={{ color:"#FFD700", fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1, fontSize:"1.1rem" }}>
                      {entry.name}
                    </span>
                    <span style={{ color:"#444", fontSize:".75rem" }}>
                      {entry.teams.length} team{entry.teams.length>1?"s":""}
                    </span>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:5, marginBottom:8 }}>
                    {entry.teams.map((t, ti) => (
                      <div key={ti} style={{
                        display:"flex", alignItems:"center", gap:10,
                        padding:"5px 9px", borderRadius:3,
                        background:ti===0?"rgba(255,215,0,.07)":"rgba(255,255,255,.02)",
                        border:`1px solid ${TIER_COLOR[t.tier]}1a`
                      }}>
                        <span style={{ fontSize:"1.1rem" }}>{t.flag}</span>
                        <span style={{ flex:1, color:ti===0?"#F5F0E8":"#888", fontSize:".9rem" }}>{t.name}</span>
                        <span style={{
                          fontSize:".68rem", padding:"2px 6px", borderRadius:3,
                          background:TIER_COLOR[t.tier]+"22", color:TIER_COLOR[t.tier],
                          border:`1px solid ${TIER_COLOR[t.tier]}44`
                        }}>#{t.rank}</span>
                      </div>
                    ))}
                  </div>
                  {entry.goldenBoot && (
                    <div className="gb-pill">
                      <span>👟</span>
                      <span style={{ color:"#FFD700", fontSize:".85rem" }}>{entry.goldenBoot.name}</span>
                      <span style={{ color:"#666", fontSize:".78rem" }}>{entry.goldenBoot.team}</span>
                      <span style={{ color:"#888", fontSize:".78rem", marginLeft:"auto" }}>{entry.goldenBoot.odds}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Lock instructions */}
            <div className="card no-print" style={{ borderColor:"#C0392B44", marginBottom:24 }}>
              <p style={{ color:"#FFD700", fontFamily:"'Bebas Neue',sans-serif", letterSpacing:2, fontSize:".9rem", marginBottom:12 }}>
                🔒 LOCK THE DRAW — FRENCHIE'S STEPS
              </p>
              <ol style={{ color:"#aaa", fontSize:".9rem", lineHeight:2, paddingLeft:20 }}>
                <li>Click <strong style={{ color:"#F5F0E8" }}>Copy Results for Sheet</strong> below</li>
                <li>Open the <strong style={{ color:"#F5F0E8" }}>Draw</strong> tab in Google Sheets</li>
                <li>Click cell <strong style={{ color:"#F5F0E8" }}>A1</strong> and paste (Ctrl+V / Cmd+V)</li>
                <li>In cell <strong style={{ color:"#F5F0E8" }}>H1</strong> type <code style={{ color:"#FFD700" }}>LOCKED</code>, in <strong style={{ color:"#F5F0E8" }}>H2</strong> type <code style={{ color:"#FFD700" }}>TRUE</code></li>
                <li>Everyone refreshes this page — draw is frozen ✅</li>
              </ol>
              <div style={{ display:"flex", gap:12, marginTop:16, flexWrap:"wrap" }}>
                <button className="btn btn-red" onClick={copyForSheet}>
                  {copied ? "✅ Copied!" : "📋 Copy Results for Sheet"}
                </button>
                <button className="btn btn-ghost" onClick={() => window.print()}>🖨 Print</button>
                <button className="btn btn-ghost" onClick={() => { setStatus("setup"); setDraw([]); setRevealed(new Set()); }}>
                  🔄 Re-run Draw
                </button>
              </div>
            </div>

            <p style={{ textAlign:"center", color:"#222", fontSize:".72rem", letterSpacing:2 }}>
              FRENCHIE'S SWEEPSTAKE · WORLD CUP 2026 · PHASE 1
            </p>
          </div>
        )}

        {/* ════════ LOCKED — permanent results view ════════ */}
        {status === "locked" && (
          <div className="fade-up">
            <div style={{ textAlign:"center", marginBottom:24 }}>
              <span className="locked-badge" style={{ marginBottom:16, display:"inline-block" }}>🔒 Draw Locked</span>
              <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", color:"#FFD700", letterSpacing:4, fontSize:"1.8rem", margin:"12px 0" }}>
                Official Results
              </h2>
              <input type="text" placeholder="🔍  Search player, team or Golden Boot..."
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ width:"min(340px,100%)" }}
              />
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))", gap:12, marginBottom:32 }}>
              {lockedDraw
                .filter(e => !search ||
                  e.name.toLowerCase().includes(search.toLowerCase()) ||
                  e.team1.toLowerCase().includes(search.toLowerCase()) ||
                  e.team2.toLowerCase().includes(search.toLowerCase()) ||
                  e.goldenBoot.toLowerCase().includes(search.toLowerCase())
                )
                .map((entry, i) => (
                  <div key={i} className="card slide-in" style={{ animationDelay:`${i*.03}s` }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                      <span style={{ color:"#FFD700", fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1, fontSize:"1.1rem" }}>
                        {entry.name}
                      </span>
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", gap:5, marginBottom:8 }}>
                      {[{ name:entry.team1, rank:entry.team1Rank }, { name:entry.team2, rank:entry.team2Rank }]
                        .filter(t => t.name)
                        .map((t, ti) => {
                          const found = TEAMS.find(x => x.name === t.name);
                          const tier  = found ? found.tier : 3;
                          return (
                            <div key={ti} style={{
                              display:"flex", alignItems:"center", gap:10,
                              padding:"5px 9px", borderRadius:3,
                              background:ti===0?"rgba(255,215,0,.07)":"rgba(255,255,255,.02)",
                              border:`1px solid ${TIER_COLOR[tier]}1a`
                            }}>
                              <span style={{ fontSize:"1.1rem" }}>{found ? found.flag : "🏳️"}</span>
                              <span style={{ flex:1, color:ti===0?"#F5F0E8":"#888", fontSize:".9rem" }}>{t.name}</span>
                              <span style={{
                                fontSize:".68rem", padding:"2px 6px", borderRadius:3,
                                background:TIER_COLOR[tier]+"22", color:TIER_COLOR[tier],
                                border:`1px solid ${TIER_COLOR[tier]}44`
                              }}>#{t.rank}</span>
                            </div>
                          );
                        })}
                    </div>
                    {entry.goldenBoot && (
                      <div className="gb-pill">
                        <span>👟</span>
                        <span style={{ color:"#FFD700", fontSize:".85rem" }}>{entry.goldenBoot}</span>
                      </div>
                    )}
                  </div>
              ))}
            </div>

            <div style={{ textAlign:"center" }}>
              <button className="btn btn-ghost no-print" onClick={() => window.print()}>🖨 Print Results</button>
            </div>
            <p style={{ textAlign:"center", color:"#222", fontSize:".72rem", letterSpacing:2, marginTop:24 }}>
              FRENCHIE'S SWEEPSTAKE · WORLD CUP 2026 · LOCKED
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

// Mount
ReactDOM.createRoot(document.getElementById("root")).render(
  React.createElement(Sweepstake)
);
