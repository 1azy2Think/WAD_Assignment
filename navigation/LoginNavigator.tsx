import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import WelcomeScreen from '../pages/WelcomeScreen';
import CreateAccountScreen from '../pages/CreateAccount';
import LoginScreen from '../pages/Login';
import EditProfile from '../pages/EditProfile';
import NewPost from '../pages/NewPost';
import EditPost from '../pages/EditPost';
import MainScreen from '../navigation/BottomTab';

const Stack = createStackNavigator();

const App = () => {
  return (
    <Stack.Navigator initialRouteName="WelcomeScreen">
      <Stack.Screen
        name="WelcomeScreen"
        component={WelcomeScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="CreateAccount"
        component={CreateAccountScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="LoginScreen"
        component={LoginScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="MainScreen"
        component={MainScreen}
        options={{headerShown: false}}
        initialParams={{ userEmail: '' }}
      />
      <Stack.Screen
        name="NewPost"
        component={NewPost}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="EditPost"
        component={EditPost}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfile}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

export default App;
