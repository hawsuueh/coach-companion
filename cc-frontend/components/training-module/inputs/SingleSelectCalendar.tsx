import React, { useState, useMemo, useCallback } from 'react';
import { StyleSheet, Text, View, TextStyle } from 'react-native';
import { CalendarList, DateData } from 'react-native-calendars';

interface SingleSelectCalendarProps {
  initialDate?: string; // preselected date (optional)
  horizontalView?: boolean; // horizontal scroll (optional)
  onChange?: (date: string | null) => void; // callback when selection changes
}

const RANGE = 24;

const SingleSelectCalendar = ({
  initialDate,
  horizontalView = true,
  onChange
}: SingleSelectCalendarProps) => {
  // Only one selected date
  const [selectedDate, setSelectedDate] = useState<string | null>(
    initialDate || null
  );

  // 🟣 Mark only the selected date
  const markedDates = useMemo(() => {
    if (!selectedDate) return {};
    return {
      [selectedDate]: {
        selected: true,
        selectedColor: '#EC1D25',
        selectedTextColor: 'white'
      }
    };
  }, [selectedDate]);

  // 🟣 When user presses a date, select or unselect it
  const onDayPress = useCallback(
    (day: DateData) => {
      setSelectedDate(prev => {
        const newDate = prev === day.dateString ? null : day.dateString;
        onChange?.(newDate);
        return newDate;
      });
    },
    [onChange]
  );

  return (
    <CalendarList
      current={selectedDate || new Date().toISOString().split('T')[0]}
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

export default SingleSelectCalendar;

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
