// Firebase configuration
const firebaseConfig = {
  apiKey: "",
  authDomain: "rsm-findit-solution.firebaseapp.com",
  projectId: "rsm-findit-solution",
  storageBucket: "rsm-findit-solution.firebasestorage.app",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Make Firebase services available globally
window.db = firebase.firestore();
window.auth = firebase.auth();
window.storage = firebase.storage();


console.log('Firebase initialized successfully');
