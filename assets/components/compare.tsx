import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  Profile: { userEmail: string };
  EditProfile: undefined;
  WelcomeScreen: undefined;
  RecipeDetails: { recipeId: string };
};

type ProfileScreenRouteProp = RouteProp<RootStackParamList, 'Profile'>;
type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList>;

type Recipe = {
  id: string;
  recipeName: string;
  recipeDescription: string;
  recipeCategory: string;
  userEmail: string;
  // Add other fields as necessary
};

const Profile: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const route = useRoute<ProfileScreenRouteProp>();
  const { userEmail } = route.params;

  const [userData, setUserData] = useState<any>(null);
  const [userRecipes, setUserRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, 'users', userEmail);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          console.error('No such user!');
        }

        const recipesQuery = query(
          collection(db, 'recipes'),
          where('userEmail', '==', userEmail)
        );
        const querySnapshot = await getDocs(recipesQuery);
        const recipes = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Recipe[];

        setUserRecipes(recipes);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userEmail]);

  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'WelcomeScreen' }],
    });
  };

  const navigateToRecipeDetails = (recipeId: string) => {
    navigation.navigate('RecipeDetails', { recipeId });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFA500" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        <View style={styles.horizontalLayout}>
          <Image
            source={{ uri: userData?.profilePic || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" }}
            style={styles.profilePic}
          />
          <View style={styles.userInfoContainer}>
            <Text style={styles.username}>{userData?.name || "John Doe"}</Text>
            <Text style={styles.userInfo}>Posts: {userRecipes.length}</Text>
            <Text style={styles.userInfo}>Joined on: {userData?.joinDate || "Unknown"}</Text>
          </View>
        </View>
        <Text style={styles.description}>{userData?.description || "No description available."}</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.postsSection}>
        <Text style={styles.sectionTitle}>Posts</Text>
      </View>
      <View style={styles.recipeCardsContainer}>
        {userRecipes.map((recipe) => (
          <TouchableOpacity 
            key={recipe.id} 
            style={styles.recipeCard}
            onPress={() => navigateToRecipeDetails(recipe.id)}
          >
            <Text style={styles.recipeName}>{recipe.recipeName}</Text>
            <Text style={styles.recipeDescription}>{recipe.recipeDescription}</Text>
            <Text style={styles.recipeCategory}>{recipe.recipeCategory}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCE7CC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    padding: 20,
    backgroundColor: '#FFA500',
  },
  logoutButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  logoutText: {
    color: '#FF0000',
    fontWeight: 'bold',
  },
  horizontalLayout: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  profilePic: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginLeft: 15,
    marginRight: 15,
  },
  userInfoContainer: {
    flex: 1,
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  userInfo: {
    fontSize: 14,
    color: '#000',
    marginBottom: 3,
  },
  description: {
    fontSize: 14,
    color: '#000',
    marginTop: 15,
    marginLeft: 15,
    marginBottom: 15,
  },
  editButton: {
    backgroundColor: '#D2B48C',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'flex-end',
  },
  editButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  postsSection: {
    padding: 15,
    backgroundColor: '#F26419',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  recipeCardsContainer: {
    backgroundColor: '#FCE7CC',
    paddingTop: 15,
    paddingHorizontal: 15,
  },
  recipeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  recipeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  recipeCategory: {
    fontSize: 12,
    color: '#888',
  },
});

export default Profile;