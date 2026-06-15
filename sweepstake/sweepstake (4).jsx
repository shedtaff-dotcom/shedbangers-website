// Frenchie's World Cup 2026 Sweepstake
// CDN build — no import/export, React + ReactDOM loaded globally via index.html

const { useState, useEffect, useRef } = React;

// ─── CONFIG ──────────────────────────────────────────────────────────────────
// Published spreadsheet ID (from File -> Share -> Publish to web URL)
const PUB_ID = "2PACX-1vRm-ufKNgAVjNicy9TrTR6zwx4F8L9zLoyiZyiQxrMjbpv8pFSJNzYFTpVTIs8w1gmyGoP_mbzC9Ipq";
// Tab gids (from edit URL when clicking each tab: ...#gid=NUMBER)
const TAB_IDS = {
  "FinalDraw": "276613855",
  "Status":    "12183942",
  "GB":        "1062655705",
  "Results":   "921171610",
};
// Use the published ID with gid — this is the correct public CSV endpoint
const SHEET_URL = (sheet) => {
  const gid = TAB_IDS[sheet];
  return `https://docs.google.com/spreadsheets/d/e/${PUB_ID}/pub?output=csv&single=true&gid=${gid}`;
};
const IS_ADMIN = typeof window !== "undefined" &&
                 window.location.search.includes("admin=true");

// ─── POINTS SYSTEM ───────────────────────────────────────────────────────────
const PTS = {
  WIN: 3, DRAW: 1,
  R16: 5, QF: 10, SF: 15, THIRD: 20, "RUNNER UP": 25, WINNER: 50,
  GB_GOAL: 5, GB_BONUS: 10,   // bonus auto-awarded to top scorer
};

const PRIZES = { winner: 40, goldenBoot: 10, pointsTable: 10 };

// ─── TEAMS ───────────────────────────────────────────────────────────────────
const TEAMS = [
  { rank:1,  name:"France",         flag:"🇫🇷", tier:1 },
  { rank:2,  name:"Spain",          flag:"🇪🇸", tier:1 },
  { rank:3,  name:"Argentina",      flag:"🇦🇷", tier:1 },
  { rank:4,  name:"England",        flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", tier:1 },
  { rank:5,  name:"Portugal",       flag:"🇵🇹", tier:1 },
  { rank:6,  name:"Brazil",         flag:"🇧🇷", tier:1 },
  { rank:7,  name:"Netherlands",    flag:"🇳🇱", tier:1 },
  { rank:8,  name:"Morocco",        flag:"🇲🇦", tier:1 },
  { rank:9,  name:"Belgium",        flag:"🇧🇪", tier:1 },
  { rank:10, name:"Germany",        flag:"🇩🇪", tier:1 },
  { rank:11, name:"Croatia",        flag:"🇭🇷", tier:1 },
  { rank:13, name:"Colombia",       flag:"🇨🇴", tier:1 },
  { rank:14, name:"Senegal",        flag:"🇸🇳", tier:2 },
  { rank:15, name:"Mexico",         flag:"🇲🇽", tier:2 },
  { rank:16, name:"USA",            flag:"🇺🇸", tier:2 },
  { rank:17, name:"Uruguay",        flag:"🇺🇾", tier:2 },
  { rank:18, name:"Japan",          flag:"🇯🇵", tier:2 },
  { rank:19, name:"Switzerland",    flag:"🇨🇭", tier:2 },
  { rank:21, name:"Iran",           flag:"🇮🇷", tier:2 },
  { rank:23, name:"Austria",        flag:"🇦🇹", tier:2 },
  { rank:24, name:"Ecuador",        flag:"🇪🇨", tier:2 },
  { rank:25, name:"South Korea",    flag:"🇰🇷", tier:2 },
  { rank:26, name:"Australia",      flag:"🇦🇺", tier:2 },
  { rank:29, name:"Egypt",          flag:"🇪🇬", tier:2 },
  { rank:30, name:"Canada",         flag:"🇨🇦", tier:3 },
  { rank:33, name:"Ivory Coast",    flag:"🇨🇮", tier:3 },
  { rank:35, name:"Qatar",          flag:"🇶🇦", tier:3 },
  { rank:36, name:"Algeria",        flag:"🇩🇿", tier:3 },
  { rank:39, name:"Sweden",         flag:"🇸🇪", tier:3 },
  { rank:40, name:"Tunisia",        flag:"🇹🇳", tier:3 },
  { rank:41, name:"Czechia",        flag:"🇨🇿", tier:3 },
  { rank:42, name:"Turkiye",        flag:"🇹🇷", tier:3 },
  { rank:44, name:"Norway",         flag:"🇳🇴", tier:3 },
  { rank:47, name:"Scotland",       flag:"🏴󠁧󠁢󠁳󠁣󠁴󠁿", tier:3 },
  { rank:51, name:"DR Congo",       flag:"🇨🇩", tier:3 },
  { rank:52, name:"Bosnia & Herz.", flag:"🇧🇦", tier:3 },
  { rank:53, name:"Panama",         flag:"🇵🇦", tier:3 },
  { rank:57, name:"Saudi Arabia",   flag:"🇸🇦", tier:3 },
  { rank:60, name:"South Africa",   flag:"🇿🇦", tier:3 },
  { rank:61, name:"Iraq",           flag:"🇮🇶", tier:3 },
  { rank:62, name:"Uzbekistan",     flag:"🇺🇿", tier:3 },
  { rank:64, name:"Paraguay",       flag:"🇵🇾", tier:3 },
  { rank:65, name:"Ghana",          flag:"🇬🇭", tier:3 },
  { rank:68, name:"Jordan",         flag:"🇯🇴", tier:3 },
  { rank:70, name:"Cape Verde",     flag:"🇨🇻", tier:3 },
  { rank:81, name:"Curazao",        flag:"🇨🇼", tier:3 },
  { rank:83, name:"Haiti",          flag:"🇭🇹", tier:3 },
  { rank:95, name:"New Zealand",    flag:"🇳🇿", tier:3 },
];

function teamInfo(name) {
  return TEAMS.find(t => t.name.toLowerCase() === (name||"").toLowerCase()) ||
         { flag:"🏳️", tier:3, rank:"?" };
}

// ─── STATUS HELPERS ───────────────────────────────────────────────────────────
const KNOCKOUT_PTS = { R16:5, QF:10, SF:15, THIRD:20, "RUNNER UP":25, WINNER:50 };
const STAGE_LABEL  = {
  WINNER:      { label:"🏆 Winner",      color:"#FFD700" },
  "RUNNER UP": { label:"🥈 Runner Up",   color:"#C0C0C0" },
  THIRD:       { label:"🥉 3rd",         color:"#CD7F32" },
  SF:          { label:"⚽ Semi Final",  color:"#90CDF4" },
  QF:          { label:"⚽ Quarter Final",color:"#63B3ED"},
  R16:         { label:"R16",            color:"#888"    },
  OUT:         { label:"❌ Out",          color:"#555"    },
  IN:          { label:"",               color:""        },
};

function normaliseStatus(s) {
  if (!s) return "IN";
  const u = s.toUpperCase().trim();
  if (u === "IN" || u === "") return "IN";
  if (u === "OUT" || u.startsWith("OUT") || u==="GS"||u==="R1"||u==="R2"||u==="R3") return "OUT";
  if (KNOCKOUT_PTS[u] !== undefined) return u;
  return "IN";
}

function isEliminated(status) {
  return status === "OUT";
}

function isStillIn(status) {
  return status !== "OUT";
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

function parseSheet(text, hasHeader=true) {
  const rows = text.split("\n").map(parseCSVRow).filter(r=>r.some(c=>c));
  return hasHeader ? rows.slice(1) : rows;
}

function parseFinalDraw(text) {
  const stripHash = s => (s||"").replace(/^#/, "").trim();
  return parseSheet(text).map(r => ({
    name:     r[0]||"",  team1:    r[1]||"", rank1: stripHash(r[2]),
    team2:    r[3]||"",  rank2:    stripHash(r[4]), team3: r[5]||"",
    rank3:    stripHash(r[6]),     team4:    r[7]||"", rank4: stripHash(r[8]),
    gbPlayer: r[9]||"",  gbTeam:   r[10]||"",
  // Filter: must have a name that looks like a person (not a stray number/empty row)
  })).filter(e => e.name && e.team1 && isNaN(e.name.trim()));
}

function parseStatusTab(text) {
  const map = {};
  parseSheet(text).forEach(r => {
    if (r[0]) map[r[0].trim()] = normaliseStatus(r[1]||"");
  });
  return map;
}

function parseGBTab(text) {
  // Name, Goals
  const list = parseSheet(text).map(r => ({
    name:  r[0]||"",
    goals: parseInt(r[1]||"0", 10) || 0,
  })).filter(e=>e.name);
  return list;
}

function parseTopScorers(text) {
  // Local CSV from GitHub Actions: Player, Goals, Team
  return parseSheet(text).map(r => ({
    name:  (r[0]||"").trim(),
    goals: parseInt(r[1]||"0", 10) || 0,
    team:  (r[2]||"").trim(),
  })).filter(e => e.name);
}

function parseResultsTab(text) {
  // Columns: HomeTeam | HomeGoals | AwayGoals | AwayTeam
  // (Wikipedia pull has AwayGoals before AwayTeam)
  const toGoals = s => {
    if (s === null || s === undefined) return null;
    const clean = String(s).trim().replace(/[^\d]/g, "");
    if (clean === "") return null;
    const n = parseInt(clean, 10);
    return isNaN(n) ? null : n;
  };
  return parseSheet(text).map(r => ({
    home:      (r[0]||"").trim(),
    homeGoals: toGoals(r[1]),
    awayGoals: toGoals(r[2]),
    away:      (r[3]||"").trim(),
  })).filter(r =>
    r.home && r.away &&
    r.homeGoals !== null && r.awayGoals !== null
  );
}

// ─── SCORE CALCULATION ────────────────────────────────────────────────────────
function calcPoints(entries, statusMap, results, gbList) {
  // Build team win/draw counts from results
  const teamWins  = {};
  const teamDraws = {};
  results.forEach(r => {
    if (r.homeGoals > r.awayGoals) {
      teamWins[r.home]  = (teamWins[r.home]  || 0) + 1;
    } else if (r.homeGoals < r.awayGoals) {
      teamWins[r.away]  = (teamWins[r.away]  || 0) + 1;
    } else {
      teamDraws[r.home] = (teamDraws[r.home] || 0) + 1;
      teamDraws[r.away] = (teamDraws[r.away] || 0) + 1;
    }
  });

  // GB goals map  name -> goals
  // API-Football returns shortened names ("H. Kane") so match on last name
  const gbGoals = {};
  const lastName = n => n.trim().split(/\s+/).pop().toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, ""); // strip accents

  gbList.forEach(g => {
    gbGoals[g.name] = g.goals; // exact match first
    gbGoals[lastName(g.name)] = g.goals; // last name fallback
  });

  const lookupGoals = (playerName) => {
    if (!playerName) return 0;
    // Try exact, then last name
    if (gbGoals[playerName] !== undefined) return gbGoals[playerName];
    const last = lastName(playerName);
    return gbGoals[last] || 0;
  };

  // Top GB scorer(s) — used for bonus
  const maxGoals = gbList.length ? Math.max(...gbList.map(g=>g.goals)) : 0;
  // Match top scorers by last name too since API uses shortened names
  const topScorerLastNames = new Set(
    gbList.filter(g=>g.goals===maxGoals&&g.goals>0).map(g=>lastName(g.name))
  );
  const topScorers = new Set(gbList.filter(g=>g.goals===maxGoals&&g.goals>0).map(g=>g.name));
  const isTopScorer = (playerName) =>
    topScorers.has(playerName) || topScorerLastNames.has(lastName(playerName||""));

  // Build GB player -> entry map
  const gbPlayerToEntry = {};
  entries.forEach(e => { gbPlayerToEntry[e.gbPlayer] = e.name; });

  const scores = entries.map(entry => {
    const myTeams = [
      { name:entry.team1, rank:entry.rank1 },
      { name:entry.team2, rank:entry.rank2 },
      { name:entry.team3, rank:entry.rank3 },
      { name:entry.team4, rank:entry.rank4 },
    ].filter(t=>t.name);

    let matchPts    = 0;
    let knockoutPts = 0;
    let gbPts       = 0;
    const breakdown = [];

    myTeams.forEach(t => {
      const wins  = teamWins[t.name]  || 0;
      const draws = teamDraws[t.name] || 0;
      const wp    = wins  * PTS.WIN;
      const dp    = draws * PTS.DRAW;
      matchPts += wp + dp;
      if (wins)  breakdown.push(`${t.name}: ${wins}W=${wp}pts`);
      if (draws) breakdown.push(`${t.name}: ${draws}D=${dp}pts`);

      const stage = statusMap[t.name] || "IN";
      const kp    = KNOCKOUT_PTS[stage] || 0;
      knockoutPts += kp;
      if (kp) breakdown.push(`${t.name} ${stage}: ${kp}pts`);
    });

    // GB points
    const goals = lookupGoals(entry.gbPlayer);
    gbPts += goals * PTS.GB_GOAL;
    if (goals) breakdown.push(`${entry.gbPlayer}: ${goals} goals=${goals*PTS.GB_GOAL}pts`);
    if (isTopScorer(entry.gbPlayer) && maxGoals > 0) {
      gbPts += PTS.GB_BONUS;
      breakdown.push(`GB Winner bonus: ${PTS.GB_BONUS}pts`);
    }

    const total = matchPts + knockoutPts + gbPts;
    return {
      name: entry.name,
      total, matchPts, knockoutPts, gbPts,
      breakdown,
      gbPlayer:  entry.gbPlayer,
      gbGoals:   goals,
      gbTeam:    entry.gbTeam,
      isTopGB:   isTopScorer(entry.gbPlayer),
      teams:     myTeams,
    };
  });

  return scores.sort((a,b) => b.total - a.total);
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const TIER_COLOR = { 1:"#FFD700", 2:"#C0C0C0", 3:"#CD7F32" };

// Build a map of teamName -> { w, d, l, gf, ga } from results
function buildTeamRecords(results) {
  const rec = {};
  const init = () => ({ w:0, d:0, l:0, gf:0, ga:0 });
  results.forEach(r => {
    if (!rec[r.home]) rec[r.home] = init();
    if (!rec[r.away]) rec[r.away] = init();
    rec[r.home].gf += r.homeGoals; rec[r.home].ga += r.awayGoals;
    rec[r.away].gf += r.awayGoals; rec[r.away].ga += r.homeGoals;
    if (r.homeGoals > r.awayGoals) { rec[r.home].w++; rec[r.away].l++; }
    else if (r.homeGoals < r.awayGoals) { rec[r.away].w++; rec[r.home].l++; }
    else { rec[r.home].d++; rec[r.away].d++; }
  });
  return rec;
}

function teamsForEntry(entry) {
  return [
    { name:entry.team1, rank:entry.rank1 },
    { name:entry.team2, rank:entry.rank2 },
    { name:entry.team3, rank:entry.rank3 },
    { name:entry.team4, rank:entry.rank4 },
  ].filter(t=>t.name);
}

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;600&display=swap');
  @keyframes fadeUp  {from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideIn {from{opacity:0;transform:translateX(-12px) scale(.97)}to{opacity:1;transform:translateX(0) scale(1)}}
  @keyframes twinkle {from{opacity:.1;transform:scale(1)}to{opacity:.55;transform:scale(1.5)}}
  @keyframes spin    {to{transform:rotate(360deg)}}
  @keyframes popIn   {0%{transform:scale(.8);opacity:0}70%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
  .fade-up  {animation:fadeUp .5s ease both}
  .slide-in {animation:slideIn .28s ease both}
  .pop-in   {animation:popIn .4s ease both}
  .btn {
    font-family:'Bebas Neue',sans-serif; letter-spacing:2px;
    font-size:.95rem; padding:11px 26px; border:none; border-radius:3px;
    cursor:pointer; transition:transform .15s,box-shadow .15s;
  }
  .btn:hover  {transform:translateY(-2px)}
  .btn:active {transform:translateY(0)}
  .btn-red   {background:linear-gradient(135deg,#C0392B,#e74c3c);color:#fff}
  .btn-red:hover  {box-shadow:0 4px 20px #C0392B99}
  .btn-gold  {background:linear-gradient(135deg,#b8860b,#FFD700);color:#111}
  .btn-gold:hover {box-shadow:0 4px 20px #FFD70099}
  .btn-ghost {background:transparent;color:#F5F0E8;border:1px solid #333}
  .btn-ghost:hover{border-color:#FFD700;color:#FFD700}
  .card {
    background:rgba(255,255,255,.04); border:1px solid rgba(255,215,0,.15);
    border-radius:6px; padding:16px; transition:transform .2s,opacity .2s;
  }
  .card:hover {transform:translateY(-2px)}
  .card.eliminated {opacity:.4}
  .card.eliminated:hover {opacity:.65;transform:translateY(-2px)}
  .tab {
    font-family:'Bebas Neue',sans-serif; letter-spacing:2px; font-size:.9rem;
    padding:10px 20px; border:none; border-bottom:2px solid transparent;
    background:transparent; color:#666; cursor:pointer; transition:all .2s;
  }
  .tab.active {color:#FFD700;border-bottom-color:#FFD700}
  .tab:hover  {color:#F5F0E8}
  input[type=text] {
    background:rgba(0,0,0,.5); border:1px solid #333; border-radius:3px;
    color:#F5F0E8; font-family:'Barlow',sans-serif; font-size:1rem;
    padding:10px 14px; outline:none; transition:border-color .2s;
  }
  input[type=text]:focus {border-color:#FFD700}
  .gb-pill {
    display:inline-flex; align-items:center; gap:6px;
    background:rgba(255,215,0,.07); border:1px solid rgba(255,215,0,.2);
    border-radius:3px; padding:4px 10px; font-size:.82rem; width:100%;
  }
  .pts-bar-fill {
    height:100%; border-radius:2px;
    background:linear-gradient(90deg,#C0392B,#FFD700);
    transition:width .6s ease;
  }
  @media print {
    #site-nav,.no-print{display:none!important}
    body{background:white!important;color:black!important}
    .card{border:1px solid #ccc!important;background:white!important;opacity:1!important}
  }
`;

// ─── TEAM ROW ─────────────────────────────────────────────────────────────────
function TeamRow({ name, rank, statusMap, primary, teamRecords }) {
  const info   = teamInfo(name);
  const status = statusMap[name] || "IN";
  const sl     = STAGE_LABEL[status] || STAGE_LABEL.IN;
  const out    = isEliminated(status);
  const rec    = teamRecords ? teamRecords[name] : null;

  return (
    <div style={{
      display:"flex", alignItems:"center", gap:9,
      padding:"5px 9px", borderRadius:3,
      background: status==="WINNER"  ? "rgba(255,215,0,.1)"
                : status==="RUNNER UP"?"rgba(192,192,192,.08)"
                : primary            ? "rgba(255,215,0,.06)"
                :                      "rgba(255,255,255,.02)",
      border:`1px solid ${TIER_COLOR[info.tier]}1a`,
      opacity: out ? 0.5 : 1,
    }}>
      <span style={{ fontSize:"1.05rem" }}>{info.flag}</span>
      <span style={{
        flex:1, fontSize:".88rem",
        color: out ? "#444" : primary ? "#F5F0E8" : "#999",
        textDecoration: out ? "line-through" : "none",
      }}>{name}</span>
      {rec && (rec.w + rec.d + rec.l > 0) && (
        <span style={{ fontSize:".68rem", color:"#555", whiteSpace:"nowrap", letterSpacing:.5 }}>
          <span style={{ color: rec.w>0?"#4ade80":"#555" }}>{rec.w}W</span>
          {" "}<span style={{ color: rec.d>0?"#facc15":"#555" }}>{rec.d}D</span>
          {" "}<span style={{ color: rec.l>0?"#f87171":"#555" }}>{rec.l}L</span>
          {" "}<span style={{ color:"#444" }}>{rec.gf}-{rec.ga}</span>
        </span>
      )}
      {sl.label && (
        <span style={{ fontSize:".68rem", color:sl.color, whiteSpace:"nowrap" }}>{sl.label}</span>
      )}
      <span style={{
        fontSize:".65rem", padding:"2px 5px", borderRadius:3,
        background:TIER_COLOR[info.tier]+"22", color:TIER_COLOR[info.tier],
        border:`1px solid ${TIER_COLOR[info.tier]}44`,
      }}>#{rank||info.rank}</span>
    </div>
  );
}

// ─── LEADERBOARD TAB ─────────────────────────────────────────────────────────
function Leaderboard({ scores, gbList }) {
  const maxPts   = scores.length ? scores[0].total : 1;
  const maxGoals = gbList.length ? Math.max(...gbList.map(g=>g.goals)) : 0;
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="fade-up">
      {/* Points table */}
      <div style={{ marginBottom:32 }}>
        <p style={{ fontFamily:"'Bebas Neue',sans-serif", letterSpacing:2, color:"#FFD700", fontSize:".85rem", marginBottom:14 }}>
          📊 POINTS TABLE
        </p>
        {scores.map((s, i) => {
          const isOpen = expanded === i;
          const medal  = i===0?"🥇":i===1?"🥈":i===2?"🥉":"";
          return (
            <div key={i} style={{ marginBottom:8 }}>
              <div
                onClick={() => setExpanded(isOpen ? null : i)}
                style={{
                  display:"flex", alignItems:"center", gap:12,
                  padding:"10px 14px", borderRadius:4,
                  background: i===0 ? "rgba(255,215,0,.08)" : "rgba(255,255,255,.03)",
                  border:`1px solid ${i===0?"rgba(255,215,0,.25)":"#222"}`,
                  cursor:"pointer", transition:"background .2s",
                }}
              >
                <span style={{ fontFamily:"'Bebas Neue',sans-serif", color:"#555", fontSize:".85rem", width:20, textAlign:"right" }}>
                  {i+1}
                </span>
                <span style={{ fontSize:"1rem" }}>{medal}</span>
                <span style={{ flex:1, color: i===0?"#FFD700":"#F5F0E8", fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1 }}>
                  {s.name}
                </span>
                {/* breakdown toggle */}
                <span style={{ color:"#444", fontSize:".75rem" }}>{isOpen?"▲":"▼"}</span>
                {/* pts bar */}
                <div style={{ width:80, height:6, background:"#1a1a1a", borderRadius:3, flexShrink:0 }}>
                  <div className="pts-bar-fill" style={{ width:`${maxPts?Math.round((s.total/maxPts)*100):0}%` }}/>
                </div>
                <span style={{
                  fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1,
                  color: i===0?"#FFD700":"#F5F0E8", fontSize:"1.1rem", width:52, textAlign:"right"
                }}>{s.total} <span style={{ color:"#555", fontSize:".7rem" }}>pts</span></span>
              </div>

              {/* Breakdown */}
              {isOpen && (
                <div style={{
                  background:"rgba(0,0,0,.3)", border:"1px solid #1a1a1a",
                  borderTop:"none", borderRadius:"0 0 4px 4px",
                  padding:"12px 14px",
                }}>
                  <div style={{ display:"flex", gap:20, flexWrap:"wrap", marginBottom:10 }}>
                    {[
                      { label:"Match results", val:s.matchPts },
                      { label:"Knockout stage", val:s.knockoutPts },
                      { label:"Golden Boot",    val:s.gbPts },
                    ].map((b,bi) => (
                      <div key={bi} style={{ textAlign:"center" }}>
                        <div style={{ color:"#555", fontSize:".72rem", marginBottom:2 }}>{b.label}</div>
                        <div style={{ color:"#F5F0E8", fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.2rem" }}>{b.val}</div>
                      </div>
                    ))}
                  </div>
                  {s.breakdown.length > 0 && (
                    <div style={{ borderTop:"1px solid #1a1a1a", paddingTop:8 }}>
                      {s.breakdown.map((b,bi) => (
                        <div key={bi} style={{ color:"#555", fontSize:".78rem", lineHeight:1.8 }}>· {b}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Golden Boot scoreboard */}
      <div>
        <p style={{ fontFamily:"'Bebas Neue',sans-serif", letterSpacing:2, color:"#FFD700", fontSize:".85rem", marginBottom:14 }}>
          👟 GOLDEN BOOT RACE
        </p>
        {gbList.length === 0 && (
          <p style={{ color:"#444", fontSize:".88rem" }}>No goals recorded yet.</p>
        )}
        {gbList
          .slice()
          .sort((a,b) => b.goals - a.goals)
          .map((g, i) => {
            const pct = maxGoals ? Math.round((g.goals/maxGoals)*100) : 0;
            const isTop = g.goals === maxGoals && maxGoals > 0;
            return (
              <div key={i} style={{
                display:"flex", alignItems:"center", gap:12,
                padding:"8px 14px", marginBottom:6, borderRadius:4,
                background: isTop ? "rgba(255,215,0,.07)" : "rgba(255,255,255,.02)",
                border:`1px solid ${isTop?"rgba(255,215,0,.2)":"#1a1a1a"}`,
              }}>
                <span style={{ color:"#555", fontSize:".82rem", width:18, textAlign:"right" }}>{i+1}</span>
                <span style={{ flex:1, color: isTop?"#FFD700":"#aaa", fontSize:".92rem" }}>{g.name}</span>
                <div style={{ width:80, height:5, background:"#1a1a1a", borderRadius:3, flexShrink:0 }}>
                  <div className="pts-bar-fill" style={{ width:`${pct}%` }}/>
                </div>
                <span style={{
                  fontFamily:"'Bebas Neue',sans-serif", color: isTop?"#FFD700":"#F5F0E8",
                  fontSize:"1rem", width:40, textAlign:"right"
                }}>
                  {g.goals} <span style={{ color:"#555", fontSize:".7rem" }}>⚽</span>
                </span>
                {isTop && <span style={{ fontSize:".75rem", color:"#FFD700" }}>👟</span>}
              </div>
            );
          })
        }
      </div>
    </div>
  );
}

// ─── DRAW TAB ─────────────────────────────────────────────────────────────────
function DrawTab({ entries, statusMap, scores, teamRecords, scoresLoading }) {
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState("all");

  // Attach score to each entry for display
  const scoreMap = {};
  scores.forEach(s => { scoreMap[s.name] = s; });

  const filtered = entries.filter(e => {
    const teams   = teamsForEntry(e);
    const anyIn   = teams.some(t => isStillIn(statusMap[t.name]||"IN"));
    if (filter==="active"     && !anyIn) return false;
    if (filter==="eliminated" &&  anyIn) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return e.name.toLowerCase().includes(q) ||
      teams.some(t=>t.name.toLowerCase().includes(q)) ||
      e.gbPlayer.toLowerCase().includes(q);
  });

  return (
    <div className="fade-up">
      {scoresLoading && (
        <div style={{ textAlign:"center", marginBottom:16 }}>
          <span style={{
            display:"inline-flex", alignItems:"center", gap:8,
            background:"rgba(255,215,0,.06)", border:"1px solid rgba(255,215,0,.15)",
            borderRadius:3, padding:"6px 14px", fontSize:".8rem", color:"#888"
          }}>
            <span style={{ width:10, height:10, border:"2px solid #333", borderTopColor:"#FFD700", borderRadius:"50%", display:"inline-block", animation:"spin .8s linear infinite" }}/>
            Loading scores…
          </span>
        </div>
      )}
      <div style={{ display:"flex", gap:10, flexWrap:"wrap", justifyContent:"center", marginBottom:20 }}>
        <input type="text"
          placeholder="🔍  Search player, team or Golden Boot..."
          value={search} onChange={e=>setSearch(e.target.value)}
          style={{ width:"min(300px,100%)" }}
        />
        <div style={{ display:"flex", gap:6 }}>
          {[["all","All"],["active","Still In"],["eliminated","Eliminated"]].map(([v,l])=>(
            <button key={v} className="btn btn-ghost"
              style={{
                padding:"8px 14px", fontSize:".78rem",
                borderColor:filter===v?"#FFD700":"#333",
                color:filter===v?"#FFD700":"#555",
              }}
              onClick={()=>setFilter(v)}
            >{l}</button>
          ))}
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:12 }}>
        {filtered.map((entry, i) => {
          const teams  = teamsForEntry(entry);
          const anyIn  = teams.some(t=>isStillIn(statusMap[t.name]||"IN"));
          const sc     = scoreMap[entry.name];
          const gbOut  = isEliminated(statusMap[entry.gbTeam]||"IN");

          return (
            <div key={i} className={`card slide-in${!anyIn?" eliminated":""}`}
              style={{ animationDelay:`${i*.03}s` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <span style={{
                  fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1, fontSize:"1.1rem",
                  color: !anyIn?"#555":"#FFD700",
                }}>{entry.name}</span>
                {sc && (
                  <span style={{
                    fontFamily:"'Bebas Neue',sans-serif", fontSize:".9rem",
                    color:"#F5F0E8", background:"rgba(255,255,255,.06)",
                    border:"1px solid #333", borderRadius:3, padding:"2px 8px"
                  }}>{sc.total} pts</span>
                )}
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:5, marginBottom:8 }}>
                {teams.map((t,ti)=>(
                  <TeamRow key={ti} name={t.name} rank={t.rank}
                    statusMap={statusMap} primary={ti===0} teamRecords={teamRecords}/>
                ))}
              </div>

              <div className="gb-pill" style={{ opacity:gbOut?.4:1 }}>
                <span>👟</span>
                <span style={{
                  flex:1, color:gbOut?"#444":"#FFD700", fontSize:".85rem",
                  textDecoration:gbOut?"line-through":"none"
                }}>{entry.gbPlayer}</span>
                {sc && sc.gbGoals > 0 && (
                  <span style={{ color:"#888", fontSize:".78rem" }}>
                    {sc.gbGoals}⚽ = {sc.gbPts}pts
                  </span>
                )}
              </div>
            </div>
          );
        })}
        {!filtered.length && (
          <p style={{ color:"#444", gridColumn:"1/-1", textAlign:"center", padding:40 }}>
            No results for "{search}"
          </p>
        )}
      </div>
    </div>
  );
}

// ─── PRIZES PANEL ─────────────────────────────────────────────────────────────
function PrizesPanel({ entries, statusMap, scores, gbList }) {
  const winner    = entries.find(e=>teamsForEntry(e).some(t=>(statusMap[t.name]||"").toUpperCase()==="WINNER"));
  const runnerUp  = entries.find(e=>teamsForEntry(e).some(t=>(statusMap[t.name]||"").toUpperCase()==="RUNNER UP"));
  const maxGoals  = gbList.length ? Math.max(...gbList.map(g=>g.goals)) : 0;
  const gbWinPlayer = maxGoals > 0
    ? gbList.filter(g=>g.goals===maxGoals).map(g=>g.name)
    : [];
  const gbWinner  = entries.find(e=>gbWinPlayer.includes(e.gbPlayer));
  const ptsWinner = scores.length ? scores[0] : null;

  const prizes = [
    { label:"🏆 Tournament Winner", amount:`£${PRIZES.winner}`,      winner:winner?.name,              note:"Team wins the World Cup" },
    { label:"👟 Golden Boot",       amount:`£${PRIZES.goldenBoot}`,  winner:gbWinner ? `${gbWinner.name} (${gbWinPlayer[0]})` : null, note:`Most goals scored${maxGoals>0?` — ${maxGoals} goals`:""}` },
    { label:"📊 Points Table",      amount:`£${PRIZES.pointsTable}`, winner:ptsWinner?.name,           note:"Top of the leaderboard at full time" },
  ];

  const anyDecided = prizes.some(p=>p.winner);

  return (
    <div className="card fade-up" style={{
      borderColor:"rgba(255,215,0,.25)", marginBottom:24,
      background:"rgba(255,215,0,.03)"
    }}>
      <p style={{ fontFamily:"'Bebas Neue',sans-serif", letterSpacing:2, color:"#FFD700", fontSize:".88rem", marginBottom:14 }}>
        💰 PRIZE MONEY — £{PRIZES.winner + PRIZES.goldenBoot + PRIZES.pointsTable} POT
      </p>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:10 }}>
        {prizes.map((p,i)=>(
          <div key={i} style={{
            padding:"14px", borderRadius:4,
            background:"rgba(255,255,255,.03)", border:"1px solid #222"
          }}>
            <div style={{ color:"#888", fontSize:".78rem", marginBottom:4 }}>{p.label}</div>
            <div style={{
              color:"#FFD700", fontFamily:"'Bebas Neue',sans-serif",
              fontSize:"1.6rem", letterSpacing:1, lineHeight:1
            }}>{p.amount}</div>
            <div style={{ color:p.winner?"#F5F0E8":"#333", fontSize:".88rem", marginTop:6 }}>
              {p.winner || "TBC"}
            </div>
            <div style={{ color:"#444", fontSize:".72rem", marginTop:4 }}>{p.note}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ADMIN PANEL ──────────────────────────────────────────────────────────────
function AdminPanel() {
  if (!IS_ADMIN) return null;
  return (
    <div className="card no-print" style={{ borderColor:"#2B6CB033", marginBottom:20 }}>
      <p style={{ fontFamily:"'Bebas Neue',sans-serif", letterSpacing:2, color:"#90CDF4", fontSize:".85rem", marginBottom:10 }}>
        🔧 ADMIN — FRENCHIE ONLY
      </p>
      <div style={{ color:"#888", fontSize:".85rem", lineHeight:2 }}>
        <strong style={{ color:"#F5F0E8" }}>Status tab</strong> — Team | Status &nbsp;
        <span style={{ color:"#555" }}>Values: IN · OUT · R16 · QF · SF · THIRD · RUNNER UP · WINNER</span><br/>
        <strong style={{ color:"#F5F0E8" }}>GB tab</strong> — Name | Goals &nbsp;
        <span style={{ color:"#555" }}>Update goals after each match. Top scorer wins £{PRIZES.goldenBoot}.</span><br/>
        <strong style={{ color:"#F5F0E8" }}>Results tab</strong> — HomeTeam | HomeGoals | AwayTeam | AwayGoals &nbsp;
        <span style={{ color:"#555" }}>Leave goals blank for unplayed matches.</span><br/>
        <span style={{ color:"#444" }}>Share URL (no admin): theshedbangers.co.uk/sweepstake</span>
      </div>
    </div>
  );
}


// ─── SCORING GUIDE ────────────────────────────────────────────────────────────
function ScoringGuide() {
  const sections = [
    {
      title: "🏆 Match Results",
      subtitle: "Frenchie updates the Results tab after every game",
      rows: [
        { event: "Your team wins a match",  pts: "+3 pts", note: "Per win, all stages" },
        { event: "Your team draws a match", pts: "+1 pt",  note: "Per draw, all stages" },
        { event: "Your team loses",         pts: "0 pts",  note: "No points for a loss" },
      ]
    },
    {
      title: "⚽ Knockout Stage Bonuses",
      subtitle: "Awarded when your team reaches each round",
      rows: [
        { event: "Team reaches Round of 16", pts: "+5 pts",  note: "On qualification" },
        { event: "Team reaches Quarter Final", pts: "+10 pts", note: "Cumulative — stacks" },
        { event: "Team reaches Semi Final",  pts: "+15 pts", note: "Cumulative — stacks" },
        { event: "Team finishes 3rd",        pts: "+20 pts", note: "3rd place play-off" },
        { event: "Team is Runner Up",        pts: "+25 pts", note: "Reaches the final" },
        { event: "Team wins the World Cup",  pts: "+50 pts", note: "🏆 The big one" },
      ]
    },
    {
      title: "👟 Golden Boot",
      subtitle: "Each player is assigned a Golden Boot contender",
      rows: [
        { event: "Your player scores a goal", pts: "+5 pts",  note: "Every goal counts" },
        { event: "Your player wins the Golden Boot", pts: "+10 pts bonus", note: "Most goals at end of tournament — auto awarded" },
      ]
    },
    {
      title: "💰 Prize Money",
      subtitle: "£60 total pot",
      rows: [
        { event: "🏆 Tournament Winner",  pts: "£40", note: "Whose team lifts the trophy" },
        { event: "👟 Golden Boot",        pts: "£10", note: "Whose player scores the most" },
        { event: "📊 Points Table",       pts: "£10", note: "Top of the leaderboard at full time" },
      ]
    },
  ];

  return (
    <div className="fade-up">
      <p style={{ color:"#888", fontSize:".85rem", textAlign:"center", marginBottom:28, lineHeight:1.7 }}>
        You have 4 teams and 1 Golden Boot player.<br/>
        Points accumulate throughout the tournament — check back after every round.
      </p>

      {sections.map((section, si) => (
        <div key={si} style={{ marginBottom:28 }}>
          <div style={{ marginBottom:12 }}>
            <p style={{ fontFamily:"'Bebas Neue',sans-serif", letterSpacing:2, color:"#FFD700", fontSize:"1rem", marginBottom:2 }}>
              {section.title}
            </p>
            <p style={{ color:"#555", fontSize:".78rem" }}>{section.subtitle}</p>
          </div>
          <div style={{
            background:"rgba(255,255,255,.03)", border:"1px solid #1a1a1a",
            borderRadius:6, overflow:"hidden"
          }}>
            {section.rows.map((row, ri) => (
              <div key={ri} style={{
                display:"flex", alignItems:"center", gap:12,
                padding:"11px 16px",
                borderBottom: ri < section.rows.length-1 ? "1px solid #151515" : "none",
                background: ri % 2 === 0 ? "transparent" : "rgba(255,255,255,.015)",
              }}>
                <span style={{ flex:1, color:"#d0c8bc", fontSize:".9rem" }}>{row.event}</span>
                <span style={{
                  fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1,
                  fontSize:"1rem", color:"#FFD700",
                  minWidth:80, textAlign:"right", flexShrink:0
                }}>{row.pts}</span>
                <span style={{
                  color:"#444", fontSize:".75rem",
                  minWidth:160, textAlign:"right", flexShrink:0
                }}>{row.note}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="card" style={{ borderColor:"rgba(255,215,0,.2)", background:"rgba(255,215,0,.03)", marginTop:8 }}>
        <p style={{ fontFamily:"'Bebas Neue',sans-serif", letterSpacing:2, color:"#FFD700", fontSize:".85rem", marginBottom:10 }}>
          💡 EXAMPLE
        </p>
        <p style={{ color:"#888", fontSize:".85rem", lineHeight:1.9 }}>
          Say you have <span style={{ color:"#F5F0E8" }}>England</span> — they win 3 group games (9pts), reach the QF (5+10pts), 
          then go out. That's <span style={{ color:"#FFD700" }}>24pts</span> from England alone.<br/>
          Your Golden Boot player <span style={{ color:"#F5F0E8" }}>Harry Kane</span> scores 4 goals — 
          that's another <span style={{ color:"#FFD700" }}>20pts</span>.<br/>
          Total from just those two: <span style={{ color:"#FFD700" }}>44pts</span> — and you still have 3 more teams to go.
        </p>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
function Sweepstake() {
  const [status,    setStatus]    = useState("loading");
  const [loadError, setLoadError] = useState("");
  const [entries,   setEntries]   = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [gbList,    setGbList]    = useState([]);
  const [results,   setResults]   = useState([]);
  const [scores,    setScores]    = useState([]);
  const [activeTab,     setActiveTab]     = useState("leaderboard");
  const [scoresLoading, setScoresLoading] = useState(true);

  useEffect(()=>{
    const s = document.createElement("style");
    s.textContent = CSS;
    document.head.appendChild(s);
    return ()=>document.head.removeChild(s);
  },[]);

  useEffect(()=>{ loadAll(); },[]);

  async function fetchTab(name) {
    const res = await fetch(SHEET_URL(name));
    if (!res.ok) throw new Error(`${name} tab fetch failed (HTTP ${res.status})`);
    let text = await res.text();
    // gviz sometimes ignores tqx=out:csv for tab names with spaces and returns a JS wrapper.
    // Retry with explicit headers=1 param which forces CSV output more reliably.
    if (text.trim().startsWith("google.visualization") || text.trim().startsWith("/*")) {
      const retry = await fetch(
        `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(name)}&headers=1`
      ); // fallback
      if (retry.ok) text = await retry.text();
    }
    if (text.includes('"errors":[{') || (text.trim().startsWith("{") && text.includes('"version"'))) {
      throw new Error(`Tab "${name}" not found or not published to web`);
    }
    return text;
  }

  const delay = ms => new Promise(res => setTimeout(res, ms));

  async function safeTab(name, parser, fallback) {
    try {
      const text = await fetchTab(name);
      return parser(text);
    } catch(e) {
      console.warn(`Tab "${name}" failed:`, e.message);
      return fallback;
    }
  }

  async function fetchLocal(path, parser, fallback) {
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error(`${path} not found (${res.status})`);
      const text = await res.text();
      return parser(text);
    } catch(e) {
      console.warn(`Local fetch failed for ${path}:`, e.message);
      return fallback;
    }
  }

  async function loadAll() {
    setStatus("loading");
    try {
      // Step 1: Load FinalDraw first — required, show draw ASAP
      const drawText = await fetchTab("FinalDraw");
      const parsed   = parseFinalDraw(drawText);
      if (!parsed.length) throw new Error("No data in FinalDraw tab — check sheet is published to web");
      setEntries(parsed);
      setStatus("ready"); // Show draw immediately, scores update below

      // Step 2: Status still from Google Sheets (Frenchie updates manually)
      const stMap = await safeTab("Status", parseStatusTab, {});

      // Step 3: Results + top scorers from local CSV (updated by GitHub Actions)
      // Falls back to Google Sheets GB tab if local file not ready yet
      const [res, gb] = await Promise.all([
        fetchLocal('./data/results.csv',    parseResultsTab, []),
        fetchLocal('./data/topscorers.csv', parseTopScorers, []),
      ]);

      setStatusMap(stMap);
      setGbList(gb);
      setResults(res);
      setScores(calcPoints(parsed, stMap, res, gb));
      setScoresLoading(false);
    } catch(e) {
      setLoadError(e.message || "Couldn't load data. Check the sheet is published to web.");
      setStatus("error");
    }
  }

  const matchCount = results.length;
  const activeCount = entries.filter(e=>
    teamsForEntry(e).some(t=>isStillIn(statusMap[t.name]||"IN"))
  ).length;

  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(150deg,#0a0a14 0%,#0d1520 50%,#160a0a 100%)",
      padding:"32px 16px 64px", position:"relative", overflow:"hidden",
      fontFamily:"'Barlow',sans-serif", color:"#F5F0E8"
    }}>
      {[...Array(16)].map((_,i)=>(
        <div key={i} style={{
          position:"fixed", borderRadius:"50%", pointerEvents:"none",
          width:i%3===0?3:2, height:i%3===0?3:2,
          background:i%4===0?"#FFD700":i%4===1?"#fff":"#C0392B",
          left:`${(i*17+5)%100}%`, top:`${(i*13+8)%100}%`, opacity:.18,
          animation:`twinkle ${2+(i%3)}s ease-in-out ${i*.25}s infinite alternate`
        }}/>
      ))}

      <div style={{ maxWidth:920, margin:"0 auto", position:"relative", zIndex:1 }}>

        {/* Header */}
        <div className="fade-up" style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontSize:"2.4rem", marginBottom:4 }}>⚽</div>
          <h1 style={{
            fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(2.8rem,7vw,5rem)",
            letterSpacing:4, color:"#FFD700", textShadow:"0 0 40px #FFD70055",
            lineHeight:1, margin:"0 0 4px"
          }}>Frenchie's</h1>
          <h2 style={{
            fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(1rem,2.5vw,1.5rem)",
            letterSpacing:8, color:"#F5F0E8", fontWeight:"normal",
            margin:"0 0 10px", opacity:.85
          }}>World Cup 2026 Sweepstake</h2>
          <div style={{ width:100, height:2, background:"linear-gradient(90deg,transparent,#FFD700,transparent)", margin:"0 auto 8px" }}/>
          <p style={{ color:"#555", fontSize:".76rem", letterSpacing:3, textTransform:"uppercase" }}>
            USA · Canada · Mexico · 11 Jun – 19 Jul
          </p>
        </div>

        {status==="loading" && (
          <div style={{ textAlign:"center", padding:"60px 0" }}>
            <div style={{ width:34, height:34, border:"3px solid #222", borderTopColor:"#FFD700", borderRadius:"50%", animation:"spin .8s linear infinite", margin:"0 auto 16px" }}/>
            <p style={{ color:"#555", letterSpacing:2, fontSize:".8rem", textTransform:"uppercase" }}>Loading…</p>
          </div>
        )}

        {status==="error" && (
          <div className="card" style={{ textAlign:"center", padding:40, borderColor:"#C0392B44" }}>
            <p style={{ color:"#e74c3c", marginBottom:16 }}>⚠️ {loadError}</p>
            <button className="btn btn-ghost" onClick={loadAll}>↺ Retry</button>
          </div>
        )}

        {status==="ready" && (
          <div>
            <AdminPanel/>
            <PrizesPanel entries={entries} statusMap={statusMap} scores={scores} gbList={gbList}/>

            {/* Stats bar */}
            <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap", marginBottom:20, fontSize:".8rem", color:"#555" }}>
              <span>👥 {entries.length} players</span>
              <span>·</span>
              <span>
                ⚽ {matchCount} matches played
                {scoresLoading && <span style={{ color:"#FFD700", fontSize:".72rem", marginLeft:6 }}>⟳ updating…</span>}
              </span>
              <span>·</span>
              <span style={{ color:activeCount>0?"#90CDF4":"#555" }}>
                🟢 {activeCount} still active
              </span>
              <span>·</span>
              <span>💰 £{PRIZES.winner+PRIZES.goldenBoot+PRIZES.pointsTable} pot</span>
            </div>

            {/* Tabs */}
            <div style={{
              display:"flex", borderBottom:"1px solid #1a1a1a",
              marginBottom:24, justifyContent:"center", gap:4
            }}>
              {[["leaderboard","📊 Leaderboard"],["draw","🎰 The Draw"],["scoring","ℹ️ Scoring"]].map(([v,l])=>(
                <button key={v} className={`tab${activeTab===v?" active":""}`}
                  onClick={()=>setActiveTab(v)}>{l}
                </button>
              ))}
            </div>

            {activeTab==="leaderboard" && (
              <Leaderboard scores={scores} gbList={gbList}/>
            )}
            {activeTab==="draw" && (
              <DrawTab entries={entries} statusMap={statusMap} scores={scores}
                teamRecords={buildTeamRecords(results)} scoresLoading={scoresLoading}/>
            )}
            {activeTab==="scoring" && (
              <ScoringGuide/>
            )}

            <div className="no-print" style={{ display:"flex", gap:10, justifyContent:"center", marginTop:28 }}>
              <button className="btn btn-ghost" onClick={loadAll}>↺ Refresh</button>
              <button className="btn btn-gold"  onClick={()=>window.print()}>🖨 Print</button>
            </div>

            <p style={{ textAlign:"center", color:"#1a1a1a", fontSize:".7rem", letterSpacing:2, marginTop:28 }}>
              FRENCHIE'S SWEEPSTAKE · WORLD CUP 2026
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  React.createElement(Sweepstake)
);
