import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';

interface DropdownProps {
  selectedValue: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  data: Array<{key: string; value: string}>;
  label?: string;
  alwaysGrey?: boolean;
}

const DropdownComponent: React.FC<DropdownProps> = ({
  selectedValue,
  onValueChange,
  placeholder,
  data,
  label,
  alwaysGrey = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [initialValue, setInitialValue] = useState(selectedValue);

  const inputColor = () => {
    if (alwaysGrey) {
      return 'grey';
    } else {
      return selectedValue === initialValue ? 'grey' : 'green';
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Dropdown
        style={[styles.dropdown, {borderColor: inputColor()}]}
        inputSearchStyle={styles.inputSearchStyle}
        data={data}
        search
        maxHeight={300}
        labelField="value"
        valueField="key"
        placeholder={placeholder}
        searchPlaceholder="Search..."
        value={selectedValue}
        onChange={item => {
          onValueChange(item.key);
        }}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        itemTextStyle={styles.itemTextStyle}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </View>
  );
};

export default DropdownComponent;

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  dropdown: {
    borderColor: 'grey',
    borderWidth: 1,
    borderRadius: 5,
    height: 40,
    paddingHorizontal: 8,
    paddingVertical: 0,
    backgroundColor: '#f6f6f6',
  },
  inputSearchStyle: {
    fontSize: 14,
    height: 30,
    paddingHorizontal: 8,
    paddingVertical: 0,
    color: 'black',
  },
  placeholderStyle: {
    color: 'grey',
  },
  selectedTextStyle: {
    color: 'black',
  },
  itemTextStyle: {
    color: 'black',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: 'black',
  },
});
