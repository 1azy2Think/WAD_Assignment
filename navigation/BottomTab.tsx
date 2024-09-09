import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from './HomeNavigator';
import FavoritesScreen from './FavoriteNavigator';
import ProfileScreen from './ProfileNavigator';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const Tab = createBottomTabNavigator();

const BottomTab = ({ route }) => {
  const userEmail = route.params?.userEmail;

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarActiveTintColor: '#F26419',
        tabBarInactiveTintColor: '#aaaaaa',
        tabBarHideOnKeyboard: true,
      })}>
      <Tab.Screen
        name="HomeScreen"
        component={HomeScreen}
        initialParams={{ userEmail }}
        options={{
          tabBarLabel: 'Home',
          title: 'Home',
          tabBarIcon: ({color}) => (
            <MaterialCommunityIcons name="home" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="FavouritesScreen"
        component={FavoritesScreen}
        initialParams={{ userEmail }} 
        options={{
          tabBarLabel: 'Favourites',
          title: 'Favourites',
          tabBarIcon: ({color}) => (
            <MaterialCommunityIcons name="heart" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        initialParams={{ userEmail }}
        options={{
          tabBarLabel: 'Profile',
          title: 'Profile',
          tabBarIcon: ({color}) => (
            <MaterialCommunityIcons name="account" color={color} size={26} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTab;
