import React from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';

const MultilineTextInput = (props: any) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput
        style={styles.textInput}
        multiline
        numberOfLines={4}
        value={props.value}
        onChangeText={props.onChangeText}
        placeholder={props.placeholder}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
  },
  label: {
    fontSize: 18,
    color: '#010100',
    fontWeight: 'bold',
    textAlignVertical: 'center',
  },
  textInput: {
    height: 100,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    color: '#000',
    borderWidth: 1,
    padding: 8,
    textAlignVertical: 'top', // Align text at the top of the input field
  },
});

export default MultilineTextInput;
