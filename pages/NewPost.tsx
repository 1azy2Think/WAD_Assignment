import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Feather';
import Icons from 'react-native-vector-icons/Ionicons';
import { useRoute, RouteProp } from '@react-navigation/native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebaseConfig';

import InputField from '../assets/components/InputFieldWithValidation';
import DesignedButton from '../assets/components/ButtonComponent';
import DropdownComponent from '../assets/components/DropDownComponent';
import { newPost } from './style';
import DynamicInputField from '../assets/components/DynamicInputField';

let categories = [
  { key: 'Appetizer', value: 'Appetizer' },
  { key: 'Main Dish', value: 'Main Dish' },
  { key: 'Side Dish', value: 'Side Dish' },
  { key: 'Dessert', value: 'Dessert' },
  { key: 'Drink', value: 'Drink' },
];

type NewPostRouteParams = {
  userEmail: string;
};

const NewPost = ({ navigation }) => {
  const route = useRoute<RouteProp<Record<string, NewPostRouteParams>, string>>();
  const userEmail = route.params?.userEmail;

  const [img, setImg] = useState<string | null>(null);
  const [recipeName, setRecipeName] = useState('');
  const [recipeCategory, setRecipeCategory] = useState('');
  const [recipeDuration, setRecipeDuration] = useState('');
  const [recipeDescription, setRecipeDescription] = useState('');
  const [recipeIngredient, setRecipeIngredient] = useState<string[]>(['']);
  const [recipeSteps, setRecipeSteps] = useState<string[]>(['']);

  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handlePictureEdit = () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        const source = { uri: response.assets[0].uri };
        setImg(source.uri);
      }
    });
  };

  const validateForm = () => {
    const isValid =
      img !== null &&
      recipeName.trim() !== '' &&
      recipeCategory.trim() !== '' &&
      recipeDuration.trim() !== '' &&
      recipeDescription.trim() !== '' &&
      recipeIngredient.some(ingredient => ingredient.trim() !== '') &&
      recipeSteps.some(step => step.trim() !== '');
    setIsFormValid(isValid);
  };

  useEffect(() => {
    validateForm();
  }, [
    img,
    recipeName,
    recipeCategory,
    recipeDuration,
    recipeDescription,
    recipeIngredient,
    recipeSteps,
  ]);

  const uploadImage = async (uri: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const filename = `${userEmail}_${Date.now()}.jpg`;
    const storageRef = ref(storage, `recipeImages/${filename}`);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

  const handleCreate = async () => {
    if (!isFormValid) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsUploading(true);

    try {
      let imageUrl = null;
      if (img) {
        imageUrl = await uploadImage(img);
      }

      const recipeData = {
        img: imageUrl,
        recipeName,
        recipeCategory,
        recipeDuration: parseInt(recipeDuration),
        recipeDescription,
        recipeIngredient: recipeIngredient.filter(ingredient => ingredient.trim() !== ''),
        recipeSteps: recipeSteps.filter(step => step.trim() !== ''),
        userEmail,
        createdAt: serverTimestamp(),
        rating: null,
        numberOfRating: 0,
      };

      const docRef = await addDoc(collection(db, 'recipes'), recipeData);
      console.log('Recipe created with ID: ', docRef.id);
      Alert.alert('Success', 'Recipe created successfully');
      navigation.navigate('Home');
    } catch (error) {
      console.error('Error creating recipe: ', error);
      Alert.alert('Error', 'Failed to create recipe. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const validateNumber = (number: string) => /^[0-9]+$/.test(number);
  const validateAlphabet = (text: string) => /^[A-Za-z\s]+$/.test(text);

  return (
    <ScrollView style={newPost.container}>
      <View style={newPost.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icons name="chevron-back-outline" size={30} />
        </TouchableOpacity>
        <Text style={newPost.headerInput}>New Post</Text>
      </View>
      <View style={newPost.inputContainer}>
        <View style={newPost.recipePictureContainer}>
          {img ? (
            <Image source={{uri: img}} style={newPost.recipePicture} />
          ) : (
            <View style={newPost.defaultRecipePicture}></View>
          )}
          <TouchableOpacity
            style={newPost.editButton}
            onPress={handlePictureEdit}>
            <Icon name="plus-circle" size={35} color="white" />
          </TouchableOpacity>
        </View>

        <InputField
          label="Recipe Name"
          placeholder="Recipe Name"
          value={recipeName}
          onChangeText={setRecipeName}
          validate={validateAlphabet}
        />
        <View style={newPost.rowContainer}>
          <View style={newPost.flexItem}>
            <DropdownComponent
              label="Category"
              data={categories}
              placeholder="Category"
              selectedValue={recipeCategory}
              onValueChange={setRecipeCategory}
            />
          </View>
          <View style={newPost.flexItem}>
            <InputField
              label="Duration (Minutes)"
              placeholder="Duration (Minutes)"
              value={recipeDuration}
              onChangeText={setRecipeDuration}
              keyboardType="numeric"
              validate={validateNumber}
            />
          </View>
        </View>
        <InputField
          label="Brief Description"
          placeholder="Brief Description"
          value={recipeDescription}
          onChangeText={setRecipeDescription}
          multiline={true}
          validate={() => true}
        />
        <DynamicInputField
          label="Ingredients"
          values={recipeIngredient}
          onChange={setRecipeIngredient}
          placeholder="Ingredient"
        />
        <DynamicInputField
          label="Steps"
          values={recipeSteps}
          onChange={setRecipeSteps}
          placeholder="Step"
        />
        <View style={newPost.buttonContainer}>
          <DesignedButton
            title={isUploading ? "Uploading..." : "Create Recipe"}
            onPress={handleCreate}
            theme={isFormValid && !isUploading ? 'success' : 'failed'}
            disabled={!isFormValid || isUploading}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default NewPost;