// Global data
let items = [];
let currentUser = null;

// Load items from Firestore
async function loadItemsFromFirestore() {
    try {
        const snapshot = await db.collection('items').orderBy('date', 'desc').get();
        items = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        console.log('Loaded items:', items.length);
        return items;
    } catch (error) {
        console.error('Error loading items:', error);
        alert('Failed to load items from database: ' + error.message);
        return [];
    }
}

// Listen for authentication state changes
auth.onAuthStateChanged(async (user) => {
    if (user) {
        currentUser = user;
        console.log('User logged in:', user.email);
        
        // Load user profile from Firestore
        try {
            const userDoc = await db.collection('users').doc(user.uid).get();
            if (userDoc.exists && document.getElementById('userName')) {
                document.getElementById('userName').textContent = userDoc.data().name;
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    } else {
        currentUser = null;
        console.log('User logged out');
    }
});

// Check if user is authenticated (for protected pages)
function checkAuth() {
    return new Promise((resolve) => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            unsubscribe();
            if (!user) {
                window.location.href = 'login.html';
                resolve(null);
            } else {
                resolve(user);
            }
        });
    });
}