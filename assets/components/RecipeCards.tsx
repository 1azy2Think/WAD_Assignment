import React from 'react';
import { View, FlatList, StyleSheet, Dimensions } from 'react-native';
import RecipeCard from './RecipeCard';
import RNFS from 'react-native-fs';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width / 2 - 10;

type RecipeCardsProps = {
  data: any[];
  onFavoritePress: (recipeId: string, newFavoriteStatus: boolean) => void;
  onRecipePress: (recipeId: string) => void;
  isOnline: boolean;
};

const RecipeCards: React.FC<RecipeCardsProps> = ({ data, onFavoritePress, onRecipePress, isOnline }) => {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.cardContainer}>
          <RecipeCard
            // Use local image path if offline, otherwise use online URL
            imageUri={isOnline ? item.imageUri : `file://${RNFS.DocumentDirectoryPath}/recipe_images/${item.id}.jpg`}
            name={item.name}
            rating={item.rating}
            numberOfRatings={item.numberOfRatings}
            user={item.user}
            favorite={item.favorite}
            recipeId={item.id}
            onFavoritePress={onFavoritePress}
          />
        </View>
      )}
      numColumns={2}
      columnWrapperStyle={styles.columnWrapper}
      contentContainerStyle={styles.listContent}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  cardContainer: {
    width: CARD_WIDTH,
  },
});

export default RecipeCards;
