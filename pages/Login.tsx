import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
} from 'react-native';
import Icons from 'react-native-vector-icons/Ionicons';
import InputField from '../assets/components/InputFieldWithValidation';
import DesignedButton from '../assets/components/ButtonComponent';
import Logo from '../assets/components/LogoComponent';
import { popUpBox } from './style';
import { CommonActions } from '@react-navigation/native';
import { doc, getDoc } from 'firebase/firestore';
import { db as firebaseDb } from '../firebaseConfig';
import SQLite from 'react-native-sqlite-storage';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';  // Import AsyncStorage


SQLite.enablePromise(true);

let db: SQLite.SQLiteDatabase | null = null;

const initDatabase = async () => {
  try {
    db = await SQLite.openDatabase({ name: 'UserDatabase.db', location: 'default' });
    console.log('Database opened successfully');
    await createTable();
  } catch (error) {
    console.error('Error opening database', error);
  }
};

const createTable = async () => {
  if (!db) {
    console.error('Database not initialized');
    return;
  }
  try {
    await db.executeSql(
      'CREATE TABLE IF NOT EXISTS Users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE, password TEXT)'
    );
    console.log('Table created successfully');
  } catch (error) {
    console.error('Error creating table', error);
  }
};

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [modalVisible, setModalVisible] = useState(false);
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [isEmailValid, setIsEmailValid] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    initDatabase();
    checkStoredSession();  // Check for stored session when component mounts
    checkNetworkStatus();
    return () => {
      if (db) {
        db.close();
      }
    };
  }, []);

  const checkNetworkStatus = () => {
    NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });
  };

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password: string) => password.trim() !== '';

  useEffect(() => {
    setIsFormValid(validateEmail(email) && validatePassword(password));
  }, [email, password]);

  useEffect(() => {
    setIsEmailValid(validateEmail(email));
  }, [email]);

  const handleForgotPassword = () => {
    setModalVisible(true);
  };

  const handleSendResetLink = () => {
    console.log(`Password reset requested for: ${email}`);
    setModalVisible(false);
    setEmail('');
    // Implement password reset logic here
  };

  const saveUserToSQLite = async (email: string, password: string) => {
    if (!db) {
      console.error('Database not initialized');
      return;
    }
    try {
      await db.executeSql(
        'INSERT OR REPLACE INTO Users (email, password) VALUES (?, ?)',
        [email, password]
      );
      console.log('User saved to SQLite');
    } catch (error) {
      console.error('Error saving user to SQLite', error);
    }
  };

  const checkUserInSQLite = async (email: string, password: string): Promise<boolean> => {
    if (!db) {
      console.error('Database not initialized');
      return false;
    }
    try {
      const [results] = await db.executeSql(
        'SELECT * FROM Users WHERE email = ? AND password = ?',
        [email, password]
      );
      return results.rows.length > 0;
    } catch (error) {
      console.error('Error checking user in SQLite', error);
      return false;
    }
  };

  // Function to save user session in AsyncStorage
  const saveSessionToAsyncStorage = async (userEmail: string) => {
    try {
      await AsyncStorage.setItem('userEmail', userEmail);
      console.log('User session saved to AsyncStorage');
    } catch (error) {
      console.error('Error saving session to AsyncStorage', error);
    }
  };

  // Function to check if a session exists in AsyncStorage
  const checkStoredSession = async () => {
    try {
      const storedEmail = await AsyncStorage.getItem('userEmail');
      if (storedEmail) {
        // If session exists, navigate to the main screen
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'MainScreen', params: { userEmail: storedEmail } }],
          })
        );
      }
    } catch (error) {
      console.error('Error checking AsyncStorage for session:', error);
    }
  };

  const handleLogin = async () => {
    if (isFormValid) {
      if (isOnline) {
        try {
          const userDocRef = doc(firebaseDb, 'users', email);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.password === password) {
              await saveUserToSQLite(email, password);
              await saveSessionToAsyncStorage(email); // Save session in AsyncStorage
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'MainScreen', params: { userEmail: email } }],
                }),
              );
            } else {
              Alert.alert('Login Failed', 'Incorrect email or password.');
            }
          } else {
            Alert.alert('Login Failed', 'User not found.');
          }
        } catch (error) {
          console.error('Error during login:', error);
          Alert.alert('Login Failed', 'An error occurred during login.');
        }
      } else {
        // Offline login
        const isValidUser = await checkUserInSQLite(email, password);
        if (isValidUser) {
          await saveSessionToAsyncStorage(email);  // Save session for offline use
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'MainScreen', params: { userEmail: email } }],
            }),
          );
        } else {
          Alert.alert('Login Failed', 'Incorrect email or password or no offline data available.');
        }
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.backIcon}>
        <TouchableOpacity onPress={() => navigation.navigate('WelcomeScreen')}>
          <Icons name="chevron-back-outline" size={30} color="#f26419" />
        </TouchableOpacity>
      </View>
      <View style={styles.logo}>
        <Logo />
      </View>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Login</Text>
      </View>
      <View style={styles.container}>
        <InputField
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          validate={validateEmail}
          requirementText="Email is required."
        />

        <InputField
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          validate={validatePassword}
          requirementText="Password is required."
        />
      </View>

      <View style={styles.buttonContainer}>
        <DesignedButton
          title="Login"
          onPress={handleLogin}
          theme="login"
          disabled={!isFormValid}
        />
      </View>
      <View style={styles.buttonContainer}>
        <DesignedButton
          title="Create Account"
          onPress={() => navigation.navigate('CreateAccount')}
          theme="createAccount"
        />
      </View>
      <TouchableOpacity onPress={handleForgotPassword}>
        <Text style={styles.forgotPasswordText}>
          Forgot your password? Click Me!
        </Text>
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Forgot Password</Text>
            <InputField
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              validate={validateEmail}
              requirementText="Email must be in a valid format."
              keyboardType="email-address"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.confirmButton,
                  {opacity: !isEmailValid ? 0.6 : 1},
                ]}
                onPress={handleSendResetLink}
                disabled={!isEmailValid}>
                <Text style={styles.buttonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#fce7cc',
  },
  container: {
    paddingHorizontal: 20,
    margin: 20,
    width: '95%',
    justifyContent: 'center',
    alignSelf: 'center',
    borderRadius: 10,
  },
  backIcon: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
  },
  buttonContainer: {
    marginTop: 10,
    alignSelf: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#010100',
  },
  titleContainer: {
    marginBottom: 20,
    alignSelf: 'center',
  },
  logo: {
    alignSelf: 'center',
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  forgotPasswordText: {
    color: '#545454',
    fontSize: 14,
    marginTop: 20,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    width: '45%',
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  confirmButton: {
    backgroundColor: '#f26419',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
});

export default LoginScreen;
