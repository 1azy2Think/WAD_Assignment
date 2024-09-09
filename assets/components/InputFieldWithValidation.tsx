import React, {useState, useEffect} from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';

interface InputFieldProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: string;
  requirementText?: string;
  validate: (value: string) => boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  secureTextEntry?: boolean;
  editable?: boolean;
  multiline?: boolean;
  label?: string;
  alwaysGrey?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  requirementText,
  validate,
  style,
  inputStyle,
  secureTextEntry = false,
  editable = true,
  multiline = false,
  label,
  alwaysGrey = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);
  const [initialValue] = useState(value);

  const inputColor = () => {
    if (alwaysGrey || !editable) {
      return 'grey';
    } else if (value === initialValue) {
      return 'grey';
    } else if (validate(value)) {
      return 'green';
    } else {
      return 'red';
    }
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          {
            borderColor: inputColor(),
            height: multiline ? 100 : 40,
            alignItems: multiline ? 'flex-start' : 'center',
          },
        ]}>
        <TextInput
          style={[styles.input, { color: editable ? 'black' : 'grey' }, inputStyle]}
          placeholder={placeholder}
          placeholderTextColor="grey"
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          editable={editable}
          multiline={multiline}
        />
        {secureTextEntry && value.length > 0 && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
            <Entypo
              style={styles.icon}
              name={isPasswordVisible ? 'eye' : 'eye-with-line'}
              size={20}
              color="grey"
            />
          </TouchableOpacity>
        )}
        {requirementText && (
          <TouchableOpacity
            onPress={() => setShowRequirements(!showRequirements)}>
            <Entypo
              style={styles.icon}
              name="info-with-circle"
              size={20}
              color={inputColor()}
            />
          </TouchableOpacity>
        )}
      </View>
      {showRequirements && requirementText && (
        <Text style={styles.requirements}>{requirementText}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingEnd: 10,
    borderRadius: 5,
    backgroundColor: '#f6f6f6',
    paddingStart: 5,
  },
  input: {
    flex: 1,
    paddingRight: 10,
    fontSize: 16,
  },
  icon: {
    marginHorizontal: 5,
  },
  requirements: {
    marginTop: 10,
    color: 'grey',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: 'black',
  },
});

export default InputField;