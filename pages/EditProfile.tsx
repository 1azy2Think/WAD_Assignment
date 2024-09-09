import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Feather';
import Icons from 'react-native-vector-icons/Ionicons';
import { useRoute, RouteProp } from '@react-navigation/native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebaseConfig';

import InputField from '../assets/components/InputFieldWithValidation';
import DropdownComponent from '../assets/components/DropDownComponent';
import DesignedButton from '../assets/components/ButtonComponent';
import { popUpBox} from './style';

export const genderData = [
  { key: 'male', value: 'Male' },
  { key: 'female', value: 'Female' },
  { key: 'others', value: 'Others' },
  { key: 'rnts', value: 'Rather Not To Say' },
];

type EditProfileRouteParams = {
  userEmail: string;
};

const EditProfile = ({ navigation }: { navigation: any }) => {
  const route = useRoute<RouteProp<Record<string, EditProfileRouteParams>, string>>();
  const { userEmail } = route.params;

  const [profilePicture, setProfilePicture] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [retypePassword, setRetypePassword] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [changeMade, setChangeMade] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userDocRef = doc(db, 'users', userEmail);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setProfilePicture(userData.profilePicture || '');
          setName(userData.name || '');
          setGender(userData.gender || '');
          setPhone(userData.phone || '');
          setEmail(userData.email || '');
          setBio(userData.bio || '');
        } else {
          Alert.alert('Error', 'User profile not found');
          navigation.goBack();
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        Alert.alert('Error', 'Failed to load user profile');
      }
    };

    fetchUserProfile();
  }, [userEmail, navigation]);

  useEffect(() => {
    setChangeMade(
      profilePicture !== '' ||
      name !== '' ||
      gender !== '' ||
      phone !== '' ||
      email !== '' ||
      bio !== '' ||
      validateRetypePassword(retypePassword)
    );
  }, [
    profilePicture,
    name,
    gender,
    phone,
    email,
    bio,
    oldPassword,
    newPassword,
    retypePassword,
  ]);

  const handleProfilePictureEdit = () => {
    const options = {
      mediaType: 'photo' as const,
      quality: 1,
    };

    launchImageLibrary(options, async (response) => {
      if (response.assets && response.assets[0].uri) {
        setIsUploading(true);
        try {
          const imageUrl = await uploadImage(response.assets[0].uri);
          setProfilePicture(imageUrl);
        } catch (error) {
          console.error('Error uploading image:', error);
          Alert.alert('Error', 'Failed to upload image');
        } finally {
          setIsUploading(false);
        }
      }
    });
  };

  const uploadImage = async (uri: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const filename = `${userEmail}_${Date.now()}.jpg`;
    const storageRef = ref(storage, `profilePictures/${filename}`);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

  const validatePassword = (password: string) =>
    /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/.test(password);
  const validateRetypePassword = (password: string) =>
    password === newPassword && validatePassword(password);
  const passwordChecking = () => oldPassword === ''; // Adjust this check accordingly
  const validateAlphabet = (text: string) => /^[A-Za-z\s]+$/.test(text);

  const handleUpdateProfile = async () => {
    if (isUploading) {
      Alert.alert('Please wait', 'Image is still uploading');
      return;
    }

    try {
      const userDocRef = doc(db, 'users', userEmail);

      await updateDoc(userDocRef, {
        profilePicture,
        name,
        gender,
        phone,
        email,
        bio,
      });

      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const userDocRef = doc(db, 'users', userEmail);

      await updateDoc(userDocRef, {
        accountDelete: true,
      });

      Alert.alert('Success', 'Account marked for deletion');
      navigation.reset({
        index: 0,
        routes: [{ name: 'WelcomeScreen' }],
      });
    } catch (error) {
      console.error('Error marking account for deletion:', error);
      Alert.alert('Error', 'Failed to mark account for deletion');
    }
  };

  return (
    <ScrollView style={editProfile.container}>
      <View style={editProfile.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icons name="chevron-back-outline" size={30} />
        </TouchableOpacity>
        <Text style={editProfile.headerInput}>Edit Profile</Text>
      </View>
      <View style={editProfile.inputContainer}>
        <View style={editProfile.profilePictureContainer}>
          {profilePicture ? (
            <Image
              source={{ uri: profilePicture }}
              style={editProfile.profilePicture}
            />
          ) : (
            <View style={editProfile.defaultProfilePicture}>
              <Icon name="user" size={50} color="#888" />
            </View>
          )}
          <TouchableOpacity
            style={editProfile.editButton}
            onPress={handleProfilePictureEdit}>
            <Icon name="edit" size={17} color="white" />
          </TouchableOpacity>
        </View>
        <InputField
          placeholder="Name"
          value={name}
          onChangeText={setName}
          validate={validateAlphabet}
        />
        <DropdownComponent
          data={genderData}
          placeholder="Gender"
          selectedValue={gender}
          onValueChange={setGender}
        />
        <InputField
          placeholder="Phone Number"
          value={phone}
          onChangeText={setPhone}
          validate={() => true}
          editable={false}
          inputStyle={{ color: 'grey' }}
        />
        <InputField
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          validate={() => true}
          editable={false}
          inputStyle={{ color: 'grey' }}
        />
        <InputField
          placeholder="Bio..."
          value={bio}
          onChangeText={setBio}
          multiline={true}
          validate={() => true}
        />
        <InputField
          placeholder="Old Password"
          value={oldPassword}
          onChangeText={setOldPassword}
          secureTextEntry={true}
          validate={passwordChecking}
          requirementText="Password must match with the old password."
        />
        <InputField
          placeholder="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry={true}
          validate={validatePassword}
          requirementText="Password must have at least 8 characters, with 1 uppercase letter and 1 symbol."
        />
        <InputField
          placeholder="Retype New Password"
          value={retypePassword}
          onChangeText={setRetypePassword}
          secureTextEntry={true}
          validate={() => validateRetypePassword(retypePassword)}
          requirementText="Passwords must match"
        />
        <View style={editProfile.buttonContainer}>
          <DesignedButton
            title="Update Profile"
            disabled={!changeMade}
            theme={changeMade ? 'success' : 'failed'}
            onPress={handleUpdateProfile}
          />
        </View>
        <View style={editProfile.buttonContainer}>
          <DesignedButton
            title="Delete Account"
            onPress={() => setModalVisible(true)}
            theme={'danger'}
          />
        </View>
        <Modal
          transparent={true}
          visible={modalVisible}
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}>
          <View style={popUpBox.modalContainer}>
            <View style={popUpBox.modalContent}>
              <Text style={popUpBox.modalTitle}>Delete Account</Text>
              <Text style={popUpBox.modalMessage}>
                You won't be able to recover your account once it has been permanently deleted.
              </Text>
              <View style={popUpBox.modalButtons}>
                <TouchableOpacity
                  style={[popUpBox.button, popUpBox.cancelButton]}
                  onPress={() => setModalVisible(false)}>
                  <Text style={popUpBox.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[popUpBox.button, popUpBox.confirmButton]}
                  onPress={handleDeleteAccount}>
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

const editProfile = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fce7cc',
  },
  inputContainer: {
    padding: 20,
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ddd',
    borderWidth: 2,
    borderColor: 'gray',
  },
  defaultProfilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F26419',
  },
  editButton: {
    position: 'absolute',
    bottom: 5,
    left: '56%',
    backgroundColor: '#000',
    borderRadius: 17,
    padding: 5,
  },
  buttonContainer: {
    marginTop: 10,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#F26419',
    height: 40,
  },
  headerInput: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EBEBEB',
    marginHorizontal: 10,
  },
});

export default EditProfile;