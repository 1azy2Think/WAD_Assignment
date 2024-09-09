import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

interface DynamicInputFieldProps {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  label?: string; // Optional label prop
}

const DynamicInputField: React.FC<DynamicInputFieldProps> = ({
  values,
  onChange,
  placeholder,
  label,
}) => {
  const handleAdd = () => {
    onChange([...values, '']);
  };

  const handleChangeText = (text: string, index: number) => {
    const newValues = [...values];
    newValues[index] = text;
    onChange(newValues);
  };

  const handleRemove = (index: number) => {
    const newValues = values.filter((_, i) => i !== index);
    onChange(newValues);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      {values.map((value, index) => (
        <View key={index} style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={value}
            onChangeText={text => handleChangeText(text, index)}
            placeholder={`${placeholder} ${index + 1}`}
            placeholderTextColor="grey"
          />
          <TouchableOpacity
            onPress={() => handleRemove(index)}
            style={styles.removeButton}>
            <Icon name="minus-circle" size={24} color="red" />
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity onPress={handleAdd} style={styles.addButton}>
        <Icon name="plus-circle" size={24} color="green" />
        <Text style={styles.addButtonText}>Add {placeholder}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    backgroundColor: 'white',
    color: 'black',
  },
  removeButton: {
    marginLeft: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  addButtonText: {
    marginLeft: 5,
    color: 'black',
  },
});

export default DynamicInputField;
