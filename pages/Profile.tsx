import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Alert,
} from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import NetInfo from '@react-native-community/netinfo';
import { useFocusEffect } from '@react-navigation/native';
import UserSection from '../assets/components/UserSection';
import RecipeCards from '../assets/components/RecipeCards';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { doc, onSnapshot, collection, query, where, runTransaction, addDoc, serverTimestamp, getDoc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Enable promise-based SQLite
SQLite.enablePromise(true);

// Open or create the database
const openDatabase = async () => {
  try {
    const db = await SQLite.openDatabase({ name: 'userProfile.db', location: 'default' });
    console.log('Database opened');
    return db;
  } catch (error) {
    console.error('Error opening database:', error);
  }
};

// Initialize the database
const initDatabase = async (db) => {
  try {
    await db.executeSql(
      'CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, profilePicture TEXT, username TEXT, joinDate TEXT, numberOfPosts INTEGER, bio TEXT)'
    );
    await db.executeSql(
      'CREATE TABLE IF NOT EXISTS recipes (id TEXT PRIMARY KEY, imageUri TEXT, name TEXT, rating REAL, numberOfRatings INTEGER, favorite INTEGER, user TEXT, favoriteCount INTEGER, userEmail TEXT)'
    );
    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
};

// Function to save user info to SQLite
const saveUserInfoToSQLite = async (db, userInfo, userEmail) => {
  try {
    await db.executeSql(
      'INSERT OR REPLACE INTO users (email, profilePicture, username, joinDate, numberOfPosts, bio) VALUES (?, ?, ?, ?, ?, ?)',
      [userEmail, userInfo.profilePicture, userInfo.username, userInfo.joinDate, userInfo.numberOfPosts, userInfo.bio]
    );
    console.log('User info saved to SQLite');
  } catch (error) {
    console.error('Error saving user info to SQLite:', error);
  }
};

// Function to save recipes to SQLite
const saveRecipesToSQLite = async (db, recipes) => {
  try {
    await db.transaction(async (tx) => {
      for (const recipe of recipes) {
        await tx.executeSql(
          'INSERT OR REPLACE INTO recipes (id, imageUri, name, rating, numberOfRatings, favorite, user, favoriteCount, userEmail) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [recipe.id, recipe.imageUri, recipe.name, recipe.rating, recipe.numberOfRatings, recipe.favorite ? 1 : 0, recipe.user, recipe.favoriteCount, recipe.userEmail]
        );
      }
    });
    console.log('Recipes saved to SQLite');
  } catch (error) {
    console.error('Error saving recipes to SQLite:', error);
  }
};

// Function to get user info from SQLite
const getUserInfoFromSQLite = async (db, userEmail) => {
  try {
    const [results] = await db.executeSql('SELECT * FROM users WHERE email = ?', [userEmail]);
    if (results.rows.length > 0) {
      return results.rows.item(0);
    }
    return null;
  } catch (error) {
    console.error('Error getting user info from SQLite:', error);
    return null;
  }
};

// Function to get recipes from SQLite
const getRecipesFromSQLite = async (db, userEmail) => {
  try {
    const [results] = await db.executeSql('SELECT * FROM recipes WHERE userEmail = ?', [userEmail]);
    const recipes = [];
    for (let i = 0; i < results.rows.length; i++) {
      recipes.push({
        ...results.rows.item(i),
        favorite: results.rows.item(i).favorite === 1
      });
    }
    return recipes;
  } catch (error) {
    console.error('Error getting recipes from SQLite:', error);
    return [];
  }
};

export type RootStackParamList = {
  Profile: { userEmail: string };
  EditProfile: { userEmail: string };
  WelcomeScreen: undefined;
  LoginScreen: undefined;
  EditPost: { recipeId: string };
  RecipeDetails: { recipeId: string; userEmail: string };
};

type ProfileRouteParams = {
  Profile: { userEmail: string };
};

type Recipe = {
  id: string;
  imageUri: string;
  name: string;
  rating: number;
  numberOfRatings: number;
  favorite: boolean;
  user: string;
  favoriteCount: number;
  userEmail: string;
};

type UserInfo = {
  profilePicture: string;
  username: string;
  joinDate: string;
  numberOfPosts: number;
  bio: string;
};

const Profile: React.FC = () => {
  const route = useRoute<RouteProp<ProfileRouteParams, 'Profile'>>();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { userEmail } = route.params;

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    profilePicture: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    username: '',
    joinDate: '',
    numberOfPosts: 0,
    bio: '',
  });
  const [feedback, setFeedback] = useState('');
  const [isFeedbackModalVisible, setIsFeedbackModalVisible] = useState(false);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [isThankYouModalVisible, setIsThankYouModalVisible] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [database, setDatabase] = useState<SQLite.SQLiteDatabase | null>(null);

  useEffect(() => {
    const initApp = async () => {
      const db = await openDatabase();
      if (db) {
        await initDatabase(db);
        setDatabase(db);
      }
    };

    initApp();

    const unsubscribeNetInfo = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });

    return () => {
      unsubscribeNetInfo();
      if (database) {
        database.close();
      }
    };
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setRefreshKey(prevKey => prevKey + 1);
    }, [])
  );

  const fetchUserData = useCallback(async () => {
    if (!database) return;

    try {
      let userInfo;
      if (isOnline) {
        // Always fetch from Firebase when online
        const userDocRef = doc(db, 'users', userEmail);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          userInfo = {
            profilePicture: userData.profilePicture || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
            username: userData.name || 'Unknown Chef',
            joinDate: userData.joinedAt ? new Date(userData.joinedAt.toDate()).toLocaleDateString() : '',
            bio: userData.bio || `Hey! I am ${userData.name || 'Unknown Chef'}. A chef from Malaysia~`,
            numberOfPosts: 0, // This will be updated when fetching recipes
          };
          // Always update SQLite with the latest data from Firebase
          await saveUserInfoToSQLite(database, userInfo, userEmail);
        } else {
          // If user doesn't exist in Firebase, try to get from SQLite
          userInfo = await getUserInfoFromSQLite(database, userEmail);
        }
      } else {
        // Fetch from SQLite when offline
        userInfo = await getUserInfoFromSQLite(database, userEmail);
      }

      if (userInfo) {
        setUserInfo(userInfo);
      } else {
        // If no user info found, set default values
        setUserInfo({
          profilePicture: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
          username: 'Unknown Chef',
          joinDate: 'Not available',
          numberOfPosts: 0,
          bio: 'No bio available',
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to fetch user data. Please try again.');
    }
  }, [isOnline, userEmail, database]);

  const fetchRecipes = useCallback(async () => {
    if (!database) return;

    try {
      let recipesData;
      if (isOnline) {
        // Fetch from Firebase
        const recipesRef = collection(db, 'recipes');
        const q = query(recipesRef, where('userEmail', '==', userEmail));
        const querySnapshot = await getDocs(q);
        const favoritesSnapshot = await getDocs(query(collection(db, 'favorites'), where('userEmail', '==', userEmail)));
        const favoritesSet = new Set(favoritesSnapshot.docs.map(doc => doc.data().recipeId));

        recipesData = querySnapshot.docs.map((doc) => {
          const recipeData = doc.data();
          return {
            id: doc.id,
            imageUri: recipeData.img,
            numberOfRatings: recipeData.numberOfRating || 0,
            name: recipeData.recipeName,
            rating: recipeData.rating || 0,
            favorite: favoritesSet.has(doc.id),
            user: `Chef ${recipeData.userName || 'Unknown'}`,
            favoriteCount: recipeData.favoriteCount || 0,
            userEmail: recipeData.userEmail,
          };
        });

        await saveRecipesToSQLite(database, recipesData);
      } else {
        // Fetch from SQLite
        recipesData = await getRecipesFromSQLite(database, userEmail);
      }

      setRecipes(recipesData);
      setUserInfo(prev => ({ ...prev, numberOfPosts: recipesData.length }));
    } catch (error) {
      console.error('Error fetching recipes:', error);
      Alert.alert('Error', 'Failed to fetch recipes. Please try again.');
    }
  }, [isOnline, userEmail, database]);

  useEffect(() => {
    if (database) {
      fetchUserData();
      fetchRecipes();
    }
  }, [fetchUserData, fetchRecipes, database, refreshKey]);

  const handleRecipePress = useCallback((recipeId: string) => {
    navigation.navigate('RecipeDetails', { recipeId, userEmail });
  }, [navigation, userEmail]);

  const handleFavoritePress = useCallback(async (recipeId: string) => {
    if (!userEmail) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    if (!isOnline) {
      Alert.alert('Error', 'You need to be online to update favorites');
      return;
    }

    const favoriteRef = doc(db, 'favorites', `${userEmail}_${recipeId}`);
    const recipeRef = doc(db, 'recipes', recipeId);

    try {
      await runTransaction(db, async (transaction) => {
        const favoriteDoc = await transaction.get(favoriteRef);
        const recipeDoc = await transaction.get(recipeRef);

        if (!recipeDoc.exists()) {
          throw new Error("Recipe does not exist!");
        }

        const currentFavoriteCount = recipeDoc.data().favoriteCount || 0;

        if (favoriteDoc.exists()) {
          transaction.delete(favoriteRef);
          transaction.update(recipeRef, { favoriteCount: Math.max(currentFavoriteCount - 1, 0) });
          Alert.alert('Success', 'Recipe unfavorited successfully');
        } else {
          transaction.set(favoriteRef, { userEmail, recipeId });
          transaction.update(recipeRef, { favoriteCount: currentFavoriteCount + 1 });
          Alert.alert('Success', 'Recipe favorited successfully');
        }
      });

      // Update local state
      setRecipes(prev => prev.map(recipe => 
        recipe.id === recipeId 
          ? {
              ...recipe, 
              favorite: !recipe.favorite, 
              favoriteCount: recipe.favorite
                ? Math.max(recipe.favoriteCount - 1, 0)
                : recipe.favoriteCount + 1
            } 
          : recipe
      ));

      // Update SQLite
      if (database) {
        await saveRecipesToSQLite(database, recipes);
      }

    } catch (error) {
      console.error('Error updating favorite status:', error);
      Alert.alert('Error', 'Failed to update favorite status. Please try again.');
    }
  }, [userEmail, isOnline, database, recipes]);

  const handleFeedbackSubmit = useCallback(async () => {
    if (feedback.trim().length === 0) return;

    if (!isOnline) {
      Alert.alert('Error', 'You need to be online to submit feedback');
      return;
    }

    try {
      const feedbacksRef = collection(db, 'feedbacks');
      await addDoc(feedbacksRef, {
        userEmail,
        feedback,
        createdAt: serverTimestamp(),
      });

      setFeedback('');
      setIsFeedbackModalVisible(false);
      setIsThankYouModalVisible(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    }
  }, [feedback, userEmail, isOnline]);

  const handleLogout = useCallback(async () => {
    try {
      // Clear the session from AsyncStorage
      await AsyncStorage.removeItem('userEmail');
      console.log('User session cleared from AsyncStorage');

      // Close the logout modal
      setIsLogoutModalVisible(false);

      // Navigate to the WelcomeScreen
      navigation.reset({
        index: 0,
        routes: [{ name: 'WelcomeScreen' }],
      });
    } catch (error) {
      console.error('Error clearing user session:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  }, [navigation]);

  const renderModal = useCallback((
    visible: boolean,
    setVisible: React.Dispatch<React.SetStateAction<boolean>>,
    title: string,
    content: React.ReactNode
  ) => (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      onRequestClose={() => setVisible(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          {content}
        </View>
      </View>
    </Modal>
  ), []);

  const feedbackModalContent = useMemo(() => (
    <>
      <TextInput
        style={styles.feedbackInput}
        placeholder="Enter your feedback"
        placeholderTextColor="#888"
        value={feedback}
        onChangeText={setFeedback}
        multiline={true}
      />
      <View style={styles.modalButtons}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => setIsFeedbackModalVisible(false)}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.submitButton, { opacity: feedback.trim().length > 0 ? 1 : 0.6 }]}
          onPress={handleFeedbackSubmit}
          disabled={feedback.trim().length === 0}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </>
  ), [feedback, handleFeedbackSubmit]);

  const logoutModalContent = useMemo(() => (
    <>
      <Text style={styles.logoutMessage}>Are you sure you want to log out?</Text>
      <View style={styles.modalButtons}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => setIsLogoutModalVisible(false)}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.logoutButton]}
          onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </>
  ), [handleLogout]);

  const thankYouModalContent = useMemo(() => (
    <>
      <Text style={styles.thankYouMessage}>Thank you for your feedback!</Text>
      <View style={styles.modalButtons}>
        <TouchableOpacity
          style={[styles.button, styles.okButton]}
          onPress={() => setIsThankYouModalVisible(false)}>
          <Text style={styles.buttonText}>OK</Text>
        </TouchableOpacity>
      </View>
    </>
  ), []);

  const renderContent = useCallback(() => {
    if (recipes.length === 0) {
      return (
        <View style={styles.noPostsContainer}>
          <Text style={styles.noPostsText}>No self created post</Text>
        </View>
      );
    }
    return (
      <RecipeCards 
        data={recipes} 
        onRecipePress={handleRecipePress}
        onFavoritePress={handleFavoritePress}
        isOnline={isOnline}
      />
    );
  }, [recipes, handleRecipePress, handleFavoritePress]);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.fixedHeader}>
          <UserSection
            profilePic={userInfo.profilePicture}
            username={userInfo.username}
            joinDate={userInfo.joinDate}
            numberOfPosts={userInfo.numberOfPosts}
            bio={userInfo.bio}
            onEditProfilePress={() => {
              if (!isOnline) {
                Alert.alert('Error', 'You need to be online to submit feedback');
                return;
              } else {
                navigation.navigate('EditProfile', { userEmail });
              }
            }}
            onLogoutPress={() => setIsLogoutModalVisible(true)}
            onFeedbackPress={() => setIsFeedbackModalVisible(true)}
          />
          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>Posts</Text>
          </View>
        </View>
        <View style={styles.contentContainer}>
          {renderContent()}
        </View>
      </ScrollView>

      {renderModal(isFeedbackModalVisible, setIsFeedbackModalVisible, 'Feedback', feedbackModalContent)}
      {renderModal(isLogoutModalVisible, setIsLogoutModalVisible, 'Confirm Logout', logoutModalContent)}
      {renderModal(isThankYouModalVisible, setIsThankYouModalVisible, 'Thank You', thankYouModalContent)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  fixedHeader: {
    backgroundColor: '#fff',
    zIndex: 1,
  },
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
  contentContainer: {
    flex: 1,
    backgroundColor: '#FCE7CC',
    minHeight: Dimensions.get('window').height - 300,
  },
  noPostsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  noPostsText: {
    fontSize: 18,
    color: '#888',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: Dimensions.get('window').width * 0.8,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: 'black',
  },
  feedbackInput: {
    width: '100%',
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    textAlignVertical: 'top',
    marginBottom: 20,
    color: 'gray',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#aaa',
  },
  submitButton: {
    backgroundColor: '#F26419',
  },
  logoutButton: {
    backgroundColor: '#F26419',
  },
  okButton: {
    backgroundColor: '#F26419',
    paddingVertical: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  logoutMessage: {
    marginBottom: 20,
    textAlign: 'center',
    color: 'gray',
  },
  thankYouMessage: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: 'gray',
  }
});

export default Profile;