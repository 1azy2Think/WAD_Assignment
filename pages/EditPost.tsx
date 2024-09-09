import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Feather';
import Icons from 'react-native-vector-icons/Ionicons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebaseConfig';

import InputField from '../assets/components/InputFieldWithValidation';
import DesignedButton from '../assets/components/ButtonComponent';
import DropdownComponent from '../assets/components/DropDownComponent';
import DynamicInputField from '../assets/components/DynamicInputField';
import { newPost, popUpBox } from './style';

// Types
type RootStackParamList = {
  EditPost: { recipeId: string };
  MainScreen: undefined;
};

type EditPostRouteProp = RouteProp<RootStackParamList, 'EditPost'>;
type EditPostNavigationProp = StackNavigationProp<RootStackParamList>;

let categories = [
  { key: 'Appetizer', value: 'Appetizer' },
  { key: 'Main Dish', value: 'Main Dish' },
  { key: 'Side Dish', value: 'Side Dish' },
  { key: 'Dessert', value: 'Dessert' },
  { key: 'Drink', value: 'Drink' },
];

const EditPost = () => {
  const route = useRoute<EditPostRouteProp>();
  const navigation = useNavigation<EditPostNavigationProp>();
  const { recipeId } = route.params;

  const [img, setImg] = useState<string | null>(null);
  const [recipeName, setRecipeName] = useState<string>('');
  const [recipeCategory, setRecipeCategory] = useState<string>(''); // Default to empty string
  const [recipeDuration, setRecipeDuration] = useState<string>(''); // Default to empty string
  const [recipeDescription, setRecipeDescription] = useState<string>('');
  const [recipeIngredient, setRecipeIngredient] = useState<string[]>(['']);
  const [recipeSteps, setRecipeSteps] = useState<string[]>(['']);
  const [modalVisible, setModalVisible] = useState(false);
  const [changeMade, setChangeMade] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);

  const [initialValues, setInitialValues] = useState({
    img: '',
    name: '',
    category: '',
    duration: '',
    description: '',
    ingredients: [''],
    steps: [''],
  });

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const recipeRef = doc(db, 'recipes', recipeId);
        const recipeSnap = await getDoc(recipeRef);

        if (recipeSnap.exists()) {
          const recipeData = recipeSnap.data();
          setImg(recipeData.img);
          setRecipeName(recipeData.recipeName);
          setRecipeCategory(recipeData.recipeCategory || ''); // Initialize category
          setRecipeDuration(recipeData.recipeDuration?.toString() || ''); // Initialize duration and convert to string
          setRecipeDescription(recipeData.recipeDescription);
          setRecipeIngredient(recipeData.recipeIngredient || ['']);
          setRecipeSteps(recipeData.recipeSteps || ['']);

          setInitialValues({
            img: recipeData.img,
            name: recipeData.recipeName,
            category: recipeData.recipeCategory || '',
            duration: recipeData.recipeDuration?.toString() || '',
            description: recipeData.recipeDescription,
            ingredients: recipeData.recipeIngredient || [''],
            steps: recipeData.steps || [''],
          });
        } else {
          Alert.alert('Error', 'Recipe not found');
          navigation.goBack();
        }
      } catch (error) {
        console.error('Error fetching recipe:', error);
        Alert.alert('Error', 'Failed to load recipe details');
      }
    };

    fetchRecipe();
  }, [recipeId, navigation]);

  const handleRecipePictureEdit = async () => {
    const options = {
      mediaType: 'photo' as const,
      quality: 0.8,
    };

    launchImageLibrary(options, async (response) => {
      if (response.assets && response.assets[0].uri) {
        setIsImageUploading(true);
        try {
          const imageUrl = await uploadImage(response.assets[0].uri);
          setImg(imageUrl);
        } catch (error) {
          console.error('Error uploading image:', error);
          Alert.alert('Error', 'Failed to upload image');
        } finally {
          setIsImageUploading(false);
        }
      }
    });
  };

  const uploadImage = async (uri: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const filename = `recipe_images/${recipeId}_${Date.now()}.jpg`;
    const storageRef = ref(storage, filename);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

  const validateForm = useCallback(() => {
    const hasChanges =
      img !== initialValues.img ||
      (recipeName || '').trim() !== (initialValues.name || '').trim() ||
      (recipeCategory || '').trim() !== (initialValues.category || '').trim() ||
      (recipeDuration || '').trim() !== (initialValues.duration || '').trim() ||
      (recipeDescription || '').trim() !== (initialValues.description || '').trim() ||
      JSON.stringify(recipeIngredient) !== JSON.stringify(initialValues.ingredients) ||
      JSON.stringify(recipeSteps) !== JSON.stringify(initialValues.steps);

    setChangeMade(hasChanges);
  }, [img, recipeName, recipeCategory, recipeDuration, recipeDescription, recipeIngredient, recipeSteps, initialValues]);

  useEffect(() => {
    validateForm();
  }, [validateForm]);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const recipeRef = doc(db, 'recipes', recipeId);

      let imgUrl = img;
      if (img !== initialValues.img && img) {
        // If the image has changed and is not null, it's already uploaded to Firebase Storage
        // We just need to use the new URL
        imgUrl = img;

        // Delete the old image if it exists
        if (initialValues.img) {
          const oldImageRef = ref(storage, initialValues.img);
          await deleteObject(oldImageRef);
        }
      }

      console.log("Updating recipe with the following data:", {
        img: imgUrl,
        recipeName,
        recipeCategory,
        recipeDuration,
        recipeDescription,
        recipeIngredient,
        recipeSteps,
      });

      await updateDoc(recipeRef, {
        img: imgUrl,
        recipeName: recipeName,
        recipeCategory: recipeCategory,
        recipeDuration: recipeDuration,
        recipeDescription: recipeDescription,
        recipeIngredient: recipeIngredient,
        recipeSteps: recipeSteps,
      });

      Alert.alert('Success', 'Recipe updated successfully');
      navigation.navigate('MainScreen');
    } catch (error) {
      console.error('Error updating recipe:', error);
      Alert.alert('Error', 'Failed to update recipe');
    } finally {
      setLoading(false);
    }
  };

  

  const handleDeleteRecipe = async () => {
    setModalVisible(false);
    setLoading(true);
    try {
      // Delete the image from Firebase Storage if it exists
      if (img) {
        const imageRef = ref(storage, img);
        await deleteObject(imageRef);
      }

      // Delete the recipe document from Firestore
      await deleteDoc(doc(db, 'recipes', recipeId));
      
      Alert.alert('Success', 'Recipe deleted successfully');
      navigation.navigate('MainScreen');
    } catch (error) {
      console.error('Error deleting recipe:', error);
      Alert.alert('Error', 'Failed to delete recipe');
    } finally {
      setLoading(false);
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
        <Text style={newPost.headerInput}>Edit Post</Text>
      </View>
      <View style={newPost.inputContainer}>
      <View>
          {img ? (
            <Image source={{ uri: img }} style={newPost.recipePicture} />
          ) : (
            <View style={newPost.defaultRecipePicture}>
              <Text>No Image</Text>
            </View>
          )}
          <TouchableOpacity
            style={newPost.editButton}
            onPress={handleRecipePictureEdit}
            disabled={isImageUploading}>
            {isImageUploading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Icon name="plus-circle" size={35} color="white" />
            )}
          </TouchableOpacity>
        </View>

        <InputField
          label="Recipe Name"
          placeholder="Recipe Name"
          value={recipeName}
          onChangeText={setRecipeName}
          validate={validateAlphabet}
          alwaysGrey={true}
        />
        <View style={newPost.rowContainer}>
          <View style={newPost.flexItem}>
            <DropdownComponent
              label="Category"
              data={categories}
              placeholder="Category"
              selectedValue={recipeCategory}
              onValueChange={setRecipeCategory}
              alwaysGrey={true}
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
              alwaysGrey={true}
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
          alwaysGrey={true}
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
          {loading ? (
            <ActivityIndicator size="large" color="#F26419" />
          ) : (
            <>
              <DesignedButton
                title="Update Recipe"
                disabled={!changeMade || isImageUploading}
                theme={changeMade && !isImageUploading ? 'success' : 'failed'}
                onPress={handleUpdate}
              />
              <DesignedButton
                title="Delete Recipe"
                onPress={() => setModalVisible(true)}
                theme={'danger'}
              />
            </>
          )}
        </View>
        <Modal
          transparent={true}
          visible={modalVisible}
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}>
          <View style={popUpBox.modalContainer}>
            <View style={popUpBox.modalContent}>
              <Text style={popUpBox.modalTitle}>Delete Recipe</Text>
              <Text style={popUpBox.modalMessage}>
                You won't be able to recover your recipe once it has been permanently deleted.
              </Text>
              <View style={popUpBox.modalButtons}>
                <TouchableOpacity
                  style={[popUpBox.button, popUpBox.cancelButton]}
                  onPress={() => setModalVisible(false)}>
                  <Text style={popUpBox.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[popUpBox.button, popUpBox.confirmButton]}
                  onPress={handleDeleteRecipe}>
                  <Text style={popUpBox.buttonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};

export default EditPost;
