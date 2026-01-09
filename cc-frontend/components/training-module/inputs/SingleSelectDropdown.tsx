import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

type SingleSelectDropdownProps = {
  data: { label: string; value: string }[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  containerClassName?: string;
};

const SingleSelectDropdown = ({
  data,
  value,
  onChange,
  placeholder = 'Select item',
  containerClassName = ''
}: SingleSelectDropdownProps) => {
  return (
    <View className={`w-full ${containerClassName}`}>
      <Dropdown
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
        onChange={item => onChange(item.value)}
      />
    </View>
  );
};

export default SingleSelectDropdown;

const styles = StyleSheet.create({
  dropdown: {
    height: 55,
    backgroundColor: 'white',
    borderWidth: 0.5,
    borderRadius: 10,
    paddingRight: 10
  },
  placeholderStyle: {
    fontSize: 16,
    marginLeft: 10,
    fontFamily: 'InterLight',
    color: '#00000080'
  },
  selectedTextStyle: {
    fontSize: 16,
    fontFamily: 'InterRegular',
    color: 'black',
    marginLeft: 10
  },
  inputSearchStyle: {
    height: 40,
    fontFamily: 'InterLight',
    fontSize: 16
  }
});
