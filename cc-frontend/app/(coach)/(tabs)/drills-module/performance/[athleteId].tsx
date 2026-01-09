import Feather from '@expo/vector-icons/Feather';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { LineChart, ProgressChart } from 'react-native-chart-kit';
// debugging algorithm
// end of debug imports

// debug assignedregimen

import athlete_list from './athlete_list';
import game_record_data from './game_records';

import { Athlete, GameRecord } from './interfaces';
import { analyzePlayerPerformance } from './utils/performanceUtils';

const screenWidth = Dimensions.get('window').width;
const CHART_GAMES_LIMIT = 5; // Game limit on charts

export default function AthleteDetailScreen() {
  const { athleteId } = useLocalSearchParams();
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [athleteGameRecords, setAthleteGameRecords] = useState<GameRecord[]>(
    []
  );
  // State to hold the currently selected game for detailed view
  const [selectedGame, setSelectedGame] = useState<GameRecord | null>(null);
  // state for modal visibility of specific game selection
  const [isGameSelectionModalVisible, setIsGameSelectionModalVisible] =
    useState(false);

  // State to hold the attention score results
  const [attentionPriorities, setAttentionPriorities] = useState<
    { stat: string; score: number }[]
  >([]);
  const [excellenceAreas, setExcellenceAreas] = useState<
    { stat: string; score: number }[]
  >([]);

  // holding drill ID for forest algo - DEBUGGING
  const STAT_LABELS: { [key: string]: string } = {
    FG_PCT: 'FG% Efficiency',
    _2PTS_PCT: '2PT% Efficiency',
    _3PTS_PCT: '3PT% Efficiency',
    FT_PCT: 'FT% Efficiency',
    REB: 'Rebounding (Total)',
    assists: 'Assists',
    steals: 'Steals (Defense)',
    blocks: 'Blocks (Defense)',
    turnovers: 'Turnovers',
    points: 'Scoring (Points)'
  };

  // Reverse STAT_LABELS to map display labels back to internal stat keys
  const reverseLabels = Object.fromEntries(
    Object.entries(STAT_LABELS).map(([key, label]) => [label, key])
  );

  const attentionScores: { [key: string]: number } = {};
  attentionPriorities.forEach(item => {
    const statKey = reverseLabels[item.stat];
    if (statKey) {
      attentionScores[statKey] = Math.abs(item.score);
    }
  });

  useEffect(() => {
    if (athleteId) {
      const id = parseInt(athleteId as string);
      const foundAthlete = athlete_list.find(a => a.athlete_no === id);
      setAthlete(foundAthlete || null);

      const records = game_record_data.filter(
        record => record.player_id === id
      );
      // Sort by most recent game (descending game_id)
      const sortedRecords = records.sort((a, b) => b.game_id - a.game_id);
      setAthleteGameRecords(sortedRecords);

      // Calculate Attention Scores (Uses all data, as the function handles the limit and filtering)
      const { attentionAreas, excellenceAreas } = analyzePlayerPerformance(
        id,
        game_record_data, // Pass all data for league average calculation
        CHART_GAMES_LIMIT // The N games to analyze
      );
      setAttentionPriorities(attentionAreas);
      setExcellenceAreas(excellenceAreas);

      // Set the most recent game as the default selected game
      if (sortedRecords.length > 0) {
        setSelectedGame(sortedRecords[0]);
      } else {
        setSelectedGame(null);
      }
    }
  }, [athleteId]);

  // Helper to get chart data for a specific stat
  const getStatLineChartData = (statKey: keyof GameRecord, title: string) => {
    const recordsToChart = athleteGameRecords
      .slice(0, CHART_GAMES_LIMIT)
      .reverse();

    // Generate labels: "Game 1", "Game 2", etc. based on their order in the array
    const labels = recordsToChart.map((_, index) => `Game ${index + 1}`);
    const data = recordsToChart.map(record => record[statKey] as number);

    // Calculate the max for this specific dataset
    const maxVal = getMaxWithBuffer(data);

    return {
      labels: labels,
      datasets: [
        {
          data: data,
          color: (opacity = 1) => `rgba(236, 29, 37, ${opacity})`,
          strokeWidth: 2
        }
      ],
      title: title,
      chartMax: maxVal
    };
  };

  const StatGridItem = ({
    label,
    value,
    highlight = false,
    isNegative = false
  }: any) => (
    <View style={styles.gridItem}>
      <Text style={styles.gridLabel}>{label}</Text>
      <Text
        style={[
          styles.gridValue,
          highlight && { color: '#EC1D25' },
          isNegative && value > 3 && { color: '#f39c12' }
        ]}
      >
        {value}
      </Text>
    </View>
  );

  const getTotalReboundsPerGameData = () => {
    const recordsToChart = athleteGameRecords
      .slice(0, CHART_GAMES_LIMIT)
      .reverse();

    const labels = recordsToChart.map((_, index) => `Game ${index + 1}`);
    const data = recordsToChart.map(
      record => record.offRebound + record.defRebound
    );
    const maxVal = getMaxWithBuffer(data);

    return {
      labels: labels,
      datasets: [
        {
          data: data,
          color: (opacity = 1) => `rgba(236, 29, 37, ${opacity})`,
          strokeWidth: 2
        }
      ],
      title: 'Total Rebounds',
      chartMax: maxVal
    };
  };

  const getShootingPercentagesData = () => {
    if (athleteGameRecords.length === 0) {
      return {
        labels: ['FG%', '3PT%', 'FT%'],
        data: [0, 0, 0]
      };
    }

    const totalMadeFG = athleteGameRecords.reduce(
      (sum, r) => sum + r.madeFG,
      0
    );
    const totalAttemptFG = athleteGameRecords.reduce(
      (sum, r) => sum + r.attemptFG,
      0
    );
    const totalMade3PTS = athleteGameRecords.reduce(
      (sum, r) => sum + r.made3PTS,
      0
    );
    const totalAttempt3PTS = athleteGameRecords.reduce(
      (sum, r) => sum + r.attempt3PTS,
      0
    );
    const totalMadeFT = athleteGameRecords.reduce(
      (sum, r) => sum + r.madeFT,
      0
    );
    const totalAttemptFT = athleteGameRecords.reduce(
      (sum, r) => sum + r.attemptFT,
      0
    );

    const fgPercent = totalAttemptFG > 0 ? totalMadeFG / totalAttemptFG : 0;
    const threePtPercent =
      totalAttempt3PTS > 0 ? totalMade3PTS / totalAttempt3PTS : 0;
    const ftPercent = totalAttemptFT > 0 ? totalMadeFT / totalAttemptFT : 0;

    return {
      labels: ['FG%', '3PT%', 'FT%'],
      data: [fgPercent, threePtPercent, ftPercent]
    };
  };

  const chartConfig = {
    backgroundColor: '#e26a00',
    backgroundGradientFrom: '#fefefe',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0, // Default to 0 decimal places for counting stats
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#EC1D25'
    },
    fillShadowGradientFrom: '#EC1D25',
    fillShadowGradientTo: '#FFFFFF',
    fillShadowGradientFromOpacity: 0.5,
    fillShadowGradientToOpacity: 0.1
  };
  if (!athlete) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>Athlete not found.</Text>
      </View>
    );
  }

  // Calculate aggregated stats for the athletes
  const totalGamesPlayed = athleteGameRecords.length;
  const totalPoints = athleteGameRecords.reduce(
    (sum, record) => sum + record.points,
    0
  );
  const totalRebounds = athleteGameRecords.reduce(
    (sum, record) => sum + record.offRebound + record.defRebound,
    0
  );
  const totalAssists = athleteGameRecords.reduce(
    (sum, record) => sum + record.assists,
    0
  );
  const totalSteals = athleteGameRecords.reduce(
    (sum, record) => sum + record.steals,
    0
  );
  const totalBlocks = athleteGameRecords.reduce(
    (sum, record) => sum + record.blocks,
    0
  );
  const totalTurnovers = athleteGameRecords.reduce(
    (sum, record) => sum + record.turnovers,
    0
  );
  const totalFouls = athleteGameRecords.reduce(
    (sum, record) => sum + record.fouls,
    0
  );

  const calculatePercentage = (made: number, attempt: number) => {
    return attempt > 0 ? ((made / attempt) * 100).toFixed(2) : '0.0';
  };

  const totalMadeFG = athleteGameRecords.reduce((sum, r) => sum + r.madeFG, 0);
  const totalAttemptFG = athleteGameRecords.reduce(
    (sum, r) => sum + r.attemptFG,
    0
  );
  const totalMade3PTS = athleteGameRecords.reduce(
    (sum, r) => sum + r.made3PTS,
    0
  );
  const totalAttempt3PTS = athleteGameRecords.reduce(
    (sum, r) => sum + r.attempt3PTS,
    0
  );
  const totalMadeFT = athleteGameRecords.reduce((sum, r) => sum + r.madeFT, 0);
  const totalAttemptFT = athleteGameRecords.reduce(
    (sum, r) => sum + r.attemptFT,
    0
  );

  // Determine the actual number of games being charted (limit is 5 but can be less if not enough data)
  const actualGamesCharted = Math.min(
    athleteGameRecords.length,
    CHART_GAMES_LIMIT
  );

  // adds headroom (more y-axis) to linechart
  const getMaxWithBuffer = (dataArray: number[]) => {
    const max = Math.max(...dataArray, 1);
    return Math.ceil(max * 1.2);
  };

  // Render function for each game item in the FlatList
  return (
    <ScrollView style={styles.container}>
      <Stack.Screen />

      <View style={styles.headerCard}>
        <View style={styles.avatarContainer}>
          <Feather name="user" size={40} color="#fff" />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.playerName}>
            {athlete.first_name} {athlete.second_name}
          </Text>
          <Text style={styles.playerSub}>
            #{athlete.player_no} • {athlete.position || 'Athlete'}
          </Text>
        </View>
      </View>

      {totalGamesPlayed === 0 ? (
        <Text style={styles.noDataText}>
          No game records available for this athlete.
        </Text>
      ) : (
        <>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Career Totals ({totalGamesPlayed} Games)
            </Text>
            <View style={styles.summaryGrid}>
              <StatGridItem label="Points" value={totalPoints} highlight />
              <StatGridItem label="Assists" value={totalAssists} />
              <StatGridItem label="Rebounds" value={totalRebounds} />
              <StatGridItem label="Steals" value={totalSteals} />
              <StatGridItem label="Blocks" value={totalBlocks} />
              <StatGridItem label="Turnovers" value={totalTurnovers} />
              <StatGridItem label="Fouls" value={totalFouls} />
              <StatGridItem
                label="FG %"
                value={`${calculatePercentage(totalMadeFG, totalAttemptFG)}%`}
              />
              <StatGridItem
                label="3PT %"
                value={`${calculatePercentage(
                  totalMade3PTS,
                  totalAttempt3PTS
                )}%`}
              />
              <StatGridItem
                label="FT %"
                value={`${calculatePercentage(totalMadeFT, totalAttemptFT)}%`}
              />
            </View>
          </View>

          {/*  Stats for Specific Game Section */}
          <View style={styles.card}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Game Performance</Text>
              <View style={styles.gameBadge}>
                <Text style={styles.gameBadgeText}>All Games</Text>
              </View>
            </View>

            <Text style={styles.subLabel}>
              Tap a game to see detailed breakdown:
            </Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={athleteGameRecords}
              keyExtractor={item => item.game_id.toString()}
              contentContainerStyle={styles.horizontalScrollPadding}
              renderItem={({ item }) => {
                const isSelected = selectedGame?.game_id === item.game_id;
                return (
                  <TouchableOpacity
                    style={[
                      styles.gameChip,
                      isSelected && styles.gameChipSelected
                    ]}
                    onPress={() => setSelectedGame(item)}
                  >
                    <Text
                      style={[
                        styles.gameChipText,
                        isSelected && styles.gameChipTextSelected
                      ]}
                    >
                      G{item.game_id}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />

            {selectedGame && (
              <View style={styles.specificGameContent}>
                <View style={styles.gameMetaRow}>
                  <Text style={styles.metaLabel}>DETAILED BREAKDOWN</Text>
                  <Text style={styles.metaValue}>
                    ID: #{selectedGame.game_id}
                  </Text>
                </View>
                <View style={styles.summaryGrid}>
                  <StatGridItem
                    label="PTS"
                    value={selectedGame.points}
                    highlight
                  />
                  <StatGridItem label="AST" value={selectedGame.assists} />
                  <StatGridItem
                    label="REB"
                    value={selectedGame.offRebound + selectedGame.defRebound}
                  />
                  <StatGridItem label="STL" value={selectedGame.steals} />
                  <StatGridItem label="BLK" value={selectedGame.blocks} />
                  <StatGridItem
                    label="TO"
                    value={selectedGame.turnovers}
                    isNegative
                  />
                  <StatGridItem
                    label="PF"
                    value={selectedGame.fouls}
                    isNegative
                  />
                </View>
                <View style={styles.shootingRow}>
                  <View style={styles.shootingCol}>
                    <Text style={styles.shootingLabel}>FG%</Text>
                    <Text style={styles.shootingVal}>
                      {calculatePercentage(
                        selectedGame.madeFG,
                        selectedGame.attemptFG
                      )}
                      %
                    </Text>
                  </View>
                  <View style={styles.shootingCol}>
                    <Text style={styles.shootingLabel}>3P%</Text>
                    <Text style={styles.shootingVal}>
                      {calculatePercentage(
                        selectedGame.made3PTS,
                        selectedGame.attempt3PTS
                      )}
                      %
                    </Text>
                  </View>
                  <View style={styles.shootingCol}>
                    <Text style={styles.shootingLabel}>FT%</Text>
                    <Text style={styles.shootingVal}>
                      {calculatePercentage(
                        selectedGame.madeFT,
                        selectedGame.attemptFT
                      )}
                      %
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Individual Stat Line Charts */}
          {actualGamesCharted > 1 && (
            <>
              {[
                { key: 'points', label: 'Points', customFunc: null },
                {
                  key: 'rebounds',
                  label: 'Total Rebounds',
                  customFunc: getTotalReboundsPerGameData
                },
                { key: 'assists', label: 'Assists', customFunc: null },
                { key: 'steals', label: 'Steals', customFunc: null },
                { key: 'blocks', label: 'Blocks', customFunc: null },
                { key: 'turnovers', label: 'Turnovers', customFunc: null },
                { key: 'fouls', label: 'Fouls', customFunc: null }
              ].map(stat => {
                const chartData = stat.customFunc
                  ? stat.customFunc()
                  : getStatLineChartData(
                      stat.key as keyof GameRecord,
                      stat.label
                    );

                return (
                  <View key={stat.key} style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>
                      {stat.label} Per Game (Last {actualGamesCharted})
                    </Text>
                    <LineChart
                      data={chartData}
                      width={screenWidth - 30}
                      height={220}
                      chartConfig={chartConfig}
                      bezier
                      fromZero={true}
                      fromNumber={chartData.chartMax}
                      segments={5}
                      style={styles.chartStyle}
                    />
                  </View>
                );
              })}
            </>
          )}

          {/* Shooting Percentages Progress Chart */}
          {athleteGameRecords.length > 0 && (
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Overall Shooting Efficiency</Text>
              <ProgressChart
                data={getShootingPercentagesData()}
                width={screenWidth - 30}
                height={220}
                chartConfig={{
                  ...chartConfig,
                  decimalPlaces: 2, // Override decimal places for percentages
                  color: (opacity = 1) => `rgba(236, 29, 37, ${opacity})`
                }}
                hideLegend={false}
                style={styles.chartStyle}
              />
            </View>
          )}

          {/* Excelling at... */}
          <View style={[styles.statsCard, styles.excellenceCard]}>
            <Text style={[styles.sectionTitle, { color: '#387B45' }]}>
              Current Strengths
            </Text>
            <Text style={[styles.sectionText]}>
              This was generated from the last {actualGamesCharted} games.
            </Text>
            {excellenceAreas.length > 0 ? (
              excellenceAreas.map((item, index) => (
                <View key={index} style={styles.priorityItem}>
                  <Text style={styles.priorityText}>
                    {index + 1}.{' '}
                    <Text style={styles.excellenceCardText}>{item.stat}</Text>
                  </Text>
                  <Text style={{ color: '#387B45', fontWeight: 'bold' }}>
                    +{item.score.toFixed(2)} *
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>
                No stand-out strengths found in this period (performing close to
                the average). Check again after a few games!
              </Text>
            )}
            <Text>
              *Based on standardized comparison to team averages (z-score) over
              last {actualGamesCharted} games
            </Text>
          </View>

          {/* Priority List / Needs Attention */}
          <View style={[styles.statsCard, styles.attentionCard]}>
            <Text style={[styles.sectionTitle, { color: '#EC1D25' }]}>
              Needs Attention
            </Text>
            <Text style={[styles.sectionText]}>
              This was generated from the last {actualGamesCharted} games.
            </Text>
            {attentionPriorities.length > 0 ? (
              attentionPriorities.map((item, index) => (
                <View key={index} style={styles.priorityItem}>
                  <Text style={styles.priorityText}>
                    {index + 1}.{' '}
                    <Text style={styles.priorityStat}>{item.stat}</Text>
                  </Text>
                  <Text>{item.score.toFixed(2)} *</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>
                No significant areas needing attention found (performing at or
                above the average). 🎉
              </Text>
            )}
            <Text>
              *Based on standardized comparison to team averages (z-score) over
              last {actualGamesCharted} games
            </Text>
          </View>
        </>
      )}
      {/* 
      <Pressable>My Assigned Regimens</Pressable>
      <AthleteTrainingRegimens athleteId={parseInt(athleteId as string)} />
      */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 2
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EC1D25',
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerInfo: { marginLeft: 16 },
  playerName: { fontSize: 22, fontWeight: '800', color: '#1A1C1E' },
  playerSub: { fontSize: 14, color: '#6C757D' },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1C1E',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
    paddingBottom: 8
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  gridItem: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F3F5'
  },
  gridLabel: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  gridValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1C1E',
    marginTop: 2
  },
  gameChip: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 8
  },
  gameChipSelected: { backgroundColor: '#EC1D25', borderColor: '#EC1D25' },
  gameChipText: { color: '#3A3A3C', fontWeight: '700' },
  gameChipTextSelected: { color: '#fff' },
  specificGameContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F3F5'
  },
  gameMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  metaLabel: { fontSize: 10, fontWeight: '900', color: '#8E8E93' },
  metaValue: { fontSize: 12, color: '#AEAEB2' },
  shootingRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 12
  },
  shootingCol: { alignItems: 'center' },
  shootingLabel: { fontSize: 10, color: '#8E8E93', fontWeight: 'bold' },
  shootingVal: { fontSize: 15, fontWeight: '700', color: '#1C1C1E' },
  analysisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5'
  },
  analysisText: { fontSize: 15, color: '#3A3A3C' },
  excellenceScore: { color: '#387B45', fontWeight: 'bold' },
  attentionScore: { color: '#EC1D25', fontWeight: 'bold' },
  disclaimerText: { fontSize: 13, color: '#8E8E93', marginBottom: 10 },
  footerNote: {
    fontSize: 11,
    color: '#AEAEB2',
    marginTop: 10,
    fontStyle: 'italic'
  },
  excellenceCard: {
    borderColor: '#387B45',
    borderWidth: 1,
    backgroundColor: '#F7FCF8'
  },
  attentionCard: {
    borderColor: '#EC1D25',
    borderWidth: 1,
    backgroundColor: '#FFF9F9'
  },
  priorityStat: { color: '#EC1D25', fontWeight: 'bold' },
  debugBox: { padding: 16, backgroundColor: '#2C2C2E', borderRadius: 12 },
  debugTitle: {
    color: '#E5E5EA',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4
  },
  debugText: { color: '#636366', fontSize: 12 },
  horizontalScrollPadding: { paddingBottom: 10 },
  subLabel: { fontSize: 13, color: '#8E8E93', marginBottom: 10 },

  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  playerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ccc'
  },
  sectionText: {
    fontSize: 16
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
    flex: 2
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'right'
  },
  noDataText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 50
  },
  chartContainer: {
    marginBottom: 20,
    alignItems: 'center'
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center'
  },
  chartStyle: {
    marginVertical: 8,
    borderRadius: 16
  },

  subTitle: {
    fontSize: 16,
    marginBottom: 5,
    color: '#777'
  },
  selectGameButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center'
  },
  selectGameButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600'
  },
  specificGameStats: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee'
  },
  gameDetailHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333'
  },

  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
    maxHeight: '70%'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15
  },
  modalList: {
    width: '100%',
    marginBottom: 15
  },
  gameItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    width: '100%'
  },
  gameItemText: {
    fontSize: 16,
    color: '#333'
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    minWidth: 100
  },
  buttonClose: {
    backgroundColor: '#EC1D25'
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  excellenceCardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#387B45'
  },
  priorityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  priorityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  gameBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  gameBadgeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600'
  },
  specificGameStatsGrid: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee'
  },
  gameMetaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15
  },
  gameDateText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#888',
    textTransform: 'uppercase'
  },
  gameIdText: {
    fontSize: 14,
    color: '#888'
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  statBox: {
    width: '30%',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10
  },
  statBoxLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: 'bold',
    marginBottom: 4
  },
  statBoxValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  shootingStat: {
    alignItems: 'center'
  },
  shootingValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444'
  }
});
