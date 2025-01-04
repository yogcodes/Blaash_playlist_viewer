import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBQAvfGK6xAdqbACRg8XjCorj1MYjQEag0",
  authDomain: "playlist-manager-e0740.firebaseapp.com",
  databaseURL: "https://playlist-manager-e0740.firebaseio.com",
  projectId: "playlist-manager-e0740",
  storageBucket: "playlist-manager-e0740.appspot.com",
  messagingSenderId: "405963918468",
  appId: "1:405963918468:web:299d46ae4f9187d98a06d1",
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const auth = getAuth(app);
