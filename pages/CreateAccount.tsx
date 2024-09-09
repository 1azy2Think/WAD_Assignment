import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icons from 'react-native-vector-icons/Ionicons';
import { CommonActions } from '@react-navigation/native';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';

import DropdownComponent from '../assets/components/DropDownComponent';
import Button from '../assets/components/ButtonComponent';
import Logo from '../assets/components/LogoComponent';
import InputField from '../assets/components/InputFieldWithValidation';
import { loginSignUp } from './style';

export const genderData = [
  { key: 'male', value: 'Male' },
  { key: 'female', value: 'Female' },
  { key: 'others', value: 'Others' },
  { key: 'rnts', value: 'Rather Not To Say' },
];

interface FormData {
  name: string;
  pH: string;
  selectedGender: string;
  Email: string;
  Password: string;
  RePassword: string;
}

const CreateAccount = ({ navigation }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    pH: '',
    selectedGender: '',
    Email: '',
    Password: '',
    RePassword: '',
  });
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const validateUsername = (username: string) => username.trim() !== '';
  const validatePhoneNumber = (phoneNumber: string) => /^[0-9]{10,15}$/.test(phoneNumber);
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password: string) => /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/.test(password);

  const handleInputChange = (name: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = useCallback(() => {
    const { name, pH, selectedGender, Email, Password, RePassword } = formData;
    return (
      validateUsername(name) &&
      validatePhoneNumber(pH) &&
      selectedGender.trim() !== '' &&
      validateEmail(Email) &&
      validatePassword(Password) &&
      Password === RePassword
    );
  }, [formData]);

  useEffect(() => {
    setIsFormValid(validateForm());
  }, [formData, validateForm]);

  const navigateToMainScreen = useCallback((userEmail: string) => {
    console.log('Navigating to MainScreen with email:', userEmail);
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          { 
            name: 'MainScreen', 
            params: { userEmail: userEmail }
          }
        ],
      })
    );
  }, [navigation]);

  const handleCreateAccount = async () => {
    if (isFormValid && !isSubmitting) {
      setIsSubmitting(true);
      try {
        console.log('Starting account creation process');
        const userDocRef = doc(db, 'users', formData.Email);
        console.log('Checking if user already exists');
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          console.log('User already exists');
          Alert.alert('Account Exists', 'This email is already registered. Please use a different email.');
        } else {
          console.log('Creating new user document');
          await setDoc(userDocRef, {
            name: formData.name,
            phone: formData.pH,
            gender: formData.selectedGender,
            email: formData.Email,
            password: formData.Password,
            joinedAt: serverTimestamp(),
          });
          
          console.log('User document created successfully');
          console.log('Attempting to navigate to MainScreen');
          navigateToMainScreen(formData.Email);
        }
      } catch (error) {
        console.error('Error during account creation:', error);
        Alert.alert('Error', 'An unexpected error occurred. Please try again later.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      console.log('Form is not valid or submission is already in progress');
    }
  };

  return (
    <ScrollView contentContainerStyle={loginSignUp.scrollViewContent}>
      <View style={loginSignUp.backIcon}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icons name="chevron-back-outline" size={30} color="#f26419" />
        </TouchableOpacity>
      </View>
      <View style={loginSignUp.logo}>
        <Logo />
      </View>
      <View style={loginSignUp.titleContainer}>
        <Text style={loginSignUp.title}>Create Account</Text>
      </View>
      <View style={loginSignUp.container}>
        <InputField
          placeholder="Username"
          value={formData.name}
          onChangeText={(value) => handleInputChange('name', value)}
          validate={validateUsername}
        />
        <InputField
          placeholder="Phone-Number"
          value={formData.pH}
          onChangeText={(value) => handleInputChange('pH', value)}
          keyboardType="numeric"
          validate={validatePhoneNumber}
          requirementText="Phone number must be 10-15 digits."
        />
        <DropdownComponent
          data={genderData}
          placeholder="Gender"
          selectedValue={formData.selectedGender}
          onValueChange={(value) => handleInputChange('selectedGender', value)}
        />
        <InputField
          placeholder="Email"
          value={formData.Email}
          onChangeText={(value) => handleInputChange('Email', value)}
          validate={validateEmail}
          requirementText="Email must be in a valid format."
        />
        <InputField
          placeholder="Enter Password"
          value={formData.Password}
          onChangeText={(value) => handleInputChange('Password', value)}
          secureTextEntry
          validate={validatePassword}
          requirementText="Password must have at least 8 characters, with 1 uppercase letter and 1 symbol."
        />
        <InputField
          placeholder="Re-enter Your Password"
          value={formData.RePassword}
          onChangeText={(value) => handleInputChange('RePassword', value)}
          secureTextEntry
          validate={(value: string) => value === formData.Password}
          requirementText="Passwords must match."
        />
      </View>
      <View style={loginSignUp.buttonContainer}>
        <Button
          title="Create Account"
          onPress={handleCreateAccount}
          disabled={!isFormValid || isSubmitting}
          theme="createAccount"
        />
      </View>
      <View style={loginSignUp.buttonContainer}>
        <Button
          title="Login"
          theme="login"
          onPress={() => navigation.navigate('LoginScreen')}
        />
      </View>
    </ScrollView>
  );
};

export default CreateAccount;