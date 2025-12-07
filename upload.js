let uploadedImage = null;
let cameraStream = null;
let capturedPhotoBlob = null;

// Handle file selection
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedImage = e.target.result;
            document.getElementById('imagePreview').src = uploadedImage;
            document.getElementById('imagePreview').classList.remove('hidden');
            document.getElementById('clearPhotoBtn').classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
}

// Clear photo
function clearPhoto() {
    uploadedImage = null;
    capturedPhotoBlob = null;
    document.getElementById('imagePreview').src = '';
    document.getElementById('imagePreview').classList.add('hidden');
    document.getElementById('clearPhotoBtn').classList.add('hidden');
    document.getElementById('fileInput').value = '';
}

// Detect if user is on mobile
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Open camera modal with improved mobile support
async function openCamera() {
    const modal = document.getElementById('cameraModal');
    const video = document.getElementById('cameraStream');
    const canvas = document.getElementById('photoCanvas');
    const captureBtn = document.getElementById('captureBtn');
    const retakeBtn = document.getElementById('retakeBtn');
    const usePhotoBtn = document.getElementById('usePhotoBtn');
    
    modal.classList.remove('hidden');
    
    // Reset UI
    video.classList.remove('hidden');
    canvas.classList.add('hidden');
    captureBtn.classList.remove('hidden');
    retakeBtn.classList.add('hidden');
    usePhotoBtn.classList.add('hidden');
    
    try {
        // Check if getUserMedia is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Camera API not supported on this device/browser');
        }

        // Mobile-friendly camera constraints
        const constraints = {
            video: {
                facingMode: isMobileDevice() ? { ideal: 'environment' } : 'user',
                width: { ideal: 1920, max: 1920 },
                height: { ideal: 1080, max: 1080 }
            },
            audio: false
        };

        console.log('Requesting camera access with constraints:', constraints);
        
        // Request camera access
        cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
        
        console.log('Camera access granted');
        
        // Set video source
        video.srcObject = cameraStream;
        
        // Important for iOS: explicitly set attributes
        video.setAttribute('playsinline', 'true');
        video.setAttribute('autoplay', 'true');
        video.muted = true;
        
        // Wait for video to be ready and play
        video.onloadedmetadata = () => {
            console.log('Video metadata loaded');
            video.play().then(() => {
                console.log('Video playing successfully');
            }).catch(err => {
                console.error('Error playing video:', err);
                alert('Failed to start camera preview. Please try again.');
            });
        };
        
    } catch (error) {
        console.error('Camera error:', error);
        
        let errorMessage = 'Could not access camera. ';
        
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
            errorMessage += 'Camera permission was denied. Please enable camera access in your browser settings.';
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
            errorMessage += 'No camera found on this device.';
        } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
            errorMessage += 'Camera is already in use by another application.';
        } else if (error.name === 'OverconstrainedError') {
            errorMessage += 'Camera does not meet requirements. Trying fallback...';
            
            // Try with simpler constraints
            try {
                cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
                video.srcObject = cameraStream;
                video.setAttribute('playsinline', 'true');
                video.play();
                return;
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
            }
        } else if (error.name === 'SecurityError') {
            errorMessage += 'Camera access blocked. Make sure you are using HTTPS or localhost.';
        } else {
            errorMessage += error.message || 'Unknown error occurred.';
        }
        
        alert(errorMessage + '\n\nPlease use "Upload from Files" instead.');
        closeCameraModal();
    }
}

// Capture photo from camera
function capturePhoto() {
    const video = document.getElementById('cameraStream');
    const canvas = document.getElementById('photoCanvas');
    const captureBtn = document.getElementById('captureBtn');
    const retakeBtn = document.getElementById('retakeBtn');
    const usePhotoBtn = document.getElementById('usePhotoBtn');
    
    // Check if video is ready
    if (!video.videoWidth || !video.videoHeight) {
        alert('Camera not ready. Please wait a moment and try again.');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    console.log('Capturing photo - dimensions:', canvas.width, 'x', canvas.height);
    
    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to blob
    canvas.toBlob(function(blob) {
        if (blob) {
            capturedPhotoBlob = blob;
            console.log('Photo captured successfully:', (blob.size / 1024).toFixed(2), 'KB');
        } else {
            console.error('Failed to create blob from canvas');
            alert('Failed to capture photo. Please try again.');
            return;
        }
    }, 'image/jpeg', 0.9);
    
    // Show canvas, hide video
    video.classList.add('hidden');
    canvas.classList.remove('hidden');
    
    // Update buttons
    captureBtn.classList.add('hidden');
    retakeBtn.classList.remove('hidden');
    usePhotoBtn.classList.remove('hidden');
}

// Retake photo
function retakePhoto() {
    const video = document.getElementById('cameraStream');
    const canvas = document.getElementById('photoCanvas');
    const captureBtn = document.getElementById('captureBtn');
    const retakeBtn = document.getElementById('retakeBtn');
    const usePhotoBtn = document.getElementById('usePhotoBtn');
    
    // Show video, hide canvas
    video.classList.remove('hidden');
    canvas.classList.add('hidden');
    
    // Update buttons
    captureBtn.classList.remove('hidden');
    retakeBtn.classList.add('hidden');
    usePhotoBtn.classList.add('hidden');
    
    capturedPhotoBlob = null;
}

// Use captured photo
function usePhoto() {
    if (!capturedPhotoBlob) {
        alert('No photo captured. Please take a photo first.');
        return;
    }
    
    // Convert blob to data URL for preview
    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedImage = e.target.result;
        document.getElementById('imagePreview').src = uploadedImage;
        document.getElementById('imagePreview').classList.remove('hidden');
        document.getElementById('clearPhotoBtn').classList.remove('hidden');
    };
    reader.readAsDataURL(capturedPhotoBlob);
    
    closeCameraModal();
}

// Close camera modal
function closeCameraModal(event) {
    if (event && event.target !== document.getElementById('cameraModal')) {
        return;
    }
    
    const modal = document.getElementById('cameraModal');
    const video = document.getElementById('cameraStream');
    
    // Stop camera stream
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => {
            track.stop();
            console.log('Camera track stopped');
        });
        cameraStream = null;
    }
    
    modal.classList.add('hidden');
    video.srcObject = null;
}

// Submit upload to Firestore
async function submitUpload() {
    const category = document.getElementById('uploadCategory').value;
    const title = document.getElementById('uploadTitle').value;
    const description = document.getElementById('uploadDescription').value;
    const location = document.getElementById('uploadLocation').value;
    const date = document.getElementById('uploadDate').value;

    if (!category || !title || !description || !location || !date) {
        alert('Please fill in all fields');
        return;
    }

    let imageUrl = null;

    try {
        // Upload image to Firebase Storage if present
        if (capturedPhotoBlob) {
            // Upload captured photo (blob)
            const storageRef = storage.ref(`items/${Date.now()}_camera_photo.jpg`);
            const snapshot = await storageRef.put(capturedPhotoBlob);
            imageUrl = await snapshot.ref.getDownloadURL();
            console.log('Camera photo uploaded:', imageUrl);
        } else if (document.getElementById('fileInput').files[0]) {
            // Upload file from file input
            const imageFile = document.getElementById('fileInput').files[0];
            const storageRef = storage.ref(`items/${Date.now()}_${imageFile.name}`);
            const snapshot = await storageRef.put(imageFile);
            imageUrl = await snapshot.ref.getDownloadURL();
            console.log('File uploaded:', imageUrl);
        }

        const newItem = {
            type: 'found',
            category,
            title,
            description,
            location,
            date,
            image: imageUrl,
            claimed: false, // Important for claim.js to work!
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            uploadedBy: currentUser ? currentUser.uid : 'anonymous'
        };

        // Save to Firestore
        await db.collection('items').add(newItem);
        
        alert('Item posted successfully!');
        
        // Clear form
        document.getElementById('uploadCategory').value = '';
        document.getElementById('uploadTitle').value = '';
        document.getElementById('uploadDescription').value = '';
        document.getElementById('uploadLocation').value = '';
        document.getElementById('uploadDate').value = '';
        clearPhoto();
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    } catch (error) {
        console.error('Error saving item:', error);
        alert('Failed to save item: ' + error.message);
    }
}

// Initialize upload page
window.onload = async function() {
    await checkAuth();
    
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('uploadDate').value = today;
};