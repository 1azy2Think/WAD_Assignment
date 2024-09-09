import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

const themeColors = {
  login: '#F26419',
  createAccount: '#FFA500',
  danger: 'red',
  default: 'rgb(0, 123, 255)',
};

const AppButton = (props: any) => {
  const {title, onPress, theme, disabled} = props;

  // Determine the background color based on the theme
  const backgroundColors = themeColors[theme] || themeColors.default;

  return (
    <TouchableOpacity
      onPress={disabled ? undefined : onPress} // Prevent press if disabled
      disabled={disabled} // Disable touch events when needed
      style={[
        buttonStyles.button,
        {opacity: disabled ? 0.6 : 1, backgroundColor: backgroundColors},
      ]}>
      <View>
        <Text style={buttonStyles.buttonText}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const buttonStyles = StyleSheet.create({
  button: {
    margin: 5,
    height: 40,
    justifyContent: 'center',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    width: 200,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
    color: 'white',
  },
});

export default AppButton;
