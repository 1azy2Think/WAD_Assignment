import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Home from '../pages/Home';
import RecipeDetails from '../pages/RecipeDetails';

export type RootStackParamList = {
  Home: { userEmail?: string };
  RecipeDetails: { recipeId: string; userEmail?: string };
  EditPost: { recipeId: string };
};

const Stack = createStackNavigator<RootStackParamList>();

const RootNavigator = ({ route }) => {
  const userEmail = route.params?.userEmail;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Home"
        component={Home}
        initialParams={{ userEmail }}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="RecipeDetails" 
        component={RecipeDetails}
        initialParams={{ userEmail }}
      />
    </Stack.Navigator>
  );
};

export default RootNavigator;