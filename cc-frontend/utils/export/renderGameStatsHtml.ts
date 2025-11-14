const styles = `
  * { box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 24px; color: #111827; }
  h1 { font-size: 22px; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.08em; }
  h2 { font-size: 16px; margin: 0; color: #6b7280; text-transform: uppercase; }
  .header-meta { display: flex; justify-content: space-between; margin-top: 12px; font-size: 12px; color: #4b5563; }
  .quarter-summary { display: flex; gap: 12px; margin: 24px 0 16px 0; }
  .quarter-cell { flex: 1; border: 1px solid #d1d5db; border-radius: 6px; padding: 8px 12px; text-align: center; background-color: #f9fafb; }
  .quarter-label { display: block; font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
  .quarter-value { display: block; margin-top: 4px; font-size: 18px; font-weight: 700; color: #111827; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  thead { background-color: #f3f4f6; }
  th { text-transform: uppercase; letter-spacing: 0.06em; color: #374151; font-size: 10px; padding: 8px 4px; border: 1px solid #d1d5db; }
  td { border: 1px solid #e5e7eb; padding: 6px 4px; text-align: center; }
  .player-row.even { background-color: #f9fafb; }
  .col-no { width: 40px; font-weight: 700; }
  .col-name { text-align: left; padding-left: 8px; font-weight: 600; }
  .col-pos { width: 55px; }
  .col-shooting { width: 90px; line-height: 1.4; }
  .col-stat { width: 50px; }
  .col-points { width: 55px; font-size: 12px; font-weight: 700; }
  .percent { display: inline-block; margin-top: 2px; font-size: 10px; color: #6b7280; }
  .totals-row { background-color: #ef4444; color: #ffffff; font-weight: 700; }
  .totals-row .percent { color: #fde68a; }
  .footer-note { margin-top: 18px; font-size: 10px; color: #6b7280; text-align: right; }
`;

interface GameExportMetadata {
  gameName: string;
  teamName: string;
  opponentName?: string;
  date?: string;
  seasonLabel?: string;
}

interface QuarterSummary {
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  ot: number;
  total: number;
}

export interface PlayerExportRow {
  jerseyNumber: string;
  name: string;
  position: string;
  fieldGoals: { made: number; attempted: number; percentage: string };
  twoPoint: { made: number; attempted: number; percentage: string };
  threePoint: { made: number; attempted: number; percentage: string };
  freeThrows: { made: number; attempted: number; percentage: string };
  rebounds: { offensive: number; defensive: number; total: number };
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;
  points: number;
}

interface TeamTotalsRow {
  fieldGoals: { made: number; attempted: number; percentage: string };
  twoPoint: { made: number; attempted: number; percentage: string };
  threePoint: { made: number; attempted: number; percentage: string };
  freeThrows: { made: number; attempted: number; percentage: string };
  rebounds: { offensive: number; defensive: number; total: number };
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;
  points: number;
}

interface GameStatsHtmlPayload {
  metadata: GameExportMetadata;
  quarterSummary: QuarterSummary;
  players: PlayerExportRow[];
  totals: TeamTotalsRow;
}

const renderQuarterCell = (label: string, value: number) => `
  <div class="quarter-cell">
    <span class="quarter-label">${label}</span>
    <span class="quarter-value">${value}</span>
  </div>
`;

const renderMadeAttempt = (segment: {
  made: number;
  attempted: number;
  percentage: string;
}) => `${segment.made}/${segment.attempted}<br /><span class="percent">${segment.percentage}</span>`;

const renderPlayerRow = (player: PlayerExportRow, index: number) => `
  <tr class="player-row ${index % 2 === 0 ? 'even' : 'odd'}">
    <td class="col-no">${player.jerseyNumber}</td>
    <td class="col-name">${player.name}</td>
    <td class="col-pos">${player.position}</td>
    <td class="col-shooting">${renderMadeAttempt(player.fieldGoals)}</td>
    <td class="col-shooting">${renderMadeAttempt(player.twoPoint)}</td>
    <td class="col-shooting">${renderMadeAttempt(player.threePoint)}</td>
    <td class="col-shooting">${renderMadeAttempt(player.freeThrows)}</td>
    <td class="col-stat">${player.rebounds.offensive}</td>
    <td class="col-stat">${player.rebounds.defensive}</td>
    <td class="col-stat">${player.rebounds.total}</td>
    <td class="col-stat">${player.assists}</td>
    <td class="col-stat">${player.steals}</td>
    <td class="col-stat">${player.blocks}</td>
    <td class="col-stat">${player.turnovers}</td>
    <td class="col-stat">${player.fouls}</td>
    <td class="col-points">${player.points}</td>
  </tr>
`;

const renderTotalsRow = (totals: TeamTotalsRow) => `
  <tr class="totals-row">
    <td class="col-no" colspan="3">TOTALS</td>
    <td class="col-shooting">${renderMadeAttempt(totals.fieldGoals)}</td>
    <td class="col-shooting">${renderMadeAttempt(totals.twoPoint)}</td>
    <td class="col-shooting">${renderMadeAttempt(totals.threePoint)}</td>
    <td class="col-shooting">${renderMadeAttempt(totals.freeThrows)}</td>
    <td class="col-stat">${totals.rebounds.offensive}</td>
    <td class="col-stat">${totals.rebounds.defensive}</td>
    <td class="col-stat">${totals.rebounds.total}</td>
    <td class="col-stat">${totals.assists}</td>
    <td class="col-stat">${totals.steals}</td>
    <td class="col-stat">${totals.blocks}</td>
    <td class="col-stat">${totals.turnovers}</td>
    <td class="col-stat">${totals.fouls}</td>
    <td class="col-points">${totals.points}</td>
  </tr>
`;

export const renderGameStatsHtml = ({
  metadata,
  quarterSummary,
  players,
  totals
}: GameStatsHtmlPayload) => {
  const playerRows = players.map(renderPlayerRow).join('');

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>${styles}</style>
  </head>
  <body>
    <h1>${metadata.teamName} Game Report</h1>
    <h2>${metadata.gameName}</h2>
    <div class="header-meta">
      <div>${metadata.date || ''}</div>
      <div>Opponent: ${metadata.opponentName || 'TBD'}</div>
      <div>${metadata.seasonLabel || ''}</div>
    </div>

    <div class="quarter-summary">
      ${renderQuarterCell('Q1', quarterSummary.q1)}
      ${renderQuarterCell('Q2', quarterSummary.q2)}
      ${renderQuarterCell('Q3', quarterSummary.q3)}
      ${renderQuarterCell('Q4', quarterSummary.q4)}
      ${renderQuarterCell('OT', quarterSummary.ot)}
      ${renderQuarterCell('TOTAL', quarterSummary.total)}
    </div>

    <table>
      <thead>
        <tr>
          <th>No.</th>
          <th>Name</th>
          <th>Pos</th>
          <th>Total FG</th>
          <th>2 Pt FG</th>
          <th>3 Pt FG</th>
          <th>FT</th>
          <th>O-REB</th>
          <th>D-REB</th>
          <th>REB</th>
          <th>AST</th>
          <th>STL</th>
          <th>BLK</th>
          <th>TO</th>
          <th>Fouls</th>
          <th>PTS</th>
        </tr>
      </thead>
      <tbody>
        ${playerRows}
        ${renderTotalsRow(totals)}
      </tbody>
    </table>

    <div class="footer-note">
      Generated by Coach Companion
    </div>
  </body>
</html>`;
};

