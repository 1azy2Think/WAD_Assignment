import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import Profile from '../pages/Profile';
import RecipeDetails from '../pages/RecipeDetails';
import EditProfile from '../pages/EditProfile';

type RootStackParamList = {
  Profile: { userEmail: string };
  RecipeDetails: { userEmail: string };
  EditProfile: { userEmail: string };
};

const Stack = createStackNavigator<RootStackParamList>();

const ProfileNavigator = ({ route }) => {
  const userEmail = route.params?.userEmail;

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen 
        name="Profile" 
        component={Profile} 
        initialParams={{ userEmail }}
      />
      <Stack.Screen 
      name="RecipeDetails" 
      component={RecipeDetails}
      initialParams={{ userEmail }}
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfile}
        initialParams={{ userEmail }}
      />
    </Stack.Navigator>
  );
};

export default ProfileNavigator;