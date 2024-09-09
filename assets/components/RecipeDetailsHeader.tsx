import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import Ionicon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

type RecipeDetailsHeaderProps = {
  user: string;
  profilePic: string;
  onBackPress: () => void;
  showEditButton: boolean;
  handleEditPress: () => void;
  favorite: boolean;
  onFavoritePress: () => void;
};

const RecipeDetailsHeader: React.FC<RecipeDetailsHeaderProps> = ({
  user,
  profilePic,
  onBackPress,
  showEditButton,
  handleEditPress,
  favorite,
  onFavoritePress
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <TouchableOpacity onPress={onBackPress}>
            <Ionicon name="chevron-back-outline" size={30} />
          </TouchableOpacity>
          <Image source={{uri: profilePic}} style={styles.profilePic} />
          <Text style={styles.headerInput}>{user}</Text>
        </View>
        <View style={styles.rightSection}>
          {showEditButton && (
            <TouchableOpacity
              onPress={handleEditPress}
              style={styles.headerButton}>
              <MaterialCommunityIcons name="pencil" size={25} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={onFavoritePress}
            style={styles.headerButton}>
            <MaterialCommunityIcons
              name="heart"
              size={25}
              color={favorite ? 'red' : '#FFFFFF'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 40,
    backgroundColor: '#F26419',
    borderBottomWidth: 1,
    borderBottomColor: '#F26419',
    justifyContent: 'center',
  },
  profilePic: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginLeft: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  headerInput: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EBEBEB',
    marginHorizontal: 10,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginRight: 10,
  },
});

export default RecipeDetailsHeader;
