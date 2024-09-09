import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { collection, addDoc, getDocs, query, where, Timestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

type Review = {
  id: string;
  username: string;
  comment: string;
  rating: number;
  createdAt: Timestamp;
};

const RecipeDetailsReview = ({ recipeId, userEmail }: { recipeId: string, userEmail: string | null }) => {
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [username, setUsername] = useState('');

  useEffect(() => {
    fetchReviews();
    fetchUsername();
  }, [recipeId, userEmail]);

  const fetchUsername = async () => {
    if (userEmail) {
      try {
        const userDoc = await getDoc(doc(db, 'users', userEmail));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUsername(userData.name || userEmail);
        } else {
          setUsername(userEmail);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUsername(userEmail);
      }
    } else {
      setUsername('Anonymous User');
    }
  };

  const fetchReviews = async () => {
    try {
      const reviewsRef = collection(db, 'reviews');
      const q = query(reviewsRef, where('recipeId', '==', recipeId));
      const querySnapshot = await getDocs(q);
      const fetchedReviews: Review[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<Review, 'id'>
      }));
      setReviews(fetchedReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const submitReview = async () => {
    if (isValidReview()) {
      try {
        // Add the new review
        const newReview = {
          recipeId,
          username,
          comment: newComment,
          rating,
          createdAt: Timestamp.now(),
        };
        const docRef = await addDoc(collection(db, 'reviews'), newReview);
        setReviews([...reviews, { id: docRef.id, ...newReview }]);

        // Update the recipe's rating information
        const recipeRef = doc(db, 'recipes', recipeId);
        const recipeDoc = await getDoc(recipeRef);
        
        if (recipeDoc.exists()) {
          const recipeData = recipeDoc.data();
          const currentNumberOfRatings = recipeData.numberOfRating || 0;
          const currentTotalRating = recipeData.totalRating || 0;

          const newNumberOfRatings = currentNumberOfRatings + 1;
          const newTotalRating = currentTotalRating + rating;
          const newAverageRating = newTotalRating / newNumberOfRatings;

          await updateDoc(recipeRef, {
            numberOfRating: newNumberOfRatings,
            totalRating: newTotalRating,
            rating: newAverageRating,
          });
        }

        // Reset the form
        setNewComment('');
        setRating(0);
      } catch (error) {
        console.error('Error adding review or updating recipe:', error);
      }
    }
  };

  const isValidReview = () => {
    return newComment.trim() !== '' && rating > 0;
  };

  const renderStars = (rating: number, editable: boolean) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      let iconName = 'star-outline';
      if (i <= Math.floor(rating)) {
        iconName = 'star';
      } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
        iconName = 'star-half';
      }

      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => editable && setRating(i)}
          style={styles.starButton}
          disabled={!editable}>
          <MaterialCommunityIcons
            name={iconName}
            size={18}
            color={i <= rating ? 'gold' : '#AAAAAA'}
          />
        </TouchableOpacity>,
      );
    }
    return stars;
  };

  const renderReview = ({ item }: { item: Review }) => (
    <View style={styles.reviewContainer}>
      <Text style={styles.username}>{item.username}</Text>
      <View style={styles.ratingContainer}>
        {renderStars(item.rating, false)}
      </View>
      <Text style={styles.comment}>{item.comment}</Text>
      <Text style={styles.date}>{item.createdAt.toDate().toLocaleDateString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <View style={styles.ratingContainer}>
          <Text style={styles.label}>Rating:</Text>
          {renderStars(rating, true)}
        </View>
        <TextInput
          style={styles.textInput}
          placeholder="Write your review..."
          placeholderTextColor="#aaa"
          value={newComment}
          onChangeText={setNewComment}
        />
        <TouchableOpacity
          onPress={submitReview}
          style={[styles.submitButton, { opacity: isValidReview() ? 1 : 0.6 }]}
          disabled={!isValidReview()}>
          <Text style={styles.submitButtonText}>Comment</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={reviews}
        renderItem={renderReview}
        keyExtractor={item => item.id}
        style={styles.reviewsList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FCE7CC',
  },
  inputContainer: {
    marginBottom: 16,
  },
  textInput: {
    height: 60,
    borderColor: '#AAA',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 8,
    backgroundColor: '#eee',
    color: 'gray',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  starButton: {
    marginHorizontal: 2,
  },
  submitButton: {
    backgroundColor: '#F26419',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  reviewsList: {
    marginTop: 16,
  },
  reviewContainer: {
    marginBottom: 16,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'gray',
  },
  comment: {
    fontSize: 14,
    color: 'gray',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'gray',
    paddingRight: 10,
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});

export default RecipeDetailsReview;