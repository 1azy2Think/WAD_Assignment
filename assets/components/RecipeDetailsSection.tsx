import React from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const RecipeDetailsSection = (props: any) => {
  const {
    description,
    ingredients,
    steps,
    rating,
    numberOfRatings,
    category,
    duration,
  } = props;

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      let iconName = 'star-outline';
      if (i <= Math.floor(rating)) {
        iconName = 'star';
      } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
        iconName = 'star-half';
      }
      stars.push(
        <MaterialCommunityIcons
          key={i}
          name={iconName}
          size={24}
          color="gold"
        />,
      );
    }
    return stars;
  };

  const renderIngredient = ({item}: {item: string}) => (
    <Text style={styles.ingredientItem}>• {item}</Text>
  );

  const renderStep = ({item, index}: {item: string; index: number}) => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepNumber}>{index + 1}.</Text>
      <Text style={styles.stepText}>{item}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.headerInput}>{props.recipeName}</Text>
        <View style={styles.ratingContainer}>
          <View style={styles.stars}>{renderStars()}</View>
          <Text style={styles.ratingText}>({numberOfRatings})</Text>
        </View>
        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Text style={styles.label}>Category:</Text>
            <Text style={styles.text}>{category}</Text>
          </View>
          <View style={[styles.rowItem, styles.centeredRowItem]}>
            <Text style={styles.label}>Duration:</Text>
            <Text style={styles.text}>{duration} minutes</Text>
          </View>
        </View>
      </View>
      <View>
        <Text style={styles.sectionHeader}>Description</Text>
        <Text style={styles.descriptionText}>{description}</Text>

        <Text style={styles.sectionHeader}>Ingredients</Text>
        <FlatList
          data={ingredients}
          renderItem={renderIngredient}
          keyExtractor={(item, index) => index.toString()}
          style={styles.list}
        />

        <Text style={styles.sectionHeader}>Steps</Text>
        <FlatList
          data={steps}
          renderItem={renderStep}
          keyExtractor={(item, index) => index.toString()}
          style={styles.list}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FCE7CC',
  },
  headerInput: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#F26419',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  stars: {
    flexDirection: 'row',
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 14,
    color: 'gray',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  rowItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  centeredRowItem: {
    alignSelf: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 5,
    textAlignVertical: 'center',
    color: 'gray',
  },
  text: {
    fontSize: 16,
    color: 'gray',
  },
  sectionHeader: {
    fontSize: 24,
    color: '#F26419',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 16,
  },
  list: {
    marginBottom: 16,
  },
  ingredientItem: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 4,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  stepNumber: {
    fontSize: 16,
    color: 'gray',
    marginRight: 8,
  },
  stepText: {
    fontSize: 16,
    color: 'gray',
    flex: 1,
  },
});

export default RecipeDetailsSection;
