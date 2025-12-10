let selectedClaimItem = null;
let isDrawing = false;

// Initialize signature pad
function initSignaturePad() {
    const canvas = document.getElementById('signaturePad');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    let drawing = false;
    let lastX = 0;
    let lastY = 0;

    // Mouse events
    canvas.addEventListener('mousedown', (e) => {
        drawing = true;
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        lastX = e.clientX - rect.left;
        lastY = e.clientY - rect.top;
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!drawing) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        
        lastX = x;
        lastY = y;
    });

    canvas.addEventListener('mouseup', () => {
        drawing = false;
    });

    canvas.addEventListener('mouseleave', () => {
        drawing = false;
    });

    // Touch events for mobile
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        drawing = true;
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        lastX = touch.clientX - rect.left;
        lastY = touch.clientY - rect.top;
    });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (!drawing) return;
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        
        lastX = x;
        lastY = y;
    });

    canvas.addEventListener('touchend', () => {
        drawing = false;
    });
}

// Clear signature
function clearSignature() {
    const canvas = document.getElementById('signaturePad');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    isDrawing = false;
}
    
// Get signature as data URL
function getSignatureDataURL() {
    const canvas = document.getElementById('signaturePad');
    if (!canvas) return null;
    return canvas.toDataURL('image/png');
}

// Validate student ID
function validateStudentId() {
    const studentId = document.getElementById('claimStudentId').value.trim();
    const validationMsg = document.getElementById('idValidationMessage');
    
    if (!validationMsg) return true;
    
    // Student ID validation: at least 5 characters (adjust as needed)
    const isValid = studentId.length >= 5;
    
    if (studentId.length > 0 && !isValid) {
        validationMsg.style.display = 'block';
    } else {
        validationMsg.style.display = 'none';
    }
    
    return isValid;
}

// Load available items for claiming
async function loadClaimItems() {
    const container = document.getElementById('claimItemsList');
    if (!container) {
        console.error('claimItemsList container not found');
        return;
    }

    try {
        // Show loading state
        container.innerHTML = '<div style="text-align: center; padding: 2rem; color: #6b7280;">Loading items...</div>';

        // Query items - get all first, then filter
        const snapshot = await db.collection('items').orderBy('date', 'desc').get();

        const availableItems = snapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            .filter(item => !item.claimed); // Filter unclaimed items

        console.log('Loaded available items:', availableItems.length);

        if (availableItems.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #6b7280;">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin: 0 auto 1rem;">
                        <path d="M9 11l3 3L22 4"></path>
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                    </svg>
                    <p>No items available for claiming</p>
                    <p style="font-size: 0.875rem; margin-top: 0.5rem;">All items have been claimed or no items have been posted yet.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = availableItems.map(item => `
            <div class="claim-item" onclick="selectClaimItem('${item.id}')">
                ${item.image ? `<img src="${item.image}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 0.375rem; margin-right: 1rem;">` : ''}
                <div style="flex: 1;">
                    <h4 style="font-weight: 600; font-size: 1.125rem; color: #1f2937; margin-bottom: 0.25rem;">${item.title}</h4>
                    <p style="color: #6b7280; font-size: 0.875rem; margin-bottom: 0.5rem;">${item.description}</p>
                    <div style="display: flex; gap: 1rem; font-size: 0.875rem; color: #374151; flex-wrap: wrap;">
                        <span>📦 ${item.category}</span>
                        <span>📍 ${item.location}</span>
                        <span>📅 ${item.date}</span>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading claim items:', error);
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #dc2626;">
                <p>Failed to load items: ${error.message}</p>
                <button onclick="loadClaimItems()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #1e3a8a; color: white; border: none; border-radius: 0.5rem; cursor: pointer;">
                    Retry
                </button>
            </div>
        `;
    }
}

// Select item to claim
async function selectClaimItem(itemId) {
    // Remove previous selection
    document.querySelectorAll('.claim-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Add selection to clicked item
    event.target.closest('.claim-item').classList.add('selected');
    
    // Open claim modal
    await openClaimModal(itemId);
}

// Open claim verification modal
async function openClaimModal(itemId) {
    try {
        // Fetch full item details
        const doc = await db.collection('items').doc(itemId).get();
        
        if (!doc.exists) {
            alert('Item not found');
            return;
        }
        
        selectedClaimItem = {
            id: doc.id,
            ...doc.data()
        };
        
        // Check if item is still available
        if (selectedClaimItem.claimed) {
            alert('This item has already been claimed');
            await loadClaimItems(); // Refresh the list
            return;
        }
        
        // Clear form
        document.getElementById('claimFullName').value = '';
        document.getElementById('claimStudentId').value = '';
        clearSignature();
        
        // Clear validation message
        const validationMsg = document.getElementById('idValidationMessage');
        if (validationMsg) validationMsg.style.display = 'none';
        
        // Show modal
        document.getElementById('claimModal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Initialize signature pad if not already done
        if (!signaturePad) {
            initSignaturePad();
            signaturePad = true;
        }
    } catch (error) {
        console.error('Error opening claim modal:', error);
        alert('Failed to load item details: ' + error.message);
    }
}

// Close claim modal
function closeClaimModal(event) {
    if (!event || event.target === document.getElementById('claimModal')) {
        document.getElementById('claimModal').classList.add('hidden');
        document.body.style.overflow = '';
        selectedClaimItem = null;
        
        // Clear form
        document.getElementById('claimFullName').value = '';
        document.getElementById('claimStudentId').value = '';
        clearSignature();
        
        // Clear validation messages
        const validationMsg = document.getElementById('idValidationMessage');
        if (validationMsg) validationMsg.style.display = 'none';
    }
}

// Process claim with validation
async function processClaim() {
    const fullName = document.getElementById('claimFullName').value.trim();
    const studentId = document.getElementById('claimStudentId').value.trim();
    
    // Validation
    if (!fullName || fullName.length < 2) {
        alert('Please enter the student\'s full name');
        document.getElementById('claimFullName').focus();
        return;
    }
    
    if (!studentId || !validateStudentId()) {
        alert('Please enter a valid student ID number (at least 5 characters)');
        document.getElementById('claimStudentId').focus();
        return;
    }
    
    if (!hasSignature()) {
        alert('Please provide a signature');
        return;
    }
    
    if (!selectedClaimItem) {
        alert('No item selected');
        return;
    }
    
    // Confirm before processing
    const confirmMsg = `Confirm item sign out:\n\nItem: ${selectedClaimItem.title}\nStudent: ${fullName}\nStudent ID: ${studentId}\n\nIs this correct?`;
    
    if (!confirm(confirmMsg)) {
        return;
    }
    
    // Disable button to prevent double submission
    const submitBtn = event.target;
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';
        
        // Update item in Firestore
        await db.collection('items').doc(selectedClaimItem.id).update({
            claimed: true,
            claimedAt: firebase.firestore.FieldValue.serverTimestamp(),
            claimedByName: fullName,
            claimedByStudentId: studentId,
            claimedByStaff: currentUser ? currentUser.uid : 'unknown'
        });
        
        alert(`Item successfully signed out to ${fullName}\nStudent ID: ${studentId}`);
        
        // Close modal and refresh list
        closeClaimModal();
        await loadClaimItems();
        
    } catch (error) {
        console.error('Error processing claim:', error);
        alert('Failed to process claim: ' + error.message);
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Add keyboard shortcut to close modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('claimModal');
        if (modal && !modal.classList.contains('hidden')) {
            closeClaimModal();
        }
    }
});

// Initialize claim page
window.onload = function() {
    // Wait for auth state
    auth.onAuthStateChanged(async (user) => {
        if (!user) {
            console.log('No user logged in, redirecting to login...');
            window.location.href = 'login.html';
            return;
        }
        
        currentUser = user;
        console.log('User authenticated:', user.email);
        
        try {
            await loadClaimItems();
        } catch (error) {
            console.error('Error loading items:', error);
            alert('Failed to load items. Please refresh the page.');
        }
    });

};


