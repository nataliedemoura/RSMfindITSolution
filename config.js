// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDSeMIZ3OBwArgmZHYWpthMoY2gHlx4j2U",
    authDomain: "it-capstone-e5fd1.firebaseapp.com",
    projectId: "it-capstone-e5fd1",
    storageBucket: "it-capstone-e5fd1.firebasestorage.app",
    messagingSenderId: "1008409958623",
    appId: "1:1008409958623:web:8ca6af3c63b56e0185b16a",
    measurementId: "G-BYHJVS9RRZ"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();