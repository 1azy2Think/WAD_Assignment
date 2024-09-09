import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

type SortByFilterBarProps = {
  selectedSort: string | null;
  onSelectSort: (sort: string | null) => void;
};

const FilterBar: React.FC<SortByFilterBarProps> = ({ selectedSort, onSelectSort }) => {
  const sortOptions = [
    {label: 'Latest', value: 'latest'},
    {label: 'Earliest', value: 'earliest'},
    {label: 'Rating', value: 'rating'},
    {label: 'Most Favorite', value: 'favouriteCount'},
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Sort by   :</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
        style={styles.scrollView}>
        {sortOptions.map(option => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.button,
              selectedSort === option.value && styles.selectedButton,
            ]}
            onPress={() => onSelectSort(option.value)}>
            <Text
              style={[
                styles.buttonText,
                selectedSort === option.value && styles.selectedButtonText,
              ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 10,
    backgroundColor: '#fff',
  },
  label: {
    marginRight: 10,
    fontSize: 13,
    color: '#777',
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexDirection: 'row',
  },
  button: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginHorizontal: 5,
  },
  selectedButton: {
    backgroundColor: '#007bff',
  },
  buttonText: {
    fontSize: 14,
    color: '#333',
  },
  selectedButtonText: {
    color: '#fff',
  },
});

export default FilterBar;
