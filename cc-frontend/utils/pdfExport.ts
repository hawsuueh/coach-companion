import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import { PlayerExportRow, renderGameStatsHtml } from './export/renderGameStatsHtml';
import type { Athlete } from '@/services/athleteService';

// Types for export functionality
export interface PlayerStats {
  totalFieldGoals: { made: number; attempted: number };
  twoPointFG: { made: number; attempted: number };
  threePointFG: { made: number; attempted: number };
  freeThrows: { made: number; attempted: number };
  rebounds: { offensive: number; defensive: number };
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;
}

export type PlayerQuarterStats = Record<number, PlayerStats>;

export interface GameMetadata {
  gameName: string;
  teamName: string;
  opponentName: string;
  date: string;
  seasonLabel: string;
}

export interface QuarterScores {
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  ot: number;
  total: number;
}

export interface ExportGameStatsParams {
  game: GameMetadata;
  selectedAthletes: Athlete[];
  playerStats: Record<string, PlayerQuarterStats>;
  quarterScores: QuarterScores;
}

// Helper functions for stats calculation
export const calculateTotalPoints = (stats: PlayerStats | undefined): number => {
  if (!stats) return 0;
  const twoPointPoints = (stats.twoPointFG?.made || 0) * 2;
  const threePointPoints = (stats.threePointFG?.made || 0) * 3;
  const freeThrowPoints = (stats.freeThrows?.made || 0) * 1;
  return twoPointPoints + threePointPoints + freeThrowPoints;
};

export const calculateTotalPointsForPlayer = (
  statsByQuarter: PlayerQuarterStats | undefined
): number => {
  if (!statsByQuarter) {
    return 0;
  }

  return Object.values(statsByQuarter).reduce(
    (sum, stats) => sum + calculateTotalPoints(stats),
    0
  );
};

export const aggregateNumberStat = (
  statsByQuarter: PlayerQuarterStats | undefined,
  selector: (stats: PlayerStats) => number
): number => {
  if (!statsByQuarter) {
    return 0;
  }

  return Object.values(statsByQuarter).reduce(
    (sum, stats) => sum + selector(stats),
    0
  );
};

export const aggregateShootingTotals = (
  statsByQuarter: PlayerQuarterStats | undefined,
  accessor: (stats: PlayerStats) => { made: number; attempted: number }
) => {
  let made = 0;
  let attempted = 0;

  if (statsByQuarter) {
    Object.values(statsByQuarter).forEach(stats => {
      const segment = accessor(stats);
      made += segment.made || 0;
      attempted += segment.attempted || 0;
    });
  }

  return { made, attempted };
};

export const formatPercentage = (made: number, attempted: number): string => {
  if (!attempted) {
    return '0%';
  }

  const percentage = (made / attempted) * 100;
  return `${percentage.toFixed(1)}%`;
};

/**
 * Exports game statistics as a PDF file
 * @param params - Game metadata, athletes, stats, and quarter scores
 * @returns Promise that resolves when export is complete
 */
export const exportGameStatsToPDF = async (
  params: ExportGameStatsParams
): Promise<void> => {
  const { game, selectedAthletes, playerStats, quarterScores } = params;

  // Sort athletes by jersey number
  const sortedAthletes = [...selectedAthletes].sort((a, b) => {
    const aNumber = parseInt(a.number, 10);
    const bNumber = parseInt(b.number, 10);
    if (Number.isNaN(aNumber) || Number.isNaN(bNumber)) {
      return a.name.localeCompare(b.name);
    }
    return aNumber - bNumber;
  });

  // Prepare player data for export
  const playersForExport: PlayerExportRow[] = sortedAthletes.map(athlete => {
    const statsByQuarter = playerStats[athlete.id];
    const fieldGoals = aggregateShootingTotals(
      statsByQuarter,
      stats => stats.totalFieldGoals
    );
    const twoPoint = aggregateShootingTotals(
      statsByQuarter,
      stats => stats.twoPointFG
    );
    const threePoint = aggregateShootingTotals(
      statsByQuarter,
      stats => stats.threePointFG
    );
    const freeThrows = aggregateShootingTotals(
      statsByQuarter,
      stats => stats.freeThrows
    );

    const offensiveRebounds = aggregateNumberStat(
      statsByQuarter,
      stats => stats.rebounds?.offensive || 0
    );
    const defensiveRebounds = aggregateNumberStat(
      statsByQuarter,
      stats => stats.rebounds?.defensive || 0
    );
    const assists = aggregateNumberStat(statsByQuarter, stats => stats.assists || 0);
    const steals = aggregateNumberStat(statsByQuarter, stats => stats.steals || 0);
    const blocks = aggregateNumberStat(statsByQuarter, stats => stats.blocks || 0);
    const turnovers = aggregateNumberStat(
      statsByQuarter,
      stats => stats.turnovers || 0
    );
    const fouls = aggregateNumberStat(statsByQuarter, stats => stats.fouls || 0);
    const totalPoints = calculateTotalPointsForPlayer(statsByQuarter);

    return {
      jerseyNumber: athlete.number || '-',
      name: athlete.name,
      position: athlete.position,
      fieldGoals: {
        made: fieldGoals.made,
        attempted: fieldGoals.attempted,
        percentage: formatPercentage(fieldGoals.made, fieldGoals.attempted)
      },
      twoPoint: {
        made: twoPoint.made,
        attempted: twoPoint.attempted,
        percentage: formatPercentage(twoPoint.made, twoPoint.attempted)
      },
      threePoint: {
        made: threePoint.made,
        attempted: threePoint.attempted,
        percentage: formatPercentage(threePoint.made, threePoint.attempted)
      },
      freeThrows: {
        made: freeThrows.made,
        attempted: freeThrows.attempted,
        percentage: formatPercentage(freeThrows.made, freeThrows.attempted)
      },
      rebounds: {
        offensive: offensiveRebounds,
        defensive: defensiveRebounds,
        total: offensiveRebounds + defensiveRebounds
      },
      assists,
      steals,
      blocks,
      turnovers,
      fouls,
      points: totalPoints
    };
  });

  // Calculate team totals
  const totals = playersForExport.reduce(
    (acc, player) => {
      acc.fieldGoals.made += player.fieldGoals.made;
      acc.fieldGoals.attempted += player.fieldGoals.attempted;
      acc.twoPoint.made += player.twoPoint.made;
      acc.twoPoint.attempted += player.twoPoint.attempted;
      acc.threePoint.made += player.threePoint.made;
      acc.threePoint.attempted += player.threePoint.attempted;
      acc.freeThrows.made += player.freeThrows.made;
      acc.freeThrows.attempted += player.freeThrows.attempted;
      acc.rebounds.offensive += player.rebounds.offensive;
      acc.rebounds.defensive += player.rebounds.defensive;
      acc.rebounds.total += player.rebounds.total;
      acc.assists += player.assists;
      acc.steals += player.steals;
      acc.blocks += player.blocks;
      acc.turnovers += player.turnovers;
      acc.fouls += player.fouls;
      acc.points += player.points;
      return acc;
    },
    {
      fieldGoals: { made: 0, attempted: 0, percentage: '0%' },
      twoPoint: { made: 0, attempted: 0, percentage: '0%' },
      threePoint: { made: 0, attempted: 0, percentage: '0%' },
      freeThrows: { made: 0, attempted: 0, percentage: '0%' },
      rebounds: { offensive: 0, defensive: 0, total: 0 },
      assists: 0,
      steals: 0,
      blocks: 0,
      turnovers: 0,
      fouls: 0,
      points: 0
    }
  );

  // Calculate percentages for totals
  totals.fieldGoals.percentage = formatPercentage(
    totals.fieldGoals.made,
    totals.fieldGoals.attempted
  );
  totals.twoPoint.percentage = formatPercentage(
    totals.twoPoint.made,
    totals.twoPoint.attempted
  );
  totals.threePoint.percentage = formatPercentage(
    totals.threePoint.made,
    totals.threePoint.attempted
  );
  totals.freeThrows.percentage = formatPercentage(
    totals.freeThrows.made,
    totals.freeThrows.attempted
  );

  // Generate HTML and create PDF
  const html = renderGameStatsHtml({
    metadata: {
      gameName: game.gameName,
      teamName: game.teamName,
      opponentName: game.opponentName,
      date: game.date,
      seasonLabel: game.seasonLabel
    },
    quarterSummary: quarterScores,
    players: playersForExport,
    totals
  });

  const { uri } = await Print.printToFileAsync({ html });

  // Create safe filename
  const safeTeam = game.teamName.replace(/[^a-z0-9]+/gi, '_');
  const safeOpponent = game.opponentName.replace(/[^a-z0-9]+/gi, '_');
  const timestamp = new Date().toISOString().split('T')[0];
  const fileName = `${safeTeam}_vs_${safeOpponent}_${timestamp}.pdf`;
  const destinationUri = `${FileSystem.documentDirectory}${fileName}`;

  // Delete existing file if it exists
  try {
    const existing = await FileSystem.getInfoAsync(destinationUri);
    if (existing.exists) {
      await FileSystem.deleteAsync(destinationUri, { idempotent: true });
    }
  } catch (fileErr) {
    console.warn('Unable to check existing export file:', fileErr);
  }

  // Copy PDF to destination
  await FileSystem.copyAsync({ from: uri, to: destinationUri });

  // Share the PDF
  const sharingAvailable = await Sharing.isAvailableAsync();
  if (sharingAvailable) {
    await Sharing.shareAsync(destinationUri, {
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf'
    });
  } else {
    Alert.alert(
      'PDF Saved',
      `The stat sheet was saved to the app documents folder:\n${destinationUri}`
    );
  }
};
