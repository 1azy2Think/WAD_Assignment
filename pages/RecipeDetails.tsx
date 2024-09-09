import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Image, Alert } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/HomeNavigator';
import RecipeDetailsHeader from '../assets/components/RecipeDetailsHeader';
import RecipeDetailsSection from '../assets/components/RecipeDetailsSection';
import RecipeDetailsReview from '../assets/components/RecipeDetailsReview';
import { doc, onSnapshot, getDoc, runTransaction, DocumentData } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import NetInfo from '@react-native-community/netinfo';
import SQLite from 'react-native-sqlite-storage';
import RNFS from 'react-native-fs';

type RecipeDetailsRouteProp = RouteProp<RootStackParamList, 'RecipeDetails'>;
type RecipeDetailsNavigationProp = StackNavigationProp<RootStackParamList, 'RecipeDetails'>;

type Recipe = {
  id: string;
  recipeName: string;
  name?: string;
  rating: number;
  numberOfRatings: number;
  numberOfRating?: number;
  userImage?: string;
  recipeDescription: string;
  recipeIngredient: string[];
  recipeSteps: string[];
  recipeCategory: string;
  category?: string;
  recipeDuration: string;
  imageUri?: string;
  img?: string;
  userEmail?: string;
  favoriteCount?: number;
  createdAt: Date;
};

const DB_NAME = 'favorites.sqlite';
const IMAGE_DIR = `${RNFS.DocumentDirectoryPath}/recipe_images/`;

SQLite.enablePromise(true);

const RecipeDetails = () => {
  const route = useRoute<RecipeDetailsRouteProp>();
  const navigation = useNavigation<RecipeDetailsNavigationProp>();
  const { recipeId, userEmail } = route.params;

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [recipeOwnerName, setRecipeOwnerName] = useState<string>('');
  const [currentUserName, setCurrentUserName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState(true);

  const openDatabase = async () => {
    return SQLite.openDatabase({
      name: DB_NAME,
      location: 'default',
    });
  };

  const fetchRecipeFromSQLite = useCallback(async (recipeId: string) => {
    try {
      const db = await openDatabase();
      const [results] = await db.executeSql('SELECT data FROM favorites WHERE id = ?', [recipeId]);
      if (results.rows.length > 0) {
        const recipeData = JSON.parse(results.rows.item(0).data);
        console.log('Fetched recipe data from SQLite:', recipeData);
        return {
          id: recipeData.id,
          recipeName: recipeData.recipeName || recipeData.name || '',
          rating: recipeData.rating || 0,
          numberOfRatings: recipeData.numberOfRatings || recipeData.numberOfRating || 0,
          userImage: recipeData.userImage,
          recipeDescription: recipeData.recipeDescription || '',
          recipeIngredient: recipeData.recipeIngredient || [],
          recipeSteps: recipeData.recipeSteps || [],
          recipeCategory: recipeData.recipeCategory || recipeData.category || '',
          recipeDuration: recipeData.recipeDuration || '',
          imageUri: recipeData.imageUri,
          img: recipeData.img,
          userEmail: recipeData.userEmail,
          favoriteCount: recipeData.favoriteCount || 0,
          createdAt: new Date(recipeData.createdAt),
          user: recipeData.user || '',
        };
      }
      console.log('No recipe found in SQLite for id:', recipeId);
      return null;
    } catch (error) {
      console.error('Error fetching recipe from SQLite:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchRecipe = async () => {
      if (isOnline) {
        const recipeRef = doc(db, 'recipes', recipeId);
        const favoriteRef = doc(db, 'favorites', `${userEmail}_${recipeId}`);

        const unsubscribe = onSnapshot(recipeRef, async (docSnapshot) => {
          if (docSnapshot.exists()) {
            const firestoreData = docSnapshot.data() as DocumentData;
            const recipeData: Recipe = {
              id: docSnapshot.id,
              recipeName: firestoreData.recipeName || '',
              rating: firestoreData.rating || 0,
              numberOfRatings: firestoreData.numberOfRating || 0,
              userImage: firestoreData.userImage,
              recipeDescription: firestoreData.recipeDescription || '',
              recipeIngredient: firestoreData.recipeIngredient || [],
              recipeSteps: firestoreData.recipeSteps || [],
              recipeCategory: firestoreData.recipeCategory || '',
              recipeDuration: firestoreData.recipeDuration || '',
              img: firestoreData.img,
              userEmail: firestoreData.userEmail,
              favoriteCount: firestoreData.favoriteCount || 0,
            };
            console.log('Online recipe data:', recipeData);
            setRecipe(recipeData);

            const ownerEmail = recipeData.userEmail || 'Anonymous';
            const ownerName = await fetchUserName(ownerEmail);
            setRecipeOwnerName(ownerName);

            const currentUserName = await fetchUserName(userEmail || 'Anonymous');
            setCurrentUserName(currentUserName);

            const favoriteDoc = await getDoc(favoriteRef);
            setIsFavorite(favoriteDoc.exists());
          } else {
            console.log('No such recipe!');
            setRecipe(null);
          }
          setLoading(false);
        }, (error) => {
          console.error('Error fetching recipe:', error);
          setLoading(false);
        });

        return () => unsubscribe();
      }  else {
        // Fetch offline from SQLite if offline
        const offlineRecipe = await fetchRecipeFromSQLite(recipeId);
        setRecipe(offlineRecipe);
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [recipeId, isOnline]);

  const fetchUserName = async (email: string): Promise<string> => {
    if (!isOnline) return 'Offline Mode';
    try {
      const userRef = doc(db, 'users', email);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        return userSnap.data().name || 'Anonymous';
      }
      return 'Anonymous';
    } catch (error) {
      console.error('Error fetching user name:', error);
      return 'Anonymous';
    }
  };

  const logSQLiteData = useCallback(async () => {
    try {
      console.log('Logging all data stored in SQLite');
      const db = await openDatabase();
      const [results] = await db.executeSql('SELECT * FROM favorites');
      const rows = results.rows.raw();
      
      console.log(`Total favorites stored: ${rows.length}`);
      
      rows.forEach((row, index) => {
        const recipeData = JSON.parse(row.data);
        console.log(`\nFavorite #${index + 1}:`);
        console.log('ID:', recipeData.id);
        console.log('Name:', recipeData.recipeName);
        console.log('Description:', recipeData.description);
        console.log('Ingredients:', recipeData.ingredients);
        console.log('Steps:', recipeData.steps);
        console.log('Category:', recipeData.category);
        console.log('Duration:', recipeData.duration);
        console.log('Image URI:', recipeData.imageUri);
        console.log('Created At:', recipeData.createdAt);
      });
      
      console.log('Finished logging SQLite data');
    } catch (error) {
      console.error('Error logging SQLite data:', error);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log('Network status changed:', state.isConnected);
      setIsOnline(state.isConnected ?? false);
      if (!state.isConnected) {
        logSQLiteData(); // Log the data when going offline
      }
    });
  
    return () => unsubscribe();
  }, [logSQLiteData]);
  const handleFavoritePress = useCallback(async () => {
    if (!isOnline) {
      Alert.alert('Offline Mode', 'You cannot modify favorites while offline.');
      return;
    }

    if (!userEmail) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    const favoriteRef = doc(db, 'favorites', `${userEmail}_${recipeId}`);
    const recipeRef = doc(db, 'recipes', recipeId);

    try {
      await runTransaction(db, async (transaction) => {
        const recipeDoc = await transaction.get(recipeRef);

        if (!recipeDoc.exists()) {
          throw new Error("Recipe does not exist!");
        }

        const currentFavoriteCount = recipeDoc.data().favoriteCount || 0;

        if (isFavorite) {
          transaction.delete(favoriteRef);
          transaction.update(recipeRef, { favoriteCount: Math.max(currentFavoriteCount - 1, 0) });
        } else {
          transaction.set(favoriteRef, { userEmail, recipeId });
          transaction.update(recipeRef, { favoriteCount: currentFavoriteCount + 1 });
        }
      });

      setIsFavorite((prev) => !prev);
      setRecipe((prev) => {
        if (prev) {
          return {
            ...prev,
            favoriteCount: isFavorite
              ? Math.max((prev.favoriteCount || 0) - 1, 0)
              : (prev.favoriteCount || 0) + 1
          };
        }
        return prev;
      });

      console.log(`Recipe ${recipeId} ${isFavorite ? 'unfavorited' : 'favorited'} successfully`);
      Alert.alert('Success', `Recipe ${isFavorite ? 'unfavorited' : 'favorited'} successfully`);
    } catch (error) {
      console.error('Error updating favorite status:', error);
      Alert.alert('Error', 'Failed to update favorite status. Please try again.');
    }
  }, [userEmail, recipeId, isFavorite, isOnline]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.container}>
        <Text>Recipe not found</Text>
      </View>
    );
  }

  const canEdit = isOnline && userEmail === recipe.userEmail;
  const chefName = `Chef ${recipeOwnerName}`;

  return (
    <FlatList
      style={styles.container}
      data={[]}
      ListHeaderComponent={
        <View>
          {!isOnline && <Text style={styles.offlineNotice}>Offline Mode</Text>}
          <RecipeDetailsHeader
            user={chefName}
            profilePic={recipe.userImage || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'}
            onBackPress={() => navigation.goBack()}
            showEditButton={canEdit}
            handleEditPress={() => {
              if (canEdit) {
                navigation.navigate('EditPost', { recipeId: recipe.id });
              }
            }}
            favorite={isFavorite}
            onFavoritePress={handleFavoritePress}
          />
          <Image source={{ uri: recipe.imageUri || recipe.img || '' }} style={styles.image} />
          <RecipeDetailsSection
            recipeName={recipe.recipeName || recipe.name || ''}
            rating={recipe.rating || 0}
            numberOfRatings={recipe.numberOfRatings || recipe.numberOfRating || 0}
            description={recipe.recipeDescription || ''}
            ingredients={recipe.recipeIngredient || []}
            steps={recipe.recipeSteps || []}
            category={recipe.recipeCategory || recipe.category || ''}
            duration={recipe.recipeDuration || ''}
          />
          <Text style={styles.sectionHeader}>Reviews</Text>
          {isOnline ? (
            <RecipeDetailsReview recipeId={recipe.id} userEmail={userEmail ?? null} />
          ) : (
            <Text style={styles.offlineNotice}>Reviews are not available offline</Text>
          )}
        </View>
      }
      renderItem={null}
      keyExtractor={(_, index) => index.toString()}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 400,
    resizeMode: 'cover',
  },
  sectionHeader: {
    fontSize: 24,
    color: '#F26419',
    backgroundColor: '#FCE7CC',
    paddingLeft: '4%',
  },
  chefDisplay: {
    padding: 10,
    backgroundColor: '#e0e0e0',
    color: '#333',
    fontSize: 14,
  },
  offlineNotice: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: 10,
    textAlign: 'center',
    fontSize: 16,
  },
});

export default RecipeDetails;