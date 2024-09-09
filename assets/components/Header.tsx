import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const Header = (props: any) => {
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerText}>{props.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F26419',
    borderBottomWidth: 1,
    borderBottomColor: '#F26419',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EBEBEB',
  },
});

export default Header;
