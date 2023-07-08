import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDMY2wGmHlbxyxcl-G8kpR781H0MKku_ZA",
  authDomain: "gallerydermie.firebaseapp.com",
  projectId: "gallerydermie",
  storageBucket: "gallerydermie.appspot.com",
  messagingSenderId: "963133082354",
  appId: "1:963133082354:web:d7f09a73f53c7a77c9de6b",
  measurementId: "G-0QGEPGZRYT"
};
const app = initializeApp(firebaseConfig);

export const storage = getStorage(app);

