import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, RefreshControl, ScrollView, Text, Alert, PermissionsAndroid, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Header from '../assets/components/Header';
import RecipeCards from '../assets/components/RecipeCards';
import SearchBar from '../assets/components/SearchBar';
import SortByFilterBar from '../assets/components/SortByFilterBar';
import CategoryFilterBar from '../assets/components/CategoryFilterBar';
import { collection, doc, query, where, onSnapshot, runTransaction, Unsubscribe, getDoc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { db } from '../firebaseConfig';
import SQLite from 'react-native-sqlite-storage';
import RNFS from 'react-native-fs';
import NetInfo from '@react-native-community/netinfo';

type FavListRouteParams = {
  userEmail?: string;
};

type Recipe = {
  id: string;
  imageUri: string;
  name: string;
  recipeName: string;
  rating: number;
  numberOfRatings: number;
  numberOfRating: number;
  favorite: boolean;
  user: string;
  category: string;
  recipeCategory: string;
  createdAt: Date;
  favoriteCount: number;
  userEmail: string;
  recipeDescription: string;
  recipeIngredient: string[];
  recipeSteps: string[];
  recipeDuration: string;
  img?: string;
};

type UserInfo = {
  name: string;
  email: string;
};

const NoFavoritesMessage: React.FC<{ message: string }> = ({ message }) => (
  <View style={styles.noFavoritesContainer}>
    <Text style={styles.noFavoritesText}>{message}</Text>
  </View>
);

const DB_NAME = 'favorites.sqlite';
const IMAGE_DIR = `${RNFS.DocumentDirectoryPath}/recipe_images/`;

SQLite.enablePromise(true);

const openDatabase = async () => {
  console.log('Opening database');
  return SQLite.openDatabase({
    name: DB_NAME,
    location: 'default',
  });
};

const setupDatabase = async () => {
  console.log('Setting up database');
  const db = await openDatabase();
  await db.executeSql(
    'CREATE TABLE IF NOT EXISTS favorites (id TEXT PRIMARY KEY, data TEXT)'
  );
  console.log('Database setup complete');
};

const ensureImageDirExists = async () => {
  console.log('Ensuring image directory exists');
  const exists = await RNFS.exists(IMAGE_DIR);
  if (!exists) {
    await RNFS.mkdir(IMAGE_DIR);
    console.log('Image directory created');
  } else {
    console.log('Image directory already exists');
  }
};

const requestStoragePermission = async () => {
  if (Platform.OS !== 'android') return true;

  try {
    console.log('Requesting storage permission');
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
    );
    console.log('Storage permission granted:', granted === PermissionsAndroid.RESULTS.GRANTED);
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn('Error requesting storage permission:', err);
    return false;
  }
};

const Favlist: React.FC = () => {
  const route = useRoute<RouteProp<Record<string, FavListRouteParams>, string>>();
  const navigation = useNavigation<StackNavigationProp<any>>();
  const userEmail = route.params?.userEmail;
  
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [userInfoCache, setUserInfoCache] = useState<Record<string, UserInfo>>({});
  const [isOnline, setIsOnline] = useState(true);

  const fetchUserInfo = useCallback(async (email: string): Promise<UserInfo> => {
    try {
      if (userInfoCache[email]) {
        console.log('User info found in cache:', email);
        return userInfoCache[email];
      }

      console.log('Fetching user info from Firestore:', email);
      const userDoc = await getDoc(doc(db, 'users', email));
      const userData = userDoc.data() as UserInfo | undefined;
    
      if (userData) {
        console.log('User info fetched successfully:', email);
        setUserInfoCache(prev => ({ ...prev, [email]: userData }));
        return userData;
      }
    
      console.log('User info not found, using default:', email);
      return { name: 'Unknown Chef', email };
    } catch (error) {
      console.error('Error fetching user info:', error);
      return { name: 'Unknown Chef', email };
    }
  }, [userInfoCache]);

  const saveRecipeLocally = useCallback(async (recipe: Recipe) => {
    try {
      console.log('Saving recipe locally:', recipe.id);
      const db = await openDatabase();
      
      const recipeToSave = {
        id: recipe.id,
        recipeName: recipe.recipeName || recipe.name || '',
        name: recipe.name || recipe.recipeName || '',
        rating: recipe.rating || 0,
        numberOfRatings: recipe.numberOfRatings || recipe.numberOfRating || 0,
        numberOfRating: recipe.numberOfRating || recipe.numberOfRatings || 0,
        recipeDescription: recipe.recipeDescription || '',
        recipeIngredient: recipe.recipeIngredient || [],
        recipeSteps: recipe.recipeSteps || [],
        recipeCategory: recipe.recipeCategory || recipe.category || '',
        category: recipe.category || recipe.recipeCategory || '',
        recipeDuration: recipe.recipeDuration || '',
        imageUri: recipe.imageUri || recipe.img || '',
        img: recipe.img || recipe.imageUri || '',
        userEmail: recipe.userEmail || '',
        favoriteCount: recipe.favoriteCount || 0,
        createdAt: recipe.createdAt ? recipe.createdAt.toISOString() : new Date().toISOString(),
        user: recipe.user || '',
      };

      // Logging the data before saving
      console.log('Saving this recipe data to SQLite:', recipeToSave);
  
      const recipeData = JSON.stringify(recipeToSave);
      
      await db.executeSql('INSERT OR REPLACE INTO favorites (id, data) VALUES (?, ?)', [recipe.id, recipeData]);  
      
      if (recipeToSave.imageUri) {
        const localImagePath = `${IMAGE_DIR}${recipe.id}.jpg`;
        
        try {
          let imageUrl = recipeToSave.imageUri;
          
          if (imageUrl.startsWith('gs://')) {
            const storage = getStorage();
            const imageRef = ref(storage, imageUrl);
            imageUrl = await getDownloadURL(imageRef);
          }
          
          if (imageUrl.startsWith('http') || imageUrl.startsWith('https')) {
            const downloadResult = await RNFS.downloadFile({
              fromUrl: imageUrl,
              toFile: localImagePath,
            }).promise;
            
            if (downloadResult.statusCode === 200) {
              console.log('Image downloaded successfully:', localImagePath);
            } else {
              throw new Error(`Failed to download image: ${downloadResult.statusCode}`);
            }
          } else if (imageUrl.startsWith('file://')) {
            await RNFS.copyFile(imageUrl, localImagePath);
            console.log('Image copied successfully:', localImagePath);
          }
          
          const updatedRecipe = { ...recipeToSave, imageUri: localImagePath, img: localImagePath };
          await db.executeSql('UPDATE favorites SET data = ? WHERE id = ?', [JSON.stringify(updatedRecipe), recipe.id]);
          console.log('Recipe updated with local image path:', localImagePath);
        } catch (imageError) {
          console.error('Error saving image locally:', imageError);
          
          const updatedRecipe = { ...recipeToSave, imageUri: '', img: '' };
          await db.executeSql('UPDATE favorites SET data = ? WHERE id = ?', [JSON.stringify(updatedRecipe), recipe.id]);
          console.log('Recipe saved without image due to error');
        }
      }
      
      console.log('Recipe saved locally successfully:', recipe.id);
    } catch (error) {
      console.error('Error saving recipe locally:', error);
    }
  }, []);

  const removeRecipeLocally = useCallback(async (recipeId: string) => {
    try {
      console.log('Removing recipe locally:', recipeId);
      const db = await openDatabase();
      await db.executeSql('DELETE FROM favorites WHERE id = ?', [recipeId]);

      const localImagePath = `${IMAGE_DIR}${recipeId}.jpg`;
      await RNFS.unlink(localImagePath).catch(() => {});
      console.log('Recipe removed locally successfully:', recipeId);
    } catch (error) {
      console.error('Error removing recipe locally:', error);
    }
  }, []);

  const syncLocalFavorites = useCallback(async (onlineFavorites: Recipe[]) => {
    try {
      console.log('Syncing local favorites with online data');
      const db = await openDatabase();
      const [results] = await db.executeSql('SELECT id FROM favorites');
      const localFavoriteIds = results.rows.raw().map(row => row.id);
      
      // Remove local favorites that are no longer in online favorites
      for (const localId of localFavoriteIds) {
        if (!onlineFavorites.some(recipe => recipe.id === localId)) {
          await removeRecipeLocally(localId);
        }
      }

      // Update or add online favorites to local storage
      for (const onlineRecipe of onlineFavorites) {
        await saveRecipeLocally(onlineRecipe);
      }

      console.log('Local favorites synced successfully');
    } catch (error) {
      console.error('Error syncing local favorites:', error);
    }
  }, [removeRecipeLocally, saveRecipeLocally]);
  
  const loadLocalFavorites = useCallback(async () => {
    try {
      console.log('Loading local favorites');
      const db = await openDatabase();
      const [results] = await db.executeSql('SELECT * FROM favorites');
      const rows = results.rows.raw();
      const recipes = rows.map(row => JSON.parse(row.data));
      console.log('Local favorites loaded successfully, count:', recipes.length);
      return recipes;
    } catch (error) {
      console.error('Error loading local favorites:', error);
      return [];
    }
  }, []);

  const handleFavoriteToggle = useCallback(async (recipeId: string, newFavoriteStatus: boolean) => {
    if (!userEmail) {
      console.log('No user email, cannot toggle favorite');
      return;
    }

    try {
      console.log('Toggling favorite:', recipeId, newFavoriteStatus);
      if (isOnline) {
        await runTransaction(db, async (transaction) => {
          const favoriteRef = doc(db, 'favorites', `${userEmail}_${recipeId}`);
          const recipeRef = doc(db, 'recipes', recipeId);
          const recipeDoc = await transaction.get(recipeRef);

          if (!recipeDoc.exists()) {
            throw new Error("Recipe does not exist!");
          }

          const currentFavoriteCount = recipeDoc.data().favoriteCount || 0;

          if (newFavoriteStatus) {
            transaction.set(favoriteRef, { userEmail, recipeId });
            transaction.update(recipeRef, { favoriteCount: currentFavoriteCount + 1 });
            
            // Fetch full recipe data and save locally
            const fullRecipeData = {
              ...recipeDoc.data(),
              id: recipeDoc.id,
              createdAt: recipeDoc.data().createdAt?.toDate() || new Date(),
            } as Recipe;
            await saveRecipeLocally(fullRecipeData);
          } else {
            transaction.delete(favoriteRef);
            transaction.update(recipeRef, { favoriteCount: Math.max(currentFavoriteCount - 1, 0) });
            await removeRecipeLocally(recipeId);
          }
        });
        console.log('Online favorite toggle completed');
      } else {
        // Handle offline favorite toggle
        if (newFavoriteStatus) {
          Alert.alert('Offline Mode', 'Cannot add new favorites while offline.');
          return;
        } else {
          await removeRecipeLocally(recipeId);
        }
      }

      setRecipes(prevRecipes => 
        prevRecipes.map(r => 
          r.id === recipeId ? { ...r, favorite: newFavoriteStatus } : r
        ).filter(r => r.favorite || isOnline)
      );

      console.log('Favorite toggled successfully');
      Alert.alert('Success', newFavoriteStatus ? 'Recipe favorited successfully' : 'Recipe unfavorited successfully');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert("Error", "Unable to update favorite status. Please try again later.");
    }
  }, [userEmail, isOnline, saveRecipeLocally, removeRecipeLocally]);

  useEffect(() => {
    const setup = async () => {
      try {
        console.log('Setting up database and permissions');
        const hasPermission = await requestStoragePermission();
        if (hasPermission) {
          await setupDatabase();
          await ensureImageDirExists();
          console.log('Setup completed successfully');
        } else {
          console.log('Storage permission denied');
          Alert.alert("Permission Denied", "The app needs storage permission to save recipes offline.");
        }
      } catch (error) {
        console.error('Error during setup:', error);
      }
    };
    setup();

    const unsubscribe = NetInfo.addEventListener(state => {
      console.log('Network status changed:', state.isConnected);
      setIsOnline(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userEmail) {
      console.log('No user email, skipping favorite setup');
      return;
    }
  
    let unsubscribeFavorites: Unsubscribe;
    let unsubscribeRecipes: Unsubscribe;
  
    const setupListeners = async () => {
      try {
        console.log('Setting up listeners, online status:', isOnline);
        if (isOnline) {
          const favoritesRef = collection(db, 'favorites');
          const favoritesQuery = query(favoritesRef, where('userEmail', '==', userEmail));
  
          unsubscribeFavorites = onSnapshot(favoritesQuery, async (favoritesSnapshot) => {
            console.log('Favorites snapshot received, count:', favoritesSnapshot.docs.length);
            const favoriteIds = favoritesSnapshot.docs.map(doc => doc.data().recipeId);
  
            if (favoriteIds.length === 0) {
              console.log('No favorites found');
              setRecipes([]);
              await syncLocalFavorites([]);
              return;
            }
  
            const recipesRef = collection(db, 'recipes');
            const recipesQuery = query(recipesRef, where('__name__', 'in', favoriteIds));
  
            unsubscribeRecipes = onSnapshot(recipesQuery, async (recipesSnapshot) => {
              console.log('Recipes snapshot received, count:', recipesSnapshot.docs.length);
              const recipesData: Recipe[] = await Promise.all(recipesSnapshot.docs.map(async (doc) => {
                try {
                  const data = doc.data();
                  console.log('Fetched Firebase data for recipe:', data);  // Logging Firebase data
                  
                  const userInfo = await fetchUserInfo(data.userEmail);
                  
                  return {
                    id: doc.id,
                    imageUri: data.img || '',
                    name: data.recipeName || '',  
                    rating: data.rating || 0,
                    numberOfRatings: data.numberOfRating || 0,
                    favorite: true,
                    user: `Chef ${userInfo.name}`,
                    category: data.recipeCategory || '',  
                    createdAt: data.createdAt?.toDate() || new Date(),
                    favoriteCount: data.favoriteCount || 0,
                    userEmail: data.userEmail,
                    recipeDescription: data.recipeDescription || '',  
                    recipeIngredient: data.recipeIngredient || [],    
                    recipeSteps: data.recipeSteps || [],              
                    recipeDuration: data.recipeDuration || '',        
                  };
                } catch (error) {
                  console.error('Error processing recipe:', doc.id, error);
                  return null;
                }
              }));
  
              const validRecipes = recipesData.filter((recipe): recipe is Recipe => recipe !== null);
              console.log('Setting recipes, count:', validRecipes.length);
              setRecipes(validRecipes);
              await syncLocalFavorites(validRecipes);
            });
          });
        } else {
          const localFavorites = await loadLocalFavorites();
          console.log('Setting local favorites, count:', localFavorites.length);
          setRecipes(localFavorites);
        }
      } catch (error) {
        console.error('Error setting up listeners:', error);
      }
    };
  
    setupListeners();
  
    return () => {
      console.log('Cleaning up listeners');
      if (unsubscribeFavorites) unsubscribeFavorites();
      if (unsubscribeRecipes) unsubscribeRecipes();
    };
  }, [userEmail, fetchUserInfo, isOnline, loadLocalFavorites, syncLocalFavorites]);

  const filteredAndSortedRecipes = useMemo(() => {
    console.log('Filtering and sorting recipes');
    let result = recipes;

    if (selectedCategory && selectedCategory !== 'All') {
      result = result.filter(recipe => recipe.category === selectedCategory);
    }

    if (searchText) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(recipe => recipe.name.toLowerCase().includes(searchLower));
    }

    if (selectedSort) {
      switch (selectedSort) {
        case 'latest':
          result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          break;
        case 'earliest':
          result.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
          break;
        case 'rating':
          result.sort((a, b) => b.rating - a.rating);
          break;
        case 'favouriteCount':
          result.sort((a, b) => b.favoriteCount - a.favoriteCount);
          break;
      }
    }

    console.log('Filtered and sorted recipes count:', result.length);
    return result;
  }, [recipes, selectedCategory, searchText, selectedSort]);

  const onRefresh = useCallback(() => {
    console.log('Refreshing favorites');
    setRefreshing(true);
    // The real-time listeners will automatically update the data
    setTimeout(() => {
      setRefreshing(false);
      console.log('Refresh complete');
    }, 1000);
  }, []);

  const handleCategorySelect = useCallback((category: string | null) => {
    console.log('Category selected:', category);
    setSelectedCategory(category);
  }, []);

  const handleSortSelect = useCallback((sort: string | null) => {
    console.log('Sort selected:', sort);
    setSelectedSort(sort);
  }, []);

  const handleSearchChange = useCallback((text: string) => {
    console.log('Search text changed:', text);
    setSearchText(text);
  }, []);

  const handleRecipePress = useCallback((recipeId: string) => {
    navigation.navigate('RecipeDetails', { recipeId, userEmail });
  }, [navigation, userEmail]);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Header label={`Favorites ${isOnline ? '(Online)' : '(Offline)'}`} />
        <SearchBar
          searchText={searchText}
          onSearchChange={handleSearchChange}
        />
        <SortByFilterBar
          selectedSort={selectedSort}
          onSelectSort={handleSortSelect}
        />
        <CategoryFilterBar
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
        />
        {recipes.length > 0 ? (
          filteredAndSortedRecipes.length > 0 ? (
            <RecipeCards 
              data={filteredAndSortedRecipes} 
              onRecipePress={handleRecipePress}
              onFavoritePress={handleFavoriteToggle}
              isOnline={isOnline}
            />
          ) : (
            <NoFavoritesMessage message="No recipes match your current filters" />
          )
        ) : (
          <NoFavoritesMessage message="No Favorite Recipes" />
        )}
      </ScrollView>
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
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  noFavoritesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  noFavoritesText: {
    fontSize: 18,
    color: '#888',
    fontWeight: 'bold',
  },
});

export default Favlist;
