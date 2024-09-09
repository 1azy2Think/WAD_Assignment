import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, RefreshControl, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Header from '../assets/components/Header';
import RecipeCards from '../assets/components/RecipeCards';
import SearchBar from '../assets/components/SearchBar';
import SortByFilterBar from '../assets/components/SortByFilterBar';
import CategoryFilterBar from '../assets/components/CategoryFilterBar';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NetInfo from '@react-native-community/netinfo';
import { collection, getDocs, doc, query, where, setDoc, deleteDoc, runTransaction, getDoc, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '../firebaseConfig';

type HomeRouteParams = {
  userEmail?: string;
};

type Recipe = {
  id: string;
  imageUri: string;
  name: string;
  rating: number;
  numberOfRatings: number;
  favorite: boolean;
  user: string;
  category: string;
  createdAt: Date;
  favoriteCount: number;
  userEmail: string;
};

type UserInfo = {
  name: string;
  email: string;
};

const Home = () => {
  const route = useRoute<RouteProp<Record<string, HomeRouteParams>, string>>();
  const navigation = useNavigation<StackNavigationProp<any>>();
  const userEmail = route.params?.userEmail;

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [isOnline, setIsOnline] = useState(true); // Initialize online status
  const [userFavorites, setUserFavorites] = useState<Set<string>>(new Set());
  const [userInfoCache, setUserInfoCache] = useState<Record<string, UserInfo>>({});

  // Effect to listen to network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false); // Update the isOnline state when network status changes
    });

    // Clean up listener on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  const handleFavoriteToggle = useCallback(async (recipeId: string, newFavoriteStatus: boolean) => {
    if (!userEmail) return;

    try {
      await runTransaction(db, async (transaction) => {
        const favoriteRef = doc(db, 'favorites', `${userEmail}_${recipeId}`);
        const recipeRef = doc(db, 'recipes', recipeId);
        const recipeDoc = await transaction.get(recipeRef);

        if (!recipeDoc.exists()) {
          throw "Recipe does not exist!";
        }

        const currentFavoriteCount = recipeDoc.data().favoriteCount || 0;

        if (newFavoriteStatus) {
          transaction.set(favoriteRef, { userEmail, recipeId });
          transaction.update(recipeRef, { 
            favoriteCount: currentFavoriteCount + 1 
          });
          setUserFavorites(prev => new Set(prev).add(recipeId));
          Alert.alert('Success', 'Recipe favorited successfully');
        } else {
          transaction.delete(favoriteRef);
          transaction.update(recipeRef, { 
            favoriteCount: Math.max(currentFavoriteCount - 1, 0)
          });
          setUserFavorites(prev => {
            const newSet = new Set(prev);
            newSet.delete(recipeId);
            return newSet;
          });
          Alert.alert('Success', 'Recipe unfavorited successfully');
        }
      });

      // Update local state
      setRecipes(prev => prev.map(recipe => 
        recipe.id === recipeId 
          ? {
              ...recipe, 
              favorite: newFavoriteStatus, 
              favoriteCount: newFavoriteStatus 
                ? (recipe.favoriteCount || 0) + 1 
                : Math.max((recipe.favoriteCount || 0) - 1, 0)
            } 
          : recipe
      ));

    } catch (error) {
      console.error('Error updating favorite status:', error);
    }
  }, [userEmail]);

  const fetchUserInfo = useCallback(async (email: string): Promise<UserInfo> => {
    if (userInfoCache[email]) {
      return userInfoCache[email];
    }

    const userDoc = await getDoc(doc(db, 'users', email));
    const userData = userDoc.data() as UserInfo | undefined;
    
    if (userData) {
      setUserInfoCache(prev => ({ ...prev, [email]: userData }));
      return userData;
    }
    
    return { name: 'Unknown Chef', email };
  }, [userInfoCache]);

  const fetchData = useCallback(async () => {
    if (!userEmail) return;

    try {
      const [recipesSnapshot, favoritesSnapshot] = await Promise.all([
        getDocs(query(collection(db, 'recipes'), where('userEmail', '!=', userEmail))), // Exclude current user's recipes
        getDocs(query(collection(db, 'favorites'), where('userEmail', '==', userEmail)))
      ]);

      const favoritesSet = new Set(favoritesSnapshot.docs.map(doc => doc.data().recipeId));
      setUserFavorites(favoritesSet);

      const recipesData: Recipe[] = await Promise.all(recipesSnapshot.docs.map(async (doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        const userInfo = await fetchUserInfo(data.userEmail);
        return {
          id: doc.id,
          imageUri: data.img || '',
          name: data.recipeName || '',
          rating: data.rating || 0,
          numberOfRatings: data.numberOfRating || 0,
          favorite: favoritesSet.has(doc.id),
          user: `Chef ${userInfo.name}`,
          category: data.recipeCategory,
          createdAt: data.createdAt?.toDate() || new Date(),
          favoriteCount: data.favoriteCount || 0,
          userEmail: data.userEmail,
        };
      }));

      setRecipes(recipesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [userEmail, fetchUserInfo]);

  const filteredAndSortedRecipes = useMemo(() => {
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

    return result;
  }, [recipes, selectedCategory, searchText, selectedSort]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useFocusEffect(useCallback(() => {
    fetchData();
  }, [fetchData]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const handleCreateNewRecipe = useCallback(() => {
    if (!isOnline) {
      Alert.alert('Error', 'You need to be online to create a new recipe');
      return;
    }
    navigation.navigate('NewPost', { userEmail });
  }, [navigation, userEmail, isOnline]);
  

  const handleCategorySelect = useCallback((category: string | null) => {
    setSelectedCategory(category);
  }, []);

  const handleSortSelect = useCallback((sort: string | null) => {
    setSelectedSort(sort);
  }, []);

  const handleSearchChange = (text: string) => {
    setSearchText(text);
  };

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
        <Header label="Tastier" />
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
        <RecipeCards 
          data={filteredAndSortedRecipes} 
          onRecipePress={handleRecipePress}
          onFavoritePress={handleFavoriteToggle}
          isOnline={isOnline}
        />
      </ScrollView>
      <TouchableOpacity style={styles.fab} onPress={handleCreateNewRecipe}>
        <Icon name="add" size={38} color="#fff" />
      </TouchableOpacity>
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
    paddingBottom: 80, // Add some bottom padding to avoid content being hidden behind the FAB
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ff6347',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8, // Increased elevation for better shadow on Android
    shadowColor: '#000', // Added shadow color for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default Home;
