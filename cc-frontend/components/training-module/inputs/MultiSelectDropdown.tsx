import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MultiSelect } from 'react-native-element-dropdown';
import Ionicons from '@expo/vector-icons/Ionicons';

type MultiSelectDropdownProps = {
  data: { label: string; value: string }[];
  value: string[]; // selected IDs
  onChange: (values: string[]) => void;
  placeholder?: string;
  containerClassName?: string;
};

const MultiSelectDropdown = ({
  data,
  value,
  onChange,
  placeholder = 'Select item',
  containerClassName = ''
}: MultiSelectDropdownProps) => {
  return (
    <View className={`w-full ${containerClassName}`}>
      <MultiSelect
        style={styles.dropdown}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        search
        data={data}
        labelField="label"
        valueField="value"
        placeholder={placeholder}
        searchPlaceholder="Search..."
        value={value}
        onChange={onChange}
        renderRightIcon={() => (
          <Ionicons
            style={styles.icon}
            color="black"
            name="people-sharp"
            size={24}
          />
        )}
        selectedStyle={styles.selectedStyle}
      />
    </View>
  );
};

export default MultiSelectDropdown;

const styles = StyleSheet.create({
  container: { paddingVertical: 8 },
  dropdown: {
    height: 55,
    backgroundColor: 'white',
    borderWidth: 0.5,
    borderRadius: 10
  },
  placeholderStyle: {
    fontSize: 16,
    marginLeft: 10,
    fontFamily: 'InterLight',
    color: '#00000080'
  },
  selectedTextStyle: {
    fontSize: 12,
    fontFamily: 'InterRegular',
    color: 'black'
  },
  inputSearchStyle: {
    height: 40,
    fontFamily: 'InterLight',
    fontSize: 16
  },
  icon: {
    marginRight: 10
  },
  selectedStyle: {
    borderRadius: 10
  }
});
