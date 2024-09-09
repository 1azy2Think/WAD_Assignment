import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

type SearchBarProps = {
  searchText: string;
  onSearchChange: (text: string) => void;
};

const SearchAndFilterBar: React.FC<SearchBarProps> = ({ searchText, onSearchChange }) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search..."
        placeholderTextColor="#777777"
        value={searchText}
        onChangeText={onSearchChange}
      />
      <TouchableOpacity style={styles.button}>
        <Icon name="search" size={24} color="gray" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#eeeeee',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
    marginHorizontal: 10,
    marginTop: 13,
    marginBottom: 3,
    borderRadius: 17.5,
    height: 35,
  },
  input: {
    flex: 8,
    height: 35,
    borderColor: '#ddd',
    paddingHorizontal: 10,
    color: '#777777',
  },
  button: {
    flex: 1,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#007bff',
    borderRadius: 5,
    marginLeft: 5,
  },
});

export default SearchAndFilterBar;
