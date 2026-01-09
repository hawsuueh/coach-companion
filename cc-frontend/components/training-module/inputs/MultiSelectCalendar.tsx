import React, { useState, useMemo, useCallback } from 'react';
import { StyleSheet, Text, View, TextStyle } from 'react-native';
import { CalendarList, DateData } from 'react-native-calendars';

interface MultiSelectCalendarProps {
  initialDates?: string[]; // preselected dates (optional)
  horizontalView?: boolean; // horizontal scroll (optional)
  onChange?: (dates: string[]) => void; // callback when selection changes
}

const RANGE = 24;

const MultiSelectCalendar = ({
  initialDates = [],
  horizontalView = true,
  onChange
}: MultiSelectCalendarProps) => {
  const [selectedDates, setSelectedDates] = useState<string[]>(initialDates);

  // 🟣 Mark all selected dates
  const markedDates = useMemo(() => {
    const marked: Record<string, any> = {};
    selectedDates.forEach(date => {
      marked[date] = {
        selected: true,
        selectedColor: '#EC1D25',
        selectedTextColor: 'white'
      };
    });
    return marked;
  }, [selectedDates]);

  // 🟣 Toggle dates on press
  const onDayPress = useCallback(
    (day: DateData) => {
      setSelectedDates(prev => {
        const newDates = prev.includes(day.dateString)
          ? prev.filter(d => d !== day.dateString)
          : [...prev, day.dateString];

        onChange?.(newDates); // notify parent when changed
        return newDates;
      });
    },
    [onChange]
  );

  return (
    <CalendarList
      current={selectedDates[0] || new Date().toISOString().split('T')[0]}
      pastScrollRange={RANGE}
      futureScrollRange={RANGE}
      onDayPress={onDayPress}
      markedDates={markedDates}
      renderHeader={!horizontalView ? renderCustomHeader : undefined}
      calendarHeight={!horizontalView ? 390 : undefined}
      theme={!horizontalView ? theme : undefined}
      horizontal={horizontalView}
      pagingEnabled={horizontalView}
      staticHeader={horizontalView}
    />
  );
};

// 🟦 Theme
const theme = {
  stylesheet: {
    calendar: {
      header: {
        dayHeader: {
          fontWeight: '600',
          color: '#48BFE3'
        }
      }
    }
  },
  'stylesheet.day.basic': {
    today: {
      borderColor: '#48BFE3',
      borderWidth: 0.8
    },
    todayText: {
      color: '#5390D9',
      fontWeight: '800'
    }
  }
};

// 🟩 Header Renderer
function renderCustomHeader(date: any) {
  const header = date.toString('MMMM yyyy');
  const [month, year] = header.split(' ');
  const textStyle: TextStyle = {
    fontSize: 18,
    fontWeight: 'bold',
    paddingTop: 10,
    paddingBottom: 10,
    color: '#5E60CE',
    paddingRight: 5
  };

  return (
    <View style={styles.header}>
      <Text style={[styles.month, textStyle]}>{month}</Text>
      <Text style={[styles.year, textStyle]}>{year}</Text>
    </View>
  );
}

export default MultiSelectCalendar;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 10
  },
  month: {
    marginLeft: 5
  },
  year: {
    marginRight: 5
  }
});
