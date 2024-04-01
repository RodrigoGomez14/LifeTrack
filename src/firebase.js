import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';

const firebaseConfig = {
  apiKey: "AIzaSyCTHOI-Xv3aNLiSsEr2R7PtPGwhfNVTYO4",
  authDomain: "lifetrack-fbd7b.firebaseapp.com",
  projectId: "lifetrack-fbd7b",
  storageBucket: "lifetrack-fbd7b.appspot.com",
  messagingSenderId: "918248715963",
  appId: "1:918248715963:web:c5c2d623f668b7cfc8db9e",
  measurementId: "G-M8X8DET70W"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const database = firebase.database();

