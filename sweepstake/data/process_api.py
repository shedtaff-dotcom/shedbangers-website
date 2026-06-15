import json, csv, sys

def write_csv(path, header, rows):
    with open(path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(header)
        writer.writerows(rows)

# Translate API names to match the sweepstake sheet names
API_NAME_MAP = {
    "Bosnia-Herzegovina": "Bosnia & Herz.",
    "Cape Verde Islands":  "Cape Verde",
    "Congo DR":            "DR Congo",
    "Korea Republic":      "South Korea",
    "Turkey":              "Turkiye",
    "United States":       "USA",
}

def norm(name):
    return API_NAME_MAP.get(name, name)

# ── Results ───────────────────────────────────────────────────────────────────
with open('/tmp/matches.json') as f:
    data = json.load(f)

rows = []
for match in data.get('matches', []):
    if match.get('status') != 'FINISHED':
        continue
    home       = norm(match.get('homeTeam', {}).get('name', ''))
    away       = norm(match.get('awayTeam', {}).get('name', ''))
    score      = match.get('score', {}).get('fullTime', {})
    home_goals = score.get('home')
    away_goals = score.get('away')
    if home and away and home_goals is not None and away_goals is not None:
        rows.append([home, int(home_goals), int(away_goals), away])

rows.sort(key=lambda r: r[0])
write_csv('sweepstake/data/results.csv',
          ['HomeTeam', 'HomeGoals', 'AwayGoals', 'AwayTeam'], rows)
print(f"Results: {len(rows)} matches written")

# ── Top Scorers ───────────────────────────────────────────────────────────────
with open('/tmp/scorers.json') as f:
    data = json.load(f)

scorers = []
for entry in data.get('scorers', []):
    name  = entry.get('player', {}).get('name', '')
    team  = norm(entry.get('team',   {}).get('name', ''))
    goals = entry.get('goals', 0) or 0
    if name:
        scorers.append([name, goals, team])

scorers.sort(key=lambda r: -r[1])
write_csv('sweepstake/data/topscorers.csv',
          ['Player', 'Goals', 'Team'], scorers)
print(f"Scorers: {len(scorers)} players written")

# ── Teams ─────────────────────────────────────────────────────────────────────
with open('/tmp/teams.json') as f:
    data = json.load(f)

teams = []
for t in data.get('teams', []):
    name  = t.get('name', '')
    short = t.get('shortName', '')
    tla   = t.get('tla', '')
    if name:
        teams.append([name, short, tla])

teams.sort(key=lambda r: r[0])
write_csv('sweepstake/data/teams.csv',
          ['Name', 'ShortName', 'TLA'], teams)
print(f"Teams: {len(teams)} teams written")
