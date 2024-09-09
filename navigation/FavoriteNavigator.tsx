import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Favlist from '../pages/Favlist';
import RecipeDetails from '../pages/RecipeDetails';

type FavoriteStackParamList = {
  Favorites: { userEmail: string };
  RecipeDetails: { recipeId: string; userEmail: string };
};

const Stack = createStackNavigator<FavoriteStackParamList>();

type FavoriteNavigatorProps = {
  route: { params: { userEmail: string } };
};

const FavoriteNavigator: React.FC<FavoriteNavigatorProps> = ({ route }) => {
  const { userEmail } = route.params;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Favorites"
        component={Favlist}
        initialParams={{ userEmail }}
      />
      <Stack.Screen 
        name="RecipeDetails" 
        component={RecipeDetails}
        initialParams={{ userEmail }}
      />
    </Stack.Navigator>
  );
};

export default FavoriteNavigator;