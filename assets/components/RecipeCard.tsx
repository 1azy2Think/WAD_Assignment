import React from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../navigation/HomeNavigator';

type RecipeCardProps = {
  imageUri: string;
  name: string;
  rating: number;
  numberOfRatings: number;
  user: string;
  favorite: boolean;
  recipeId: string;
  onFavoritePress: (recipeId: string, newFavoriteStatus: boolean) => void;
};

const RecipeCard: React.FC<RecipeCardProps> = ({
  imageUri,
  name,
  rating,
  numberOfRatings,
  user,
  favorite,
  recipeId,
  onFavoritePress,
}) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handlePress = () => {
    navigation.navigate('RecipeDetails', {recipeId});
  };

  const toggleFavorite = () => {
    onFavoritePress(recipeId, !favorite);
  };

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
          size={16}
          color="gold"
        />,
      );
    }
    return stars;
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.card}>
      <Image source={{uri: imageUri}} style={styles.image} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{name}</Text>
          <TouchableOpacity
            onPress={toggleFavorite}
            style={styles.favoriteIcon}>
            <MaterialCommunityIcons
              name="heart"
              size={20}
              color={favorite ? 'red' : '#CCCCCC'}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.ratingContainer}>
          <View style={styles.stars}>{renderStars()}</View>
          <Text style={styles.ratingText}>({numberOfRatings})</Text>
        </View>
        <Text style={styles.user}>Recipe by {user}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    margin: 10,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  content: {
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    color: '#777777',
  },
  favoriteIcon: {
    padding: 5,
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
  user: {
    fontSize: 14,
    color: 'gray',
  },
});

export default RecipeCard;
