import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { LineChart, ProgressChart } from "react-native-chart-kit";

import game_record_data from "./game_records";

const screenWidth = Dimensions.get("window").width;
const CHART_GAMES_LIMIT = 5; // Limit charts to the most recent 5 games

// Define an interface for aggregated team game data
interface TeamGameStats {
  game_id: number;
  totalPoints: number;
  totalRebounds: number;
  totalAssists: number;
  totalSteals: number;
  totalBlocks: number;
  totalTurnovers: number;
  totalFouls: number;
  madeFG: number;
  attemptFG: number;
  made3PTS: number;
  attempt3PTS: number;
  madeFT: number;
  attemptFT: number;
}

export default function TeamPerformanceScreen() {
  const [teamGameStats, setTeamGameStats] = useState<TeamGameStats[]>([]);
  const [overallTeamStats, setOverallTeamStats] = useState({
    totalGames: 0,
    totalPoints: 0,
    totalRebounds: 0,
    totalAssists: 0,
    totalSteals: 0,
    totalBlocks: 0,
    totalTurnovers: 0,
    totalFouls: 0,
    totalMadeFG: 0,
    totalAttemptFG: 0,
    totalMade3PTS: 0,
    totalAttempt3PTS: 0,
    totalMadeFT: 0,
    totalAttemptFT: 0,
  });

  useEffect(() => {
    // Aggregate data by game_id
    const aggregatedGames: { [key: number]: TeamGameStats } = {};

    game_record_data.forEach((record) => {
      if (!aggregatedGames[record.game_id]) {
        aggregatedGames[record.game_id] = {
          game_id: record.game_id,
          totalPoints: 0,
          totalRebounds: 0,
          totalAssists: 0,
          totalSteals: 0,
          totalBlocks: 0,
          totalTurnovers: 0,
          totalFouls: 0,
          madeFG: 0,
          attemptFG: 0,
          made3PTS: 0,
          attempt3PTS: 0,
          madeFT: 0,
          attemptFT: 0,
        };
      }
      const game = aggregatedGames[record.game_id];
      game.totalPoints += record.points;
      game.totalRebounds += record.offRebound + record.defRebound;
      game.totalAssists += record.assists;
      game.totalSteals += record.steals;
      game.totalBlocks += record.blocks;
      game.totalTurnovers += record.turnovers;
      game.totalFouls += record.fouls;
      game.madeFG += record.madeFG;
      game.attemptFG += record.attemptFG;
      game.made3PTS += record.made3PTS;
      game.attempt3PTS += record.attempt3PTS;
      game.madeFT += record.madeFT;
      game.attemptFT += record.attemptFT;
    });

    const sortedTeamGames = Object.values(aggregatedGames).sort(
      (a, b) => b.game_id - a.game_id
    ); // Sort by most recent game
    setTeamGameStats(sortedTeamGames);

    // Calculate overall team stats
    const overallStats = sortedTeamGames.reduce(
      (acc, game) => {
        acc.totalPoints += game.totalPoints;
        acc.totalRebounds += game.totalRebounds;
        acc.totalAssists += game.totalAssists;
        acc.totalSteals += game.totalSteals;
        acc.totalBlocks += game.totalBlocks;
        acc.totalTurnovers += game.totalTurnovers;
        acc.totalFouls += game.totalFouls;
        acc.totalMadeFG += game.madeFG;
        acc.totalAttemptFG += game.attemptFG;
        acc.totalMade3PTS += game.made3PTS;
        acc.totalAttempt3PTS += game.attempt3PTS;
        acc.totalMadeFT += game.madeFT;
        acc.totalAttemptFT += game.attemptFT;
        return acc;
      },
      {
        totalGames: sortedTeamGames.length,
        totalPoints: 0,
        totalRebounds: 0,
        totalAssists: 0,
        totalSteals: 0,
        totalBlocks: 0,
        totalTurnovers: 0,
        totalFouls: 0,
        totalMadeFG: 0,
        totalAttemptFG: 0,
        totalMade3PTS: 0,
        totalAttempt3PTS: 0,
        totalMadeFT: 0,
        totalAttemptFT: 0,
      }
    );
    setOverallTeamStats(overallStats);
  }, []);

  const getTeamStatLineChartData = (statKey: keyof TeamGameStats) => {
    const recordsToChart = teamGameStats.slice(0, CHART_GAMES_LIMIT).reverse();
    return {
      labels: recordsToChart.map((r) => `G${r.game_id}`),
      datasets: [{ data: recordsToChart.map((r) => r[statKey] as number) }],
    };
  };

  const chartConfig = {
    backgroundColor: "#e26a00",
    backgroundGradientFrom: "#fefefe",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0, // Default to 0 decimal places for counting stats
    color: (opacity = 1) => `rgba(236, 29, 37, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#EC1D25",
    },
    fillShadowGradientFrom: "#EC1D25",
    fillShadowGradientTo: "#FFFFFF",
    fillShadowGradientFromOpacity: 0.5,
    fillShadowGradientToOpacity: 0.1,
  };

  const calculatePercentage = (made: number, attempt: number) => {
    return attempt > 0 ? ((made / attempt) * 100).toFixed(2) : "0.00";
  };

  const StatGridItem = ({ label, value, highlight = false }: any) => (
    <View style={styles.gridItem}>
      <Text style={styles.gridLabel}>{label}</Text>
      <Text style={[styles.gridValue, highlight && { color: "#EC1D25" }]}>
        {value}
      </Text>
    </View>
  );

  const actualGamesCharted = Math.min(teamGameStats.length, CHART_GAMES_LIMIT);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Stack.Screen options={{ headerTitle: "Team Analytics" }} />

      <Text style={styles.mainHeader}>Team Performance Dashboard</Text>

      {overallTeamStats.totalGames === 0 ? (
        <Text style={styles.noDataText}>No team records available yet.</Text>
      ) : (
        <>
          {/* 1. Aggregated Career Stats Card */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Season Totals ({overallTeamStats.totalGames} Games)
            </Text>
            <View style={styles.summaryGrid}>
              <StatGridItem
                label="Total Pts"
                value={overallTeamStats.totalPoints}
                highlight
              />
              <StatGridItem
                label="Total Reb"
                value={overallTeamStats.totalRebounds}
              />
              <StatGridItem
                label="Total Ast"
                value={overallTeamStats.totalAssists}
              />
              <StatGridItem
                label="Total Stl"
                value={overallTeamStats.totalSteals}
              />
              <StatGridItem
                label="Total Blk"
                value={overallTeamStats.totalBlocks}
              />
              <StatGridItem
                label="Turnovers"
                value={overallTeamStats.totalTurnovers}
              />
              <StatGridItem
                label="Total Fouls"
                value={overallTeamStats.totalFouls}
              />
              <StatGridItem
                label="FG Accuracy"
                value={`${calculatePercentage(
                  overallTeamStats.totalMadeFG,
                  overallTeamStats.totalAttemptFG
                )}%`}
              />
              <StatGridItem
                label="3PT Accuracy"
                value={`${calculatePercentage(
                  overallTeamStats.totalMade3PTS,
                  overallTeamStats.totalAttempt3PTS
                )}%`}
              />
              <StatGridItem
                label="FT Accuracy"
                value={`${calculatePercentage(
                  overallTeamStats.totalMadeFT,
                  overallTeamStats.totalAttemptFT
                )}%`}
              />
            </View>
          </View>

          {/* 2. Efficiency Chart */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Overall Shooting Efficiency</Text>
            <ProgressChart
              data={{
                labels: ["FG", "3PT", "FT"],
                data: [
                  overallTeamStats.totalAttemptFG > 0
                    ? overallTeamStats.totalMadeFG /
                      overallTeamStats.totalAttemptFG
                    : 0,
                  overallTeamStats.totalAttempt3PTS > 0
                    ? overallTeamStats.totalMade3PTS /
                      overallTeamStats.totalAttempt3PTS
                    : 0,
                  overallTeamStats.totalAttemptFT > 0
                    ? overallTeamStats.totalMadeFT /
                      overallTeamStats.totalAttemptFT
                    : 0,
                ],
              }}
              width={screenWidth - 60}
              height={180}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(236, 29, 37, ${opacity})`,
              }}
              hideLegend={false}
              style={styles.chartStyle}
            />
          </View>

          {/* 3. RESTORED: All Detail Charts Section */}
          {actualGamesCharted > 1 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>
                Performance Trends (Last {actualGamesCharted})
              </Text>

              <Text style={styles.chartLabelHeader}>Points Per Game</Text>
              <LineChart
                data={getTeamStatLineChartData("totalPoints")}
                width={screenWidth - 60}
                height={200}
                chartConfig={chartConfig}
                bezier
                style={styles.chartStyle}
              />

              <Text style={styles.chartLabelHeader}>Rebounds Per Game</Text>
              <LineChart
                data={getTeamStatLineChartData("totalRebounds")}
                width={screenWidth - 60}
                height={200}
                chartConfig={chartConfig}
                bezier
                style={styles.chartStyle}
              />

              <Text style={styles.chartLabelHeader}>Assists Per Game</Text>
              <LineChart
                data={getTeamStatLineChartData("totalAssists")}
                width={screenWidth - 60}
                height={200}
                chartConfig={chartConfig}
                bezier
                style={styles.chartStyle}
              />

              <Text style={styles.chartLabelHeader}>Steals Per Game</Text>
              <LineChart
                data={getTeamStatLineChartData("totalSteals")}
                width={screenWidth - 60}
                height={200}
                chartConfig={chartConfig}
                bezier
                style={styles.chartStyle}
              />

              <Text style={styles.chartLabelHeader}>Blocks Per Game</Text>
              <LineChart
                data={getTeamStatLineChartData("totalBlocks")}
                width={screenWidth - 60}
                height={200}
                chartConfig={chartConfig}
                bezier
                style={styles.chartStyle}
              />

              <Text style={styles.chartLabelHeader}>Turnovers Per Game</Text>
              <LineChart
                data={getTeamStatLineChartData("totalTurnovers")}
                width={screenWidth - 60}
                height={200}
                chartConfig={chartConfig}
                bezier
                style={styles.chartStyle}
              />

              <Text style={styles.chartLabelHeader}>Fouls Per Game</Text>
              <LineChart
                data={getTeamStatLineChartData("totalFouls")}
                width={screenWidth - 60}
                height={200}
                chartConfig={chartConfig}
                bezier
                style={styles.chartStyle}
              />
            </View>
          )}
        </>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA", padding: 16 },
  mainHeader: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1A1C1E",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#495057",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F3F5",
    paddingBottom: 8,
  },
  chartLabelHeader: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginTop: 20,
    marginBottom: 8,
    textAlign: "center",
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: {
    width: "48%",
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F1F3F5",
  },
  gridLabel: {
    fontSize: 10,
    color: "#8E8E93",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  gridValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1C1C1E",
    marginTop: 2,
  },
  chartStyle: { marginVertical: 8, borderRadius: 16, alignSelf: "center" },
  noDataText: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
    marginTop: 50,
  },
});
