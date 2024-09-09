import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Linking,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Logo from '../assets/components/LogoComponent';
import DesignedButton from '../assets/components/ButtonComponent';

const App = ({navigation}) => {
  const handlePress = () => {
    Linking.openURL('https://www.youtube.com');
  };

  return (
    <ScrollView contentContainerStyle={firstScreens.scrollViewContent}>
      <View style={firstScreens.linkText}>
        <TouchableOpacity onPress={handlePress}>
          <Text style={firstScreens.linkText}>Tutorial? Click Here!</Text>
        </TouchableOpacity>
      </View>
      <View style={firstScreens.logoContainer}>
        <Logo />
      </View>
      <View style={firstScreens.container}>
        <Text style={firstScreens.title}>Welcome to Tastier</Text>
        <Text style={firstScreens.subtitle}>
          Your Ultimate Recipe Sharing Community!
        </Text>
        <Text style={firstScreens.description}>
          Discover a world of flavors and culinary inspiration right at your
          fingertips. With Tastier, you can upload your favorite recipes, share
          your kitchen creations with a vibrant community, and explore a diverse
          collection of dishes from around the globe.
        </Text>
        <Text style={firstScreens.description}>
          Whether you're a seasoned chef or a firstScreens cook, Tastier offers
          a space for everyone to learn, share, and enjoy the art of cooking.
          Join us today and make your kitchen adventures even more exciting!
        </Text>
      </View>
      <View style={firstScreens.buttonContainer}>
        <DesignedButton
          title="Login"
          onPress={() => navigation.navigate('LoginScreen')}
          theme="login"
        />
      </View>
      <View style={firstScreens.buttonContainer}>
        <DesignedButton
          title="Create Account"
          onPress={() => navigation.navigate('CreateAccount')}
          theme="createAccount"
        />
      </View>
    </ScrollView>
  );
};

const firstScreens = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#fce7cc',
  },
  linkText: {
    position: 'absolute',
    top: 10,
    right: 10,
    color: 'blue',
    textDecorationLine: 'underline',
  },
  logoContainer: {
    marginBottom: 20,
    alignSelf: 'center',
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  container: {
    marginTop: 0,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 10,
    shadowColor: 'rgba(255, 255, 255)',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff6347',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  buttonContainer: {
    marginTop: 10,
    alignSelf: 'center',
  },
});

export default App;
