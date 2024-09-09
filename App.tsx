import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import App1 from './navigation/LoginNavigator';
import NetInfo from '@react-native-community/netinfo';
import SQLite from 'react-native-sqlite-storage';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';

// Enable promises for SQLite
SQLite.enablePromise(true);

const App = () => {
  const [sqliteDb, setSqliteDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Initialize SQLite Database
  useEffect(() => {
    const initDatabase = async () => {
      try {
        console.log('Attempting to open database...');
        const db = await SQLite.openDatabase({ name: 'UserDatabase.db', location: 'default' });
        console.log('Database opened successfully');
        setSqliteDb(db);
    
        // Check if the table exists and has the correct schema
        const [tableInfo] = await db.executeSql('PRAGMA table_info(users)');
        const hasCorrectSchema = tableInfo.rows.raw().some(col => col.name === 'synced');
    
        if (!hasCorrectSchema) {
          console.log('Incorrect schema detected. Recreating users table...');
          await db.executeSql('DROP TABLE IF EXISTS users');
          await db.executeSql(
            'CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, phone TEXT, gender TEXT, email TEXT, password TEXT, joinedAt TEXT, synced INTEGER DEFAULT 0)'
          );
          console.log('Users table recreated with correct schema');
        } else {
          console.log('Users table exists with correct schema');
        }
    
        // Verify the table schema
        const [verifySchema] = await db.executeSql('PRAGMA table_info(users)');
        console.log('Current table schema:', JSON.stringify(verifySchema.rows.raw()));
    
      } catch (error) {
        console.error('Error initializing database:', error);
      }
    };

    initDatabase();

    // Check initial network status
    NetInfo.fetch().then(state => {
      setIsOnline(state.isConnected ?? false);
      console.log('Initial network status:', state.isConnected ? 'online' : 'offline');
    });

    // Subscribe to network status changes
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
      console.log('Network status changed:', state.isConnected ? 'online' : 'offline');
    });

    return () => {
      if (sqliteDb) {
        console.log('Closing database connection');
        sqliteDb.close();
      }
      unsubscribe();
    };
  }, []);

  // Sync local data to Firebase when online
  useEffect(() => {
    const syncLocalDataWithFirebase = async () => {
      if (isOnline && sqliteDb) {
        console.log('Attempting to sync local data with Firebase...');
        try {
          const [results] = await sqliteDb.executeSql('SELECT * FROM users WHERE synced = 0');
          console.log(`Found ${results.rows.length} unsynced users`);
          
          const unsyncedUsers = [];

          for (let i = 0; i < results.rows.length; i++) {
            unsyncedUsers.push(results.rows.item(i));
          }

          for (const user of unsyncedUsers) {
            const userDocRef = doc(db, 'users', user.email);

            // Check if user already exists in Firebase
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
              console.log(`Syncing user ${user.email} to Firebase...`);
              await setDoc(userDocRef, {
                name: user.name,
                phone: user.phone,
                gender: user.gender,
                email: user.email,
                password: user.password,
                joinedAt: serverTimestamp(),
              });

              // Mark the user as synced in SQLite
              await sqliteDb.executeSql('UPDATE users SET synced = 1 WHERE id = ?', [user.id]);
              console.log(`User ${user.email} synced with Firebase.`);
            } else {
              console.log(`User ${user.email} already exists in Firebase, skipping...`);
            }
          }
          console.log('Sync process completed');
        } catch (error) {
          console.error('Error syncing with Firebase:', error);
        }
      } else {
        console.log('Not online or SQLite DB not initialized, skipping sync');
      }
    };

    if (isOnline) {
      syncLocalDataWithFirebase();
    }
  }, [isOnline, sqliteDb]);

  return (
    <NavigationContainer>
      <App1 />
    </NavigationContainer>
  );
};

export default App;