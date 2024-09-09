import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

type CategoryFilterBarProps = {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
};

const FilterBar: React.FC<CategoryFilterBarProps> = ({ selectedCategory, onSelectCategory }) => {
  const categoryOptions = [
    { label: 'All', value: null },
    { label: 'Appetizer', value: 'Appetizer' },
    { label: 'Main Dish', value: 'Main Dish' },
    { label: 'Side Dish', value: 'Side Dish' },
    { label: 'Dessert', value: 'Dessert' },
    { label: 'Drink', value: 'Drink' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Category:</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
        style={styles.scrollView}>
        {categoryOptions.map(option => (
          <TouchableOpacity
            key={option.value || 'all'}
            style={[
              styles.button,
              selectedCategory === option.value && styles.selectedButton,
            ]}
            onPress={() => onSelectCategory(option.value)}>
            <Text
              style={[
                styles.buttonText,
                selectedCategory === option.value && styles.selectedButtonText,
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
    marginBottom: 10,
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
