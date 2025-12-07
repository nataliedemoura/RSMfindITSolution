// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDfwVaTGy7GlHbX75imn__YSt2vqWVDlJY",
  authDomain: "rsm-findit-solution.firebaseapp.com",
  projectId: "rsm-findit-solution",
  storageBucket: "rsm-findit-solution.firebasestorage.app",
  messagingSenderId: "373279245844",
  appId: "1:373279245844:web:b5b6cdc601f43a9850c901",
  measurementId: "G-86HW0PCTK4"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Make Firebase services available globally
window.db = firebase.firestore();
window.auth = firebase.auth();
window.storage = firebase.storage();

console.log('Firebase initialized successfully');