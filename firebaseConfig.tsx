import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';


const firebaseConfig = {
    apiKey: "AIzaSyBHAqTw96QLmzvuSiuzl3CE4fiBawG_1oE", // From the api_key array
    authDomain: "tastier-67ddf.firebaseapp.com", // Usually project_id + ".firebaseapp.com"
    projectId: "tastier-67ddf", // From project_id
    storageBucket: "tastier-67ddf.appspot.com", // From storage_bucket
    messagingSenderId: "221341209847", // From project_number
    appId: "1:221341209847:android:a195767637585aa3dceff2" // From mobilesdk_app_id
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
