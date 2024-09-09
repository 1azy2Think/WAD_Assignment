import React from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const UserProfile = (props: any) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={props.onFeedbackPress}
            style={styles.headerButton}>
            <Icon name="feedback" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={props.onLogoutPress}
            style={styles.headerButton}>
            <Icon name="logout" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.profileContainer}>
        <Image source={{uri: props.profilePic}} style={styles.profilePic} />
        <View style={styles.userInfo}>
          <Text style={styles.username}>{props.username}</Text>
          <Text style={styles.userDetails}>Posts: {props.numberOfPosts}</Text>
          <Text style={styles.userDetails}>Joined on: {props.joinDate}</Text>
        </View>
      </View>
      <View style={styles.bioContainer}>
        <Text style={styles.userDetails}>
        {props.bio}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.editProfileButton}
        onPress={props.onEditProfilePress}>
        <Text style={styles.editProfileText}>Edit Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 0.2,
    padding: '3%',
    backgroundColor: '#FFBF69',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: '2%',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    paddingLeft: 10,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '2%',
    marginHorizontal: '8%',
  },
  profilePic: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: '5%',
    borderWidth: 2,
    borderColor: 'gray',
  },
  userInfo: {
    flex: 1,
  },
  bioContainer: {
    flex: 1,
    marginVertical: '3%',
    marginHorizontal: '8%',
  },
  username: {
    fontSize: 20,
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userDetails: {
    fontSize: 14,
    color: '#333',
  },
  editProfileButton: {
    marginTop: '2%',
    alignSelf: 'flex-end',
    paddingVertical: '2%',
    paddingHorizontal: '4%',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'gray',
  },
  editProfileText: {
    color: 'white',
    fontSize: 14,
  },
});

export default UserProfile;
