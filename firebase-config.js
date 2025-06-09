// firebase-config.js

// Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyCwHY95KSWOB1dsYyJD_K_ncW6LUBYPyd4",
    authDomain: "wedding-quiz-223d8.firebaseapp.com",
    databaseURL: "https://wedding-quiz-223d8-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "wedding-quiz-223d8",
    storageBucket: "wedding-quiz-223d8.firebasestorage.app",
    messagingSenderId: "427025920150",
    appId: "1:427025920150:web:e0fd4bb9eed537a02712b7"
  };


  // Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();